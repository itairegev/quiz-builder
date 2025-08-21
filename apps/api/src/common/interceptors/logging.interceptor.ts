import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../../packages/common/src/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly loggerService = new LoggerService();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, shop } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.connection.remoteAddress;
    const requestId = request.headers['x-request-id'] || 'unknown';

    const now = Date.now();

    // Log incoming request with structured data
    this.loggerService.log('Incoming request', {
      service: 'LoggingInterceptor',
      method: 'intercept',
      requestId,
      httpMethod: method,
      url,
      ip,
      userAgent,
      userId: user?.id,
      shopId: shop?.id,
      timestamp: new Date().toISOString(),
    });

    // Log request body if present (excluding sensitive data)
    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeRequestBody(body);
      this.loggerService.log('Request body', {
        service: 'LoggingInterceptor',
        method: 'intercept',
        requestId,
        body: sanitizedBody,
      });
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          // Log successful response
          this.loggerService.log('Response sent', {
            service: 'LoggingInterceptor',
            method: 'intercept',
            requestId,
            httpMethod: method,
            url,
            statusCode,
            responseTime,
            userId: user?.id,
            shopId: shop?.id,
            timestamp: new Date().toISOString(),
          });

          // Log response data size for monitoring
          if (data) {
            const responseSize = JSON.stringify(data).length;
            this.loggerService.log('Response data size', {
              service: 'LoggingInterceptor',
              method: 'intercept',
              requestId,
              responseSize,
              hasData: true,
            });
          }
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          const statusCode = error.status || error.statusCode || 500;

          // Log error response
          this.loggerService.log('Error response sent', {
            service: 'LoggingInterceptor',
            method: 'intercept',
            requestId,
            httpMethod: method,
            url,
            statusCode,
            responseTime,
            errorMessage: error.message,
            errorCode: error.code,
            userId: user?.id,
            shopId: shop?.id,
            timestamp: new Date().toISOString(),
          });

          // Log error details for debugging
          this.logger.error(
            `Error: ${method} ${url} - Status: ${statusCode} - RequestId: ${requestId} - Time: ${responseTime}ms - Message: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }

  private sanitizeRequestBody(body: any): any {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
