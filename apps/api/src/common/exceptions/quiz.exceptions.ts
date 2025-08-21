import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class QuizNotFoundException extends BaseException {
  constructor(quizId: string, requestId?: string) {
    super(
      `Quiz with ID '${quizId}' not found`,
      HttpStatus.NOT_FOUND,
      'QUIZ_NOT_FOUND',
      { quizId },
      requestId,
    );
  }
}

export class QuizAlreadyExistsException extends BaseException {
  constructor(quizName: string, shopId: string, requestId?: string) {
    super(
      `Quiz with name '${quizName}' already exists in shop '${shopId}'`,
      HttpStatus.CONFLICT,
      'QUIZ_ALREADY_EXISTS',
      { quizName, shopId },
      requestId,
    );
  }
}

export class QuizValidationException extends BaseException {
  constructor(message: string, details?: any, requestId?: string) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      'QUIZ_VALIDATION_ERROR',
      details,
      requestId,
    );
  }
}

export class QuizAccessDeniedException extends BaseException {
  constructor(quizId: string, userId: string, requestId?: string) {
    super(
      `Access denied to quiz '${quizId}' for user '${userId}'`,
      HttpStatus.FORBIDDEN,
      'QUIZ_ACCESS_DENIED',
      { quizId, userId },
      requestId,
    );
  }
}
