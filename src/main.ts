import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

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
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS Auth API')
    .setDescription(
      `## Overview\n\nA JWT-based authentication API built with NestJS, Prisma, and PostgreSQL.\n\n` +
        `## Authentication\n\nMost endpoints require a JWT **access token**. After login or signup, copy the ` +
        `\`accessToken\` value and click **Authorize** (top right), then enter \`Bearer <token>\`.\n\n` +
        `The \`POST /auth/refresh\` endpoint uses your **refresh token** in the same way.\n\n` +
        `## Token Lifecycle\n\n` +
        `| Token | Default TTL | Notes |\n` +
        `|-------|-------------|-------|\n` +
        `| Access | 15 min | Short-lived, sent with every request |\n` +
        `| Refresh | 7 days | Rotated on each use — old token invalidated immediately |`,
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Paste your access token (or refresh token for /auth/refresh)',
    })
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
