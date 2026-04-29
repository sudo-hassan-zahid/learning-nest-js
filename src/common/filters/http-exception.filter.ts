import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';
import { Prisma } from '@prisma/client';
import { REQUEST_ID_HEADER } from '../middleware/correlation-id.middleware.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const requestId = req.headers[REQUEST_ID_HEADER] as string | undefined;
    const { statusCode, message } = this.resolve(exception);

    const body = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
      requestId,
    };

    if (statusCode >= 500) {
      this.logger.error(
        `${req.method} ${req.url} → ${statusCode}  [${requestId}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${req.method} ${req.url} → ${statusCode}  [${requestId}] ${message}`,
      );
    }

    res.status(statusCode).json(body);
  }

  private resolve(exception: unknown): { statusCode: number; message: string } {
    // NestJS HTTP exceptions (HttpException, UnauthorizedException, etc.)
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : Array.isArray((res as any).message)
            ? (res as any).message[0] // first validation error
            : ((res as any).message ?? exception.message);

      return { statusCode: exception.getStatus(), message };
    }

    // Rate limiter
    if (exception instanceof ThrottlerException) {
      return {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests — slow down',
      };
    }

    // Prisma known errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with that value already exists',
        };
      }
      if (exception.code === 'P2025') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      }
    }

    // Prisma validation errors
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid database query',
      };
    }

    // Everything else is a 500
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
