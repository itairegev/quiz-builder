import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Shopify Quiz Builder API! 🚀';
  }
}
