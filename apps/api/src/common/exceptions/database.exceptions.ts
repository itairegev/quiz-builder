import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseException } from './base.exception';

export class DatabaseException extends BaseException {
  constructor(message: string, details?: any, requestId?: string) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'DATABASE_ERROR',
      details,
      requestId,
    );
  }
}

export class DatabaseConnectionException extends BaseException {
  constructor(message: string, details?: any, requestId?: string) {
    super(
      message,
      HttpStatus.SERVICE_UNAVAILABLE,
      'DATABASE_CONNECTION_ERROR',
      details,
      requestId,
    );
  }
}

export class DatabaseConstraintException extends BaseException {
  constructor(constraint: string, details?: any, requestId?: string) {
    super(
      `Database constraint violation: ${constraint}`,
      HttpStatus.CONFLICT,
      'DATABASE_CONSTRAINT_VIOLATION',
      { constraint, ...details },
      requestId,
    );
  }
}

export class DatabaseTransactionException extends BaseException {
  constructor(message: string, details?: any, requestId?: string) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'DATABASE_TRANSACTION_ERROR',
      details,
      requestId,
    );
  }
}

export class PrismaException extends BaseException {
  constructor(prismaError: Prisma.PrismaClientKnownRequestError, requestId?: string) {
    const errorCode = prismaError.code;
    const target = prismaError.meta?.target;
    
    let message = 'Database operation failed';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    
    switch (errorCode) {
      case 'P2002':
        message = `Unique constraint violation on field: ${target}`;
        statusCode = HttpStatus.CONFLICT;
        break;
      case 'P2003':
        message = `Foreign key constraint violation`;
        statusCode = HttpStatus.BAD_REQUEST;
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = HttpStatus.NOT_FOUND;
        break;
      case 'P2024':
        message = 'Database connection timeout';
        statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        break;
      default:
        message = `Database error: ${errorCode}`;
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    super(
      message,
      statusCode,
      'PRISMA_ERROR',
      { 
        errorCode, 
        target, 
        meta: prismaError.meta,
        originalError: prismaError.message 
      },
      requestId,
    );
  }
}
