import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  path?: string;
  requestId?: string;
}

export abstract class BaseException extends HttpException {
  public readonly code: string;
  public readonly details?: any;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode: HttpStatus,
    code: string,
    details?: any,
    requestId?: string,
  ) {
    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      error: HttpStatus[statusCode],
      code,
      details,
      timestamp: new Date().toISOString(),
      requestId,
    };

    super(errorResponse, statusCode);
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}
