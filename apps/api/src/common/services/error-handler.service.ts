import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoggerService, MonitoringService } from '@shopify-quiz-builder/common';
import {
  BaseException,
  QuizNotFoundException,
  QuestionNotFoundException,
  ShopifyApiException,
  DatabaseException,
  PrismaException,
} from '../exceptions';

export interface ErrorContext {
  service: string;
  method: string;
  userId?: string;
  shopId?: string;
  quizId?: string;
  questionId?: string;
  requestId?: string;
  additionalData?: Record<string, any>;
}

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  constructor(
    private readonly loggerService: LoggerService,
    private readonly monitoringService: MonitoringService,
  ) {}

  /**
   * Handle Prisma database errors and convert them to appropriate custom exceptions
   */
  handlePrismaError(error: Prisma.PrismaClientKnownRequestError, context: ErrorContext): never {
    // Log the error with context
    this.loggerService.log('Prisma error handled', {
      service: context.service,
      method: context.method,
      requestId: context.requestId,
      userId: context.userId,
      shopId: context.shopId,
      errorCode: error.code,
      target: error.meta?.target,
      meta: error.meta,
    });

    // Record error metric
    this.monitoringService.recordMetric('prisma_error', 1, 'count', {
      errorCode: error.code,
      service: context.service,
      method: context.method,
    });

    // Convert to custom exception
    throw new PrismaException(error, context.requestId);
  }

  /**
   * Handle unknown database errors
   */
  handleDatabaseError(error: Error, context: ErrorContext): never {
    this.loggerService.log('Database error handled', {
      service: context.service,
      method: context.method,
      requestId: context.requestId,
      userId: context.userId,
      shopId: context.shopId,
      errorMessage: error.message,
      stack: error.stack,
    });

    this.monitoringService.recordMetric('database_error', 1, 'count', {
      service: context.service,
      method: context.method,
      errorType: error.constructor.name,
    });

    throw new DatabaseException(error.message, {
      originalError: error.message,
      stack: error.stack,
      ...context.additionalData,
    }, context.requestId);
  }

  /**
   * Handle Shopify API errors
   */
  handleShopifyError(error: any, context: ErrorContext): never {
    this.loggerService.log('Shopify error handled', {
      service: context.service,
      method: context.method,
      requestId: context.requestId,
      userId: context.userId,
      shopId: context.shopId,
      errorMessage: error.message,
      statusCode: error.statusCode,
      errorCode: error.code,
    });

    this.monitoringService.recordMetric('shopify_error', 1, 'count', {
      service: context.service,
      method: context.method,
      statusCode: error.statusCode?.toString() || 'unknown',
      errorCode: error.code || 'unknown',
    });

    throw new ShopifyApiException(
      error.message || 'Shopify API error occurred',
      error.statusCode || 500,
      {
        originalError: error.message,
        statusCode: error.statusCode,
        ...context.additionalData,
      },
      context.requestId,
    );
  }

  /**
   * Handle validation errors
   */
  handleValidationError(message: string, details: any, context: ErrorContext): never {
    this.loggerService.log('Validation error handled', {
      service: context.service,
      method: context.method,
      requestId: context.requestId,
      userId: context.userId,
      shopId: context.shopId,
      message,
      details,
    });

    this.monitoringService.recordMetric('validation_error', 1, 'count', {
      service: context.service,
      method: context.method,
    });

    // Use appropriate exception based on context
    if (context.quizId) {
      throw new QuizNotFoundException(context.quizId, context.requestId);
    }
    if (context.questionId) {
      throw new QuestionNotFoundException(context.questionId, context.requestId);
    }

    // Generic validation error
    throw new DatabaseException(message, details, context.requestId);
  }

  /**
   * Handle not found errors
   */
  handleNotFoundError(resourceType: string, resourceId: string, context: ErrorContext): never {
    this.loggerService.log('Not found error handled', {
      service: context.service,
      method: context.method,
      requestId: context.requestId,
      userId: context.userId,
      shopId: context.shopId,
      resourceType,
      resourceId,
    });

    this.monitoringService.recordMetric('not_found_error', 1, 'count', {
      service: context.service,
      method: context.method,
      resourceType,
    });

    const message = `${resourceType} with ID '${resourceId}' not found`;
    
    if (resourceType === 'Quiz') {
      throw new QuizNotFoundException(resourceId, context.requestId);
    }
    if (resourceType === 'Question') {
      throw new QuestionNotFoundException(resourceId, context.requestId);
    }

    throw new DatabaseException(message, { resourceType, resourceId }, context.requestId);
  }

  /**
   * Handle access denied errors
   */
  handleAccessDeniedError(resourceType: string, resourceId: string, context: ErrorContext): never {
    this.loggerService.log('Access denied error handled', {
      service: context.service,
      method: context.method,
      requestId: context.requestId,
      userId: context.userId,
      shopId: context.shopId,
      resourceType,
      resourceId,
    });

    this.monitoringService.recordMetric('access_denied_error', 1, 'count', {
      service: context.service,
      method: context.method,
      resourceType,
    });

    throw new ShopifyApiException(
      `Access denied to ${resourceType.toLowerCase()} '${resourceId}'`,
      403,
      { resourceType, resourceId },
      context.requestId,
    );
  }

  /**
   * Log error for monitoring purposes
   */
  logError(error: Error, context: ErrorContext): void {
    this.loggerService.log('Error logged for monitoring', {
      service: context.service,
      method: context.method,
      requestId: context.requestId,
      userId: context.userId,
      shopId: context.shopId,
      errorMessage: error.message,
      errorType: error.constructor.name,
      stack: error.stack,
      ...context.additionalData,
    });

    this.monitoringService.recordMetric('application_error', 1, 'count', {
      service: context.service,
      method: context.method,
      errorType: error.constructor.name,
    });
  }

  /**
   * Create error context object
   */
  createErrorContext(
    service: string,
    method: string,
    additionalData?: Partial<ErrorContext>,
  ): ErrorContext {
    return {
      service,
      method,
      ...additionalData,
    };
  }
}
