import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  readonly db: InstanceType<typeof PrismaClient>;
  readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // max connections in pool
      min: 2, // keep 2 warm at all times
      idleTimeoutMillis: 30_000, // close idle connections after 30s
      connectionTimeoutMillis: 5_000, // throw if no connection available in 5s
    });

    this.pool.on('error', (err) =>
      this.logger.error('Postgres pool error', err.message),
    );

    const adapter = new PrismaPg(this.pool);
    this.db = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.db.$connect();
    this.logger.log(`Postgres pool ready (max: 10, min: 2)`);
  }

  async onModuleDestroy() {
    await this.db.$disconnect();
    await this.pool.end();
  }
}
