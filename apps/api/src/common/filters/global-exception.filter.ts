import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { BaseException, ErrorResponse } from '../exceptions';
import { LoggerService } from '../../../packages/common/src/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly loggerService = new LoggerService();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string || this.generateRequestId();

    let errorResponse: ErrorResponse;
    let statusCode: number;

    // Handle different types of exceptions
    if (exception instanceof BaseException) {
      // Custom application exceptions
      const customException = exception as BaseException;
      statusCode = customException.getStatus();
      errorResponse = customException.getResponse() as ErrorResponse;
      errorResponse.requestId = requestId;
      errorResponse.path = request.url;

      this.loggerService.log('Custom exception caught', {
        service: 'GlobalExceptionFilter',
        method: 'catch',
        requestId,
        errorCode: customException.code,
        statusCode,
        path: request.url,
        method: request.method,
        userId: request.user?.id,
        shopId: request.shop?.id,
      });
    } else if (exception instanceof HttpException) {
      // NestJS HTTP exceptions
      const httpException = exception as HttpException;
      statusCode = httpException.getStatus();
      const message = httpException.getResponse();

      errorResponse = {
        statusCode,
        message: typeof message === 'string' ? message : (message as any).message,
        error: typeof message === 'string' ? 'Bad Request' : (message as any).error,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      };

      this.loggerService.log('HTTP exception caught', {
        service: 'GlobalExceptionFilter',
        method: 'catch',
        requestId,
        statusCode,
        path: request.url,
        method: request.method,
        userId: request.user?.id,
        shopId: request.shop?.id,
      });
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma database errors
      const prismaError = exception as Prisma.PrismaClientKnownRequestError;
      statusCode = this.mapPrismaErrorToHttpStatus(prismaError);
      
      errorResponse = {
        statusCode,
        message: this.getPrismaErrorMessage(prismaError),
        error: 'Database Error',
        code: 'PRISMA_ERROR',
        details: {
          errorCode: prismaError.code,
          target: prismaError.meta?.target,
          meta: prismaError.meta,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      };

      this.loggerService.log('Prisma error caught', {
        service: 'GlobalExceptionFilter',
        method: 'catch',
        requestId,
        errorCode: prismaError.code,
        statusCode,
        path: request.url,
        method: request.method,
        userId: request.user?.id,
        shopId: request.shop?.id,
        details: prismaError.meta,
      });
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      // Unknown Prisma errors
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        statusCode,
        message: 'An unexpected database error occurred',
        error: 'Database Error',
        code: 'UNKNOWN_DATABASE_ERROR',
        details: {
          originalError: exception.message,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      };

      this.loggerService.log('Unknown Prisma error caught', {
        service: 'GlobalExceptionFilter',
        method: 'catch',
        requestId,
        statusCode,
        path: request.url,
        method: request.method,
        userId: request.user?.id,
        shopId: request.shop?.id,
        originalError: exception.message,
      });
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      // Prisma validation errors
      statusCode = HttpStatus.BAD_REQUEST;
      errorResponse = {
        statusCode,
        message: 'Data validation failed',
        error: 'Validation Error',
        code: 'PRISMA_VALIDATION_ERROR',
        details: {
          originalError: exception.message,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      };

      this.loggerService.log('Prisma validation error caught', {
        service: 'GlobalExceptionFilter',
        method: 'catch',
        requestId,
        statusCode,
        path: request.url,
        method: request.method,
        userId: request.user?.id,
        shopId: request.shop?.id,
        originalError: exception.message,
      });
    } else {
      // Unknown errors
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      const error = exception as Error;
      
      errorResponse = {
        statusCode,
        message: 'An unexpected error occurred',
        error: 'Internal Server Error',
        code: 'UNKNOWN_ERROR',
        details: {
          originalError: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      };

      this.loggerService.log('Unknown error caught', {
        service: 'GlobalExceptionFilter',
        method: 'catch',
        requestId,
        statusCode,
        path: request.url,
        method: request.method,
        userId: request.user?.id,
        shopId: request.shop?.id,
        originalError: error.message,
        stack: error.stack,
      });
    }

    // Log the error with stack trace for debugging
    this.logger.error(
      `${request.method} ${request.url} - Status: ${statusCode} - RequestId: ${requestId} - Message: ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : 'No stack trace available',
    );

    // Send the error response
    response.status(statusCode).json(errorResponse);
  }

  private mapPrismaErrorToHttpStatus(prismaError: Prisma.PrismaClientKnownRequestError): number {
    switch (prismaError.code) {
      case 'P2002': // Unique constraint violation
        return HttpStatus.CONFLICT;
      case 'P2003': // Foreign key constraint violation
        return HttpStatus.BAD_REQUEST;
      case 'P2025': // Record not found
        return HttpStatus.NOT_FOUND;
      case 'P2024': // Connection timeout
        return HttpStatus.SERVICE_UNAVAILABLE;
      case 'P2021': // Table does not exist
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case 'P2022': // Column does not exist
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getPrismaErrorMessage(prismaError: Prisma.PrismaClientKnownRequestError): string {
    switch (prismaError.code) {
      case 'P2002':
        const target = prismaError.meta?.target as string[];
        return `A record with this ${target?.join(', ')} already exists`;
      case 'P2003':
        return 'Referenced record does not exist';
      case 'P2025':
        return 'Record not found';
      case 'P2024':
        return 'Database connection timeout';
      case 'P2021':
        return 'Database table not found';
      case 'P2022':
        return 'Database column not found';
      default:
        return 'Database operation failed';
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
