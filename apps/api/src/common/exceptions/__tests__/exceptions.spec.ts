import { HttpStatus } from '@nestjs/common';
import {
  BaseException,
  QuizNotFoundException,
  QuestionNotFoundException,
  ShopifyApiException,
  DatabaseException,
  PrismaException,
} from '../index';

// Create a concrete test exception class for testing BaseException
class TestException extends BaseException {
  constructor(message: string, statusCode: HttpStatus, code: string, details?: any, requestId?: string) {
    super(message, statusCode, code, details, requestId);
  }
}

describe('Custom Exceptions', () => {
  describe('BaseException', () => {
    it('should create a base exception with all properties', () => {
      const requestId = 'req_123';
      const details = { field: 'test' };
      const exception = new TestException(
        'Test message',
        HttpStatus.BAD_REQUEST,
        'TEST_ERROR',
        details,
        requestId,
      );

      expect(exception.message).toBe('Test message');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.code).toBe('TEST_ERROR');
      expect(exception.details).toBe(details);
      expect(exception.requestId).toBe(requestId);

      const response = exception.getResponse() as any;
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.message).toBe('Test message');
      expect(response.error).toBe('BAD_REQUEST'); // HttpStatus enum value
      expect(response.code).toBe('TEST_ERROR');
      expect(response.details).toBe(details);
      expect(response.requestId).toBe(requestId);
      expect(response.timestamp).toBeDefined();
    });

    it('should create a base exception without optional properties', () => {
      const exception = new TestException(
        'Test message',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'TEST_ERROR',
      );

      expect(exception.message).toBe('Test message');
      expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(exception.code).toBe('TEST_ERROR');
      expect(exception.details).toBeUndefined();
      expect(exception.requestId).toBeUndefined();
    });
  });

  describe('QuizNotFoundException', () => {
    it('should create a quiz not found exception', () => {
      const quizId = 'quiz_123';
      const requestId = 'req_456';
      const exception = new QuizNotFoundException(quizId, requestId);

      expect(exception.message).toBe(`Quiz with ID '${quizId}' not found`);
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.code).toBe('QUIZ_NOT_FOUND');
      expect(exception.details).toEqual({ quizId });
      expect(exception.requestId).toBe(requestId);
    });

    it('should create a quiz not found exception without request ID', () => {
      const quizId = 'quiz_789';
      const exception = new QuizNotFoundException(quizId);

      expect(exception.message).toBe(`Quiz with ID '${quizId}' not found`);
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.code).toBe('QUIZ_NOT_FOUND');
      expect(exception.details).toEqual({ quizId });
      expect(exception.requestId).toBeUndefined();
    });
  });

  describe('QuestionNotFoundException', () => {
    it('should create a question not found exception', () => {
      const questionId = 'question_123';
      const requestId = 'req_789';
      const exception = new QuestionNotFoundException(questionId, requestId);

      expect(exception.message).toBe(`Question with ID '${questionId}' not found`);
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.code).toBe('QUESTION_NOT_FOUND');
      expect(exception.details).toEqual({ questionId });
      expect(exception.requestId).toBe(requestId);
    });
  });

  describe('ShopifyApiException', () => {
    it('should create a Shopify API exception with custom status code', () => {
      const message = 'Shopify API error';
      const statusCode = 429;
      const details = { retryAfter: 60 };
      const requestId = 'req_999';
      const exception = new ShopifyApiException(message, statusCode, details, requestId);

      expect(exception.message).toBe(message);
      expect(exception.getStatus()).toBe(statusCode);
      expect(exception.code).toBe('SHOPIFY_API_ERROR');
      expect(exception.details).toBe(details);
      expect(exception.requestId).toBe(requestId);
    });
  });

  describe('DatabaseException', () => {
    it('should create a database exception', () => {
      const message = 'Database connection failed';
      const details = { connectionString: 'test' };
      const requestId = 'req_db_123';
      const exception = new DatabaseException(message, details, requestId);

      expect(exception.message).toBe(message);
      expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(exception.code).toBe('DATABASE_ERROR');
      expect(exception.details).toBe(details);
      expect(exception.requestId).toBe(requestId);
    });
  });

  describe('PrismaException', () => {
    it('should create a Prisma exception for unique constraint violation', () => {
      const mockPrismaError = {
        code: 'P2002',
        message: 'Unique constraint violation',
        meta: { target: ['email'] },
      } as any;

      const requestId = 'req_prisma_123';
      const exception = new PrismaException(mockPrismaError, requestId);

      expect(exception.message).toBe('Unique constraint violation on field: email'); // Actual implementation message
      expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(exception.code).toBe('PRISMA_ERROR');
      expect(exception.details).toEqual({
        errorCode: 'P2002',
        target: ['email'],
        meta: { target: ['email'] },
        originalError: 'Unique constraint violation',
      });
      expect(exception.requestId).toBe(requestId);
    });

    it('should create a Prisma exception for record not found', () => {
      const mockPrismaError = {
        code: 'P2025',
        message: 'Record not found',
        meta: {},
      } as any;

      const exception = new PrismaException(mockPrismaError);

      expect(exception.message).toBe('Record not found');
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.code).toBe('PRISMA_ERROR');
    });

    it('should create a Prisma exception for unknown error code', () => {
      const mockPrismaError = {
        code: 'P9999',
        message: 'Unknown error',
        meta: {},
      } as any;

      const exception = new PrismaException(mockPrismaError);

      expect(exception.message).toBe('Database error: P9999');
      expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(exception.code).toBe('PRISMA_ERROR');
    });
  });
});
