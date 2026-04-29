import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.db.$queryRaw`SELECT 1`;
      const pool = this.prisma.pool;
      return this.getStatus(key, true, {
        pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        },
      });
    } catch (err) {
      throw new HealthCheckError(
        'Postgres check failed',
        this.getStatus(key, false, { error: (err as Error).message }),
      );
    }
  }
}
