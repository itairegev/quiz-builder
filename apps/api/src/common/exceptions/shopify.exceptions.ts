import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ShopifyApiException extends BaseException {
  constructor(message: string, statusCode: number, details?: any, requestId?: string) {
    super(
      message,
      statusCode,
      'SHOPIFY_API_ERROR',
      details,
      requestId,
    );
  }
}

export class ShopifyAuthenticationException extends BaseException {
  constructor(message: string, details?: any, requestId?: string) {
    super(
      message,
      HttpStatus.UNAUTHORIZED,
      'SHOPIFY_AUTH_ERROR',
      details,
      requestId,
    );
  }
}

export class ShopifyRateLimitException extends BaseException {
  constructor(retryAfter?: number, requestId?: string) {
    super(
      'Shopify API rate limit exceeded',
      HttpStatus.TOO_MANY_REQUESTS,
      'SHOPIFY_RATE_LIMIT',
      { retryAfter },
      requestId,
    );
  }
}

export class ShopifyWebhookException extends BaseException {
  constructor(message: string, details?: any, requestId?: string) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      'SHOPIFY_WEBHOOK_ERROR',
      details,
      requestId,
    );
  }
}

export class ShopifyStoreNotFoundException extends BaseException {
  constructor(shopDomain: string, requestId?: string) {
    super(
      `Shopify store '${shopDomain}' not found`,
      HttpStatus.NOT_FOUND,
      'SHOPIFY_STORE_NOT_FOUND',
      { shopDomain },
      requestId,
    );
  }
}
