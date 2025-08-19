import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'shopify-quiz-builder-api',
    };
  }
}
