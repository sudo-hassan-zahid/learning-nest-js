import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  });

  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS Auth API')
    .setDescription(
      `## Overview\n\nA JWT-based authentication API built with NestJS, Prisma, and PostgreSQL.\n\n` +
        `## Authentication\n\nTokens are stored in **HTTP-only secure cookies** — the browser sends them automatically on every request.\n\n` +
        `| Cookie | TTL | Notes |\n` +
        `|--------|-----|-------|\n` +
        `| \`accessToken\` | 15 min | Sent with every protected request |\n` +
        `| \`refreshToken\` | 7 days | Rotated on each use — old token invalidated immediately |`,
    )
    .setVersion('1.0')
    .addCookieAuth(
      'accessToken',
      { type: 'apiKey', in: 'cookie', name: 'accessToken' },
      'accessToken',
    )
    .addCookieAuth(
      'refreshToken',
      { type: 'apiKey', in: 'cookie', name: 'refreshToken' },
      'refreshToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    customSiteTitle: 'NestJS Auth API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
