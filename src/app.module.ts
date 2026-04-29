import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { TagsModule } from './tags/tags.module';
import { ShareModule } from './share/share.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 100 }, // 100 req/min for all routes
      { name: 'auth', ttl: 60_000, limit: 100 }, // overridden per-route via @AuthThrottle
    ]),
    RedisModule,
    MailModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    TagsModule,
    ShareModule,
    UploadModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
