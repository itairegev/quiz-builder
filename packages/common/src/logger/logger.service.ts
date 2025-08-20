import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export interface LogContext {
  service?: string;
  method?: string;
  userId?: string;
  shopId?: string;
  quizId?: string;
  sessionId?: string;
  requestId?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.initializeLogger();
  }

  private initializeLogger() {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level.toUpperCase()}]${contextStr}: ${message}${metaStr}`;
      })
    );

    const transports: winston.transport[] = [
      // Console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ];

    // File transports for production
    if (process.env.NODE_ENV === 'production') {
      // Application logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info',
        })
      );

      // Error logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
        })
      );

      // Debug logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/debug-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '7d',
          level: 'debug',
        })
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports,
      exitOnError: false,
    });
  }

  log(message: string, context?: LogContext) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: LogContext) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: LogContext) {
    this.logger.verbose(message, { context });
  }

  // Custom logging methods for business logic
  logQuizEvent(event: string, data: any, context?: LogContext) {
    this.log(`Quiz Event: ${event}`, { ...context, eventData: data });
  }

  logShopifyEvent(event: string, data: any, context?: LogContext) {
    this.log(`Shopify Event: ${event}`, { ...context, eventData: data });
  }

  logAnalyticsEvent(event: string, data: any, context?: LogContext) {
    this.log(`Analytics Event: ${event}`, { ...context, eventData: data });
  }

  logSecurityEvent(event: string, data: any, context?: LogContext) {
    this.warn(`Security Event: ${event}`, { ...context, eventData: data });
  }

  logPerformanceMetric(metric: string, value: number, context?: LogContext) {
    this.log(`Performance: ${metric} = ${value}`, { ...context, metric, value });
  }
}

