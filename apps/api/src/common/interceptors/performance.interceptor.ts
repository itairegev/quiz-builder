import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MonitoringService } from '../../../packages/common/src/monitoring/monitoring.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly monitoringService = new MonitoringService();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = request.headers['x-request-id'] || 'unknown';
    const startTime = Date.now();

    // Record request start
    this.monitoringService.recordMetric('request_start', 1, 'count', {
      endpoint: url,
      method,
      requestId,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;

          // Record response time
          this.monitoringService.recordResponseTime(url, responseTime);
          
          // Record request count
          this.monitoringService.recordRequestCount(url, method, statusCode);

          // Record performance metrics
          this.monitoringService.recordMetric('request_duration', responseTime, 'ms', {
            endpoint: url,
            method,
            statusCode: statusCode.toString(),
            requestId,
          });

          // Record response size if data exists
          if (data) {
            const responseSize = JSON.stringify(data).length;
            this.monitoringService.recordMetric('response_size', responseSize, 'bytes', {
              endpoint: url,
              method,
              requestId,
            });
          }

          // Log performance data
          this.monitoringService.recordMetric('request_success', 1, 'count', {
            endpoint: url,
            method,
            requestId,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || error.statusCode || 500;

          // Record error metrics
          this.monitoringService.recordMetric('request_error', 1, 'count', {
            endpoint: url,
            method,
            statusCode: statusCode.toString(),
            errorCode: error.code || 'UNKNOWN_ERROR',
            requestId,
          });

          // Record error response time
          this.monitoringService.recordMetric('request_duration_error', responseTime, 'ms', {
            endpoint: url,
            method,
            statusCode: statusCode.toString(),
            requestId,
          });

          // Record request count (including errors)
          this.monitoringService.recordRequestCount(url, method, statusCode);
        },
      }),
    );
  }
}
