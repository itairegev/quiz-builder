import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class QuestionNotFoundException extends BaseException {
  constructor(questionId: string, requestId?: string) {
    super(
      `Question with ID '${questionId}' not found`,
      HttpStatus.NOT_FOUND,
      'QUESTION_NOT_FOUND',
      { questionId },
      requestId,
    );
  }
}

export class QuestionValidationException extends BaseException {
  constructor(message: string, details?: any, requestId?: string) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      'QUESTION_VALIDATION_ERROR',
      details,
      requestId,
    );
  }
}

export class QuestionLogicException extends BaseException {
  constructor(message: string, details?: any, requestId?: string) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      'QUESTION_LOGIC_ERROR',
      details,
      requestId,
    );
  }
}

export class QuestionAccessDeniedException extends BaseException {
  constructor(questionId: string, userId: string, requestId?: string) {
    super(
      `Access denied to question '${questionId}' for user '${userId}'`,
      HttpStatus.FORBIDDEN,
      'QUESTION_ACCESS_DENIED',
      { questionId, userId },
      requestId,
    );
  }
}
