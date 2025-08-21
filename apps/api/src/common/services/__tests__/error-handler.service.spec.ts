import { Test, TestingModule } from '@nestjs/testing';
import { ErrorHandlerService, ErrorContext } from '../error-handler.service';
import { LoggerService, MonitoringService } from '@shopify-quiz-builder/common';
import { Prisma } from '@prisma/client';
import {
  QuizNotFoundException,
  QuestionNotFoundException,
  ShopifyApiException,
  DatabaseException,
  PrismaException,
} from '../../exceptions';

// Mock the services
const mockLoggerService = {
  log: jest.fn(),
};

const mockMonitoringService = {
  recordMetric: jest.fn(),
};

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorHandlerService,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: MonitoringService,
          useValue: mockMonitoringService,
        },
      ],
    }).compile();

    service = module.get<ErrorHandlerService>(ErrorHandlerService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createErrorContext = (overrides: Partial<ErrorContext> = {}): ErrorContext => ({
    service: 'TestService',
    method: 'testMethod',
    requestId: 'req_123',
    userId: 'user_456',
    shopId: 'shop_789',
    ...overrides,
  });

  describe('handlePrismaError', () => {
    it('should handle unique constraint violation (P2002)', () => {
      const prismaError = {
        code: 'P2002',
        message: 'Unique constraint violation',
        meta: { target: ['email'] },
        clientVersion: '4.0.0',
        name: 'PrismaClientKnownRequestError',
      } as unknown as Prisma.PrismaClientKnownRequestError;

      const context = createErrorContext();

      expect(() => service.handlePrismaError(prismaError, context)).toThrow(PrismaException);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Prisma error handled',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          requestId: 'req_123',
          errorCode: 'P2002',
        })
      );
      expect(mockMonitoringService.recordMetric).toHaveBeenCalledWith(
        'prisma_error',
        1,
        'count',
        expect.objectContaining({
          errorCode: 'P2002',
          service: 'TestService',
          method: 'testMethod',
        })
      );
    });

    it('should handle record not found (P2025)', () => {
      const prismaError = {
        code: 'P2025',
        message: 'Record not found',
        meta: {},
        clientVersion: '4.0.0',
        name: 'PrismaClientKnownRequestError',
      } as unknown as Prisma.PrismaClientKnownRequestError;

      const context = createErrorContext();

      expect(() => service.handlePrismaError(prismaError, context)).toThrow(PrismaException);
    });
  });

  describe('handleDatabaseError', () => {
    it('should handle generic database errors', () => {
      const error = new Error('Connection timeout');
      const context = createErrorContext();

      expect(() => service.handleDatabaseError(error, context)).toThrow(DatabaseException);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Database error handled',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          errorMessage: 'Connection timeout',
        })
      );
      expect(mockMonitoringService.recordMetric).toHaveBeenCalledWith(
        'database_error',
        1,
        'count',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          errorType: 'Error',
        })
      );
    });
  });

  describe('handleShopifyError', () => {
    it('should handle Shopify API errors', () => {
      const error = {
        message: 'Rate limit exceeded',
        statusCode: 429,
        code: 'RATE_LIMIT',
      };

      const context = createErrorContext();

      expect(() => service.handleShopifyError(error, context)).toThrow(ShopifyApiException);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Shopify error handled',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          errorMessage: 'Rate limit exceeded',
          statusCode: 429,
          errorCode: 'RATE_LIMIT',
        })
      );
      expect(mockMonitoringService.recordMetric).toHaveBeenCalledWith(
        'shopify_error',
        1,
        'count',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          statusCode: '429',
          errorCode: 'RATE_LIMIT',
        })
      );
    });

    it('should handle Shopify errors without status code', () => {
      const error = {
        message: 'Unknown error',
      };

      const context = createErrorContext();

      expect(() => service.handleShopifyError(error, context)).toThrow(ShopifyApiException);
    });
  });

  describe('handleValidationError', () => {
    it('should handle generic validation errors', () => {
      const message = 'Invalid input data';
      const details = { field: 'email', value: 'invalid-email' };
      const context = createErrorContext();

      expect(() => service.handleValidationError(message, details, context)).toThrow();
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Validation error handled',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          message,
          details,
        })
      );
      expect(mockMonitoringService.recordMetric).toHaveBeenCalledWith(
        'validation_error',
        1,
        'count',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
        })
      );
    });

    it('should handle quiz validation errors', () => {
      const context = createErrorContext({ quizId: 'quiz_123' });

      expect(() => service.handleValidationError('Quiz not found', {}, context))
        .toThrow(QuizNotFoundException);
    });

    it('should handle question validation errors', () => {
      const context = createErrorContext({ questionId: 'question_123' });

      expect(() => service.handleValidationError('Question not found', {}, context))
        .toThrow(QuestionNotFoundException);
    });
  });

  describe('handleNotFoundError', () => {
    it('should handle quiz not found errors', () => {
      const context = createErrorContext();

      expect(() => service.handleNotFoundError('Quiz', 'quiz_123', context))
        .toThrow(QuizNotFoundException);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Not found error handled',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          resourceType: 'Quiz',
          resourceId: 'quiz_123',
        })
      );
      expect(mockMonitoringService.recordMetric).toHaveBeenCalledWith(
        'not_found_error',
        1,
        'count',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          resourceType: 'Quiz',
        })
      );
    });

    it('should handle question not found errors', () => {
      const context = createErrorContext();

      expect(() => service.handleNotFoundError('Question', 'question_123', context))
        .toThrow(QuestionNotFoundException);
    });

    it('should handle generic not found errors', () => {
      const context = createErrorContext();

      expect(() => service.handleNotFoundError('User', 'user_123', context))
        .toThrow();
    });
  });

  describe('handleAccessDeniedError', () => {
    it('should handle access denied errors', () => {
      const context = createErrorContext();

      expect(() => service.handleAccessDeniedError('Quiz', 'quiz_123', context))
        .toThrow();
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Access denied error handled',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          resourceType: 'Quiz',
          resourceId: 'quiz_123',
        })
      );
      expect(mockMonitoringService.recordMetric).toHaveBeenCalledWith(
        'access_denied_error',
        1,
        'count',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          resourceType: 'Quiz',
        })
      );
    });
  });

  describe('logError', () => {
    it('should log errors for monitoring', () => {
      const error = new Error('Test error');
      const context = createErrorContext();

      service.logError(error, context);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Error logged for monitoring',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          errorMessage: 'Test error',
          errorType: 'Error',
        })
      );
      expect(mockMonitoringService.recordMetric).toHaveBeenCalledWith(
        'application_error',
        1,
        'count',
        expect.objectContaining({
          service: 'TestService',
          method: 'testMethod',
          errorType: 'Error',
        })
      );
    });
  });

  describe('createErrorContext', () => {
    it('should create error context with required fields', () => {
      const context = service.createErrorContext('TestService', 'testMethod');

      expect(context).toEqual({
        service: 'TestService',
        method: 'testMethod',
      });
    });

    it('should create error context with additional data', () => {
      const additionalData = {
        userId: 'user_123',
        shopId: 'shop_456',
        requestId: 'req_789',
      };

      const context = service.createErrorContext('TestService', 'testMethod', additionalData);

      expect(context).toEqual({
        service: 'TestService',
        method: 'testMethod',
        userId: 'user_123',
        shopId: 'shop_456',
        requestId: 'req_789',
      });
    });
  });
});
