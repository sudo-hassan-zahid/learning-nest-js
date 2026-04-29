import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '../common/decorators/throttle.decorator.js';
import { PrismaHealthIndicator } from './indicators/prisma.health.js';
import { RedisHealthIndicator } from './indicators/redis.health.js';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Full health check — app, DB, Redis, memory' })
  check() {
    return this.health.check([
      () => this.prisma.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024), // 300 MB
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),   // 512 MB
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe — confirms the process is running' })
  live() {
    return { status: 'ok', uptime: Math.floor(process.uptime()) };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe — confirms DB and Redis are reachable' })
  ready() {
    return this.health.check([
      () => this.prisma.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
