import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLClient } from 'graphql-request';
import { ShopifyApiException } from '../common/exceptions';
import { LoggerService } from '@shopify-quiz-builder/common';
import { MonitoringService } from '@shopify-quiz-builder/common';

export interface ShopifyGraphQLConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion: string;
}

export interface GraphQLRequestOptions {
  retries?: number;
  timeout?: number;
  shopId?: string;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  cost: number;
}

@Injectable()
export class ShopifyGraphQLClientService {
  private readonly logger = new Logger(ShopifyGraphQLClientService.name);
  private readonly loggerService = new LoggerService();
  private readonly monitoringService = new MonitoringService(this.loggerService);
  
  // Rate limiting configuration
  private readonly ADMIN_API_LIMIT = 2; // 2 calls per second
  private readonly STOREFRONT_API_LIMIT = 2; // 2 calls per second
  private readonly BURST_LIMIT = 40; // 40 calls per 10 seconds for admin
  
  // Rate limiting state
  private adminApiCalls: number[] = [];
  private storefrontApiCalls: number[] = [];
  private lastResetTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a GraphQL client for a specific shop
   */
  private createClient(config: ShopifyGraphQLConfig, isAdmin: boolean = true): GraphQLClient {
    const apiUrl = isAdmin 
      ? `https://${config.shopDomain}/admin/api/${config.apiVersion}/graphql.json`
      : `https://${config.shopDomain}/api/${config.apiVersion}/graphql.json`;

    return new GraphQLClient(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': config.accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check if we can make an API call based on rate limits
   */
  private async checkRateLimit(isAdmin: boolean = true): Promise<void> {
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    
    if (isAdmin) {
      // Clean old timestamps
      this.adminApiCalls = this.adminApiCalls.filter(time => time > tenSecondsAgo);
      
      // Check if we're at the limit
      if (this.adminApiCalls.length >= this.BURST_LIMIT) {
        const oldestCall = Math.min(...this.adminApiCalls);
        const waitTime = 10000 - (now - oldestCall);
        
        if (waitTime > 0) {
          this.logger.warn(`Admin API rate limit reached. Waiting ${waitTime}ms`);
          await this.sleep(waitTime);
        }
      }
      
      // Check per-second limit
      const oneSecondAgo = now - 1000;
      const recentCalls = this.adminApiCalls.filter(time => time > oneSecondAgo);
      
      if (recentCalls.length >= this.ADMIN_API_LIMIT) {
        const waitTime = 1000 - (now - Math.min(...recentCalls));
        if (waitTime > 0) {
          this.logger.warn(`Admin API per-second limit reached. Waiting ${waitTime}ms`);
          await this.sleep(waitTime);
        }
      }
    } else {
      // Storefront API rate limiting
      this.storefrontApiCalls = this.storefrontApiCalls.filter(time => time > tenSecondsAgo);
      
      const oneSecondAgo = now - 1000;
      const recentCalls = this.storefrontApiCalls.filter(time => time > oneSecondAgo);
      
      if (recentCalls.length >= this.STOREFRONT_API_LIMIT) {
        const waitTime = 1000 - (now - Math.min(...recentCalls));
        if (waitTime > 0) {
          this.logger.warn(`Storefront API per-second limit reached. Waiting ${waitTime}ms`);
          await this.sleep(waitTime);
        }
      }
    }
  }

  /**
   * Record an API call for rate limiting
   */
  private recordApiCall(isAdmin: boolean = true): void {
    const now = Date.now();
    
    if (isAdmin) {
      this.adminApiCalls.push(now);
    } else {
      this.storefrontApiCalls.push(now);
    }
  }

  /**
   * Execute a GraphQL query with retry logic and rate limiting
   */
  async executeQuery<T>(
    config: ShopifyGraphQLConfig,
    query: string,
    variables?: any,
    options: GraphQLRequestOptions = {},
    isAdmin: boolean = true
  ): Promise<T> {
    const startTime = Date.now();
    const { retries = 3, timeout = 30000, shopId } = options;
    
    try {
      // Check rate limits before making the call
      await this.checkRateLimit(isAdmin);
      
      // Create the client
      const client = this.createClient(config, isAdmin);
      
      // Record the API call
      this.recordApiCall(isAdmin);
      
      // Execute the query
      const result = await client.request<T>(query, variables);
      
      // Record success metrics
      const responseTime = Date.now() - startTime;
      this.monitoringService.recordApiCallMetrics(
        'shopify_graphql_query',
        'POST',
        responseTime,
        200,
        shopId
      );
      
      this.loggerService.log('Shopify GraphQL query executed successfully', {
        service: 'ShopifyGraphQLClientService',
        method: 'executeQuery',
        shopId,
        shopDomain: config.shopDomain,
        responseTime,
        queryType: 'query',
      });
      
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record error metrics
      this.monitoringService.recordApiCallMetrics(
        'shopify_graphql_query',
        'POST',
        responseTime,
        this.getErrorStatusCode(error),
        shopId
      );
      
      // Log the error
      this.loggerService.log('Shopify GraphQL query failed', {
        service: 'ShopifyGraphQLClientService',
        method: 'executeQuery',
        shopId,
        shopDomain: config.shopDomain,
        responseTime,
        errorMessage: error.message,
        errorCode: error.code,
        retries,
      });
      
      // Handle retries
      if (retries > 0 && this.isRetryableError(error)) {
        this.logger.warn(`Retrying GraphQL query. Attempts remaining: ${retries - 1}`);
        await this.sleep(1000 * (4 - retries)); // Exponential backoff
        return this.executeQuery(config, query, variables, { ...options, retries: retries - 1 }, isAdmin);
      }
      
      // Convert to our custom exception
      throw new ShopifyApiException(
        `Shopify GraphQL query failed: ${error.message}`,
        this.getErrorStatusCode(error),
        {
          originalError: error.message,
          query,
          variables,
          shopDomain: config.shopDomain,
          responseTime,
        },
        shopId
      );
    }
  }

  /**
   * Execute a GraphQL mutation with retry logic and rate limiting
   */
  async executeMutation<T>(
    config: ShopifyGraphQLConfig,
    mutation: string,
    variables?: any,
    options: GraphQLRequestOptions = {},
    isAdmin: boolean = true
  ): Promise<T> {
    const startTime = Date.now();
    const { retries = 3, timeout = 30000, shopId } = options;
    
    try {
      // Check rate limits before making the call
      await this.checkRateLimit(isAdmin);
      
      // Create the client
      const client = this.createClient(config, isAdmin);
      
      // Record the API call
      this.recordApiCall(isAdmin);
      
      // Execute the mutation
      const result = await client.request<T>(mutation, variables);
      
      // Record success metrics
      const responseTime = Date.now() - startTime;
      this.monitoringService.recordApiCallMetrics(
        'shopify_graphql_mutation',
        'POST',
        responseTime,
        200,
        shopId
      );
      
      this.loggerService.log('Shopify GraphQL mutation executed successfully', {
        service: 'ShopifyGraphQLClientService',
        method: 'executeMutation',
        shopId,
        shopDomain: config.shopDomain,
        responseTime,
        queryType: 'mutation',
      });
      
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record error metrics
      this.monitoringService.recordApiCallMetrics(
        'shopify_graphql_mutation',
        'POST',
        responseTime,
        this.getErrorStatusCode(error),
        shopId
      );
      
      // Log the error
      this.loggerService.log('Shopify GraphQL mutation failed', {
        service: 'ShopifyGraphQLClientService',
        method: 'executeMutation',
        shopId,
        shopDomain: config.shopDomain,
        responseTime,
        errorMessage: error.message,
        errorCode: error.code,
        retries,
      });
      
      // Handle retries
      if (retries > 0 && this.isRetryableError(error)) {
        this.logger.warn(`Retrying GraphQL mutation. Attempts remaining: ${retries - 1}`);
        await this.sleep(1000 * (4 - retries)); // Exponential backoff
        return this.executeMutation(config, mutation, variables, { ...options, retries: retries - 1 }, isAdmin);
      }
      
      // Convert to our custom exception
      throw new ShopifyApiException(
        `Shopify GraphQL mutation failed: ${error.message}`,
        this.getErrorStatusCode(error),
        {
          originalError: error.message,
          mutation,
          variables,
          shopDomain: config.shopDomain,
          responseTime,
        },
        shopId
      );
    }
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): {
    admin: { calls: number; remaining: number; resetTime: Date };
    storefront: { calls: number; remaining: number; resetTime: Date };
  } {
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    
    const adminCalls = this.adminApiCalls.filter(time => time > tenSecondsAgo);
    const storefrontCalls = this.storefrontApiCalls.filter(time => time > tenSecondsAgo);
    
    return {
      admin: {
        calls: adminCalls.length,
        remaining: Math.max(0, this.BURST_LIMIT - adminCalls.length),
        resetTime: new Date(now + 10000),
      },
      storefront: {
        calls: storefrontCalls.length,
        remaining: Math.max(0, 50 - storefrontCalls.length), // 50 calls per 10 seconds
        resetTime: new Date(now + 10000),
      },
    };
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Retry on network errors, timeouts, and rate limits
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'RATE_LIMIT_EXCEEDED',
      'THROTTLED',
    ];
    
    return retryableErrors.some(code => 
      error.code === code || 
      error.message?.includes(code) ||
      error.message?.includes('rate limit') ||
      error.message?.includes('throttled')
    );
  }

  /**
   * Get HTTP status code from error
   */
  private getErrorStatusCode(error: any): number {
    if (error.response?.status) {
      return error.response.status;
    }
    
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'THROTTLED') {
      return 429; // Too Many Requests
    }
    
    if (error.code === 'UNAUTHORIZED' || error.message?.includes('access token')) {
      return 401; // Unauthorized
    }
    
    if (error.code === 'FORBIDDEN' || error.message?.includes('insufficient scope')) {
      return 403; // Forbidden
    }
    
    if (error.code === 'NOT_FOUND' || error.message?.includes('not found')) {
      return 404; // Not Found
    }
    
    return 500; // Internal Server Error
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
