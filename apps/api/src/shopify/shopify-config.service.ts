import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShopifyGraphQLConfig } from './shopify-graphql-client.service';

@Injectable()
export class ShopifyConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get the current Shopify API version
   * We'll use a stable version that's well-tested
   */
  getApiVersion(): string {
    return this.configService.get<string>('SHOPIFY_API_VERSION') || '2024-01';
  }

  /**
   * Get default GraphQL configuration for a shop
   */
  getGraphQLConfig(shopDomain: string, accessToken: string): ShopifyGraphQLConfig {
    return {
      shopDomain,
      accessToken,
      apiVersion: this.getApiVersion(),
    };
  }

  /**
   * Get Shopify app credentials
   */
  getAppCredentials() {
    return {
      apiKey: this.configService.get<string>('SHOPIFY_API_KEY'),
      apiSecretKey: this.configService.get<string>('SHOPIFY_API_SECRET_KEY'),
      scopes: this.configService.get<string>('SHOPIFY_SCOPES')?.split(',') || [
        'read_products',
        'write_products',
        'read_customers',
        'write_customers',
        'read_orders',
        'write_orders',
        'read_inventory',
        'write_inventory',
        'read_marketing_events',
        'write_marketing_events',
      ],
      hostName: this.configService.get<string>('SHOPIFY_HOST_NAME') || 'localhost:3000',
      apiVersion: this.getApiVersion(),
    };
  }

  /**
   * Get webhook configuration
   */
  getWebhookConfig() {
    return {
      apiVersion: this.getApiVersion(),
      webhookHandlers: {
        'APP_UNINSTALLED': '/webhooks/app-uninstalled',
        'CUSTOMERS_UPDATE': '/webhooks/customers-update',
        'PRODUCTS_UPDATE': '/webhooks/products-update',
        'ORDERS_CREATE': '/webhooks/orders-create',
        'ORDERS_FULFILLED': '/webhooks/orders-fulfilled',
      },
    };
  }

  /**
   * Get rate limiting configuration
   */
  getRateLimitConfig() {
    return {
      admin: {
        callsPerSecond: 2,
        burstLimit: 40,
        burstWindow: 10000, // 10 seconds
      },
      storefront: {
        callsPerSecond: 2,
        burstLimit: 50,
        burstWindow: 10000, // 10 seconds
      },
    };
  }

  /**
   * Get retry configuration
   */
  getRetryConfig() {
    return {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffMultiplier: 2,
    };
  }

  /**
   * Get timeout configuration
   */
  getTimeoutConfig() {
    return {
      requestTimeout: 30000, // 30 seconds
      connectionTimeout: 10000, // 10 seconds
      idleTimeout: 60000, // 1 minute
    };
  }

  /**
   * Validate required environment variables
   */
  validateConfig(): boolean {
    const requiredVars = [
      'SHOPIFY_API_KEY',
      'SHOPIFY_API_SECRET_KEY',
    ];

    const missingVars = requiredVars.filter(
      varName => !this.configService.get<string>(varName)
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required Shopify configuration variables: ${missingVars.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig() {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    
    return {
      isDevelopment: nodeEnv === 'development',
      isProduction: nodeEnv === 'production',
      isTest: nodeEnv === 'test',
      debugMode: nodeEnv === 'development',
      logLevel: nodeEnv === 'development' ? 'debug' : 'info',
    };
  }
}
