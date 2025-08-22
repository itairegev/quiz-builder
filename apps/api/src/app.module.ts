import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuestionsModule } from './questions/questions.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ShopifyModule } from './shopify/shopify.module';
import { QuizBuilderModule } from './quiz-builder/quiz-builder.module';
import { HealthModule } from './health/health.module';
import { MonitoringModule } from './monitoring/monitoring.module';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ShopifyAuthMiddleware } from './shopify/shopify-auth.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: undefined, // Will be added later with Joi
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),

    // Feature modules
    DatabaseModule,
    AuthModule,
    QuizzesModule,
    QuestionsModule,
    SubmissionsModule,
    AnalyticsModule,
    ShopifyModule,
    QuizBuilderModule,
    HealthModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply request ID middleware globally
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*');

    // Apply Shopify auth middleware to protected routes
    consumer
      .apply(ShopifyAuthMiddleware)
      .forRoutes(
        { path: 'api/v1/quizzes*', method: RequestMethod.ALL },
        { path: 'api/v1/questions*', method: RequestMethod.ALL },
        { path: 'api/v1/submissions*', method: RequestMethod.ALL },
        { path: 'api/v1/analytics*', method: RequestMethod.ALL },
        { path: 'api/v1/quiz-builder*', method: RequestMethod.ALL },
      );
  }
}
