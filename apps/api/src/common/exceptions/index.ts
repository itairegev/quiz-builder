// Base exceptions
export * from './base.exception';

// Domain-specific exceptions
export * from './quiz.exceptions';
export * from './question.exceptions';
export * from './shopify.exceptions';
export * from './database.exceptions';

// Re-export common NestJS exceptions for convenience
export { 
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ServiceUnavailableException,
  RequestTimeoutException,
} from '@nestjs/common';
