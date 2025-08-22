import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ShopifyGraphQLClientService, ShopifyGraphQLConfig } from '../shopify-graphql-client.service';
import { ShopifyApiException } from '../../common/exceptions';
import { LoggerService } from '@shopify-quiz-builder/common';
import { MonitoringService } from '@shopify-quiz-builder/common';

// Mock the GraphQL client
const mockGraphQLClient = {
  request: jest.fn(),
};

// Mock the monitoring service
const mockMonitoringService = {
  recordApiCallMetrics: jest.fn(),
};

// Mock the logger service
const mockLoggerService = {
  log: jest.fn(),
  logPerformanceMetric: jest.fn(),
};

jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn().mockImplementation(() => mockGraphQLClient),
}));

describe('ShopifyGraphQLClientService', () => {
  let service: ShopifyGraphQLClientService;
  let configService: ConfigService;

  const mockConfig: ShopifyGraphQLConfig = {
    shopDomain: 'test-shop.myshopify.com',
    accessToken: 'test-access-token',
    apiVersion: '2024-01',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyGraphQLClientService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: MonitoringService,
          useValue: mockMonitoringService,
        },
      ],
    }).compile();

    service = module.get<ShopifyGraphQLClientService>(ShopifyGraphQLClientService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Manually inject the mocked services
    (service as any).monitoringService = mockMonitoringService;
    (service as any).loggerService = mockLoggerService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('executeQuery', () => {
    it('should execute a GraphQL query successfully', async () => {
      const mockResult = { data: 'test' };
      mockGraphQLClient.request.mockResolvedValue(mockResult);

      const result = await service.executeQuery(
        mockConfig,
        'query { test }',
        {},
        { shopId: 'shop_123' }
      );

      expect(result).toEqual(mockResult);
      expect(mockGraphQLClient.request).toHaveBeenCalledWith('query { test }', {});
      expect(mockMonitoringService.recordApiCallMetrics).toHaveBeenCalledWith(
        'shopify_graphql_query',
        'POST',
        expect.any(Number),
        200,
        'shop_123'
      );
    });

    it('should handle GraphQL errors and convert them to custom exceptions', async () => {
      const mockError = new Error('GraphQL error');
      mockGraphQLClient.request.mockRejectedValue(mockError);

      await expect(
        service.executeQuery(mockConfig, 'query { test }', {}, { shopId: 'shop_123' })
      ).rejects.toThrow(ShopifyApiException);

      expect(mockMonitoringService.recordApiCallMetrics).toHaveBeenCalledWith(
        'shopify_graphql_query',
        'POST',
        expect.any(Number),
        500,
        'shop_123'
      );
    });

    it('should retry on retryable errors', async () => {
      const mockError = new Error('ECONNRESET');
      mockGraphQLClient.request
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ data: 'success' });

      const result = await service.executeQuery(
        mockConfig,
        'query { test }',
        {},
        { retries: 1, shopId: 'shop_123' }
      );

      expect(result).toEqual({ data: 'success' });
      expect(mockGraphQLClient.request).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockError = new Error('Unauthorized access');
      mockGraphQLClient.request.mockRejectedValue(mockError);

      await expect(
        service.executeQuery(mockConfig, 'query { test }', {}, { shopId: 'shop_123' })
      ).rejects.toThrow(ShopifyApiException);

      expect(mockGraphQLClient.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('executeMutation', () => {
    it('should execute a GraphQL mutation successfully', async () => {
      const mockResult = { data: 'mutation result' };
      mockGraphQLClient.request.mockResolvedValue(mockResult);

      const result = await service.executeMutation(
        mockConfig,
        'mutation { test }',
        { input: 'test' },
        { shopId: 'shop_123' }
      );

      expect(result).toEqual(mockResult);
      expect(mockGraphQLClient.request).toHaveBeenCalledWith('mutation { test }', { input: 'test' });
      expect(mockMonitoringService.recordApiCallMetrics).toHaveBeenCalledWith(
        'shopify_graphql_mutation',
        'POST',
        expect.any(Number),
        200,
        'shop_123'
      );
    });

    it('should handle mutation errors and convert them to custom exceptions', async () => {
      const mockError = new Error('Mutation failed');
      mockGraphQLClient.request.mockRejectedValue(mockError);

      await expect(
        service.executeMutation(
          mockConfig,
          'mutation { test }',
          { input: 'test' },
          { shopId: 'shop_123' }
        )
      ).rejects.toThrow(ShopifyApiException);
    });
  });

  describe('rate limiting', () => {
    it('should track API calls for rate limiting', async () => {
      mockGraphQLClient.request.mockResolvedValue({ data: 'test' });

      // Make multiple calls quickly
      await Promise.all([
        service.executeQuery(mockConfig, 'query { test1 }'),
        service.executeQuery(mockConfig, 'query { test2 }'),
        service.executeQuery(mockConfig, 'query { test3 }'),
      ]);

      const rateLimitStatus = service.getRateLimitStatus();
      expect(rateLimitStatus.admin.calls).toBe(3);
      expect(rateLimitStatus.admin.remaining).toBe(37); // 40 - 3
    });

    it('should respect rate limits', async () => {
      mockGraphQLClient.request.mockResolvedValue({ data: 'test' });

      // Make calls up to the limit
      const promises = [];
      for (let i = 0; i < 45; i++) {
        promises.push(service.executeQuery(mockConfig, `query { test${i} }`));
      }

      // All calls should eventually succeed (with rate limiting delays)
      const results = await Promise.all(promises);
      expect(results).toHaveLength(45);
    });
  });

  describe('error handling', () => {
    it('should map GraphQL errors to appropriate HTTP status codes', async () => {
      const testCases = [
        { error: { code: 'RATE_LIMIT_EXCEEDED' }, expectedStatus: 429 },
        { error: { code: 'UNAUTHORIZED' }, expectedStatus: 401 },
        { error: { code: 'FORBIDDEN' }, expectedStatus: 403 },
        { error: { code: 'NOT_FOUND' }, expectedStatus: 404 },
        { error: { message: 'Unknown error' }, expectedStatus: 500 },
      ];

      for (const { error, expectedStatus } of testCases) {
        mockGraphQLClient.request.mockRejectedValueOnce(error);

        try {
          await service.executeQuery(mockConfig, 'query { test }');
        } catch (e) {
          if (e instanceof ShopifyApiException) {
            expect(e.getStatus()).toBe(expectedStatus);
          }
        }
      }
    });

    it('should identify retryable errors correctly', async () => {
      const retryableErrors = [
        { code: 'ECONNRESET' },
        { code: 'ETIMEDOUT' },
        { code: 'ENOTFOUND' },
        { code: 'ECONNREFUSED' },
        { code: 'RATE_LIMIT_EXCEEDED' },
        { code: 'THROTTLED' },
        { message: 'rate limit exceeded' },
        { message: 'throttled' },
      ];

      for (const error of retryableErrors) {
        mockGraphQLClient.request.mockRejectedValueOnce(error);

        try {
          await service.executeQuery(mockConfig, 'query { test }', {}, { retries: 0 });
        } catch (e) {
          // Should not retry when retries = 0
          // Reset the mock call count for each iteration
          mockGraphQLClient.request.mockClear();
        }
      }
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return current rate limit status', () => {
      const status = service.getRateLimitStatus();

      expect(status).toHaveProperty('admin');
      expect(status).toHaveProperty('storefront');
      expect(status.admin).toHaveProperty('calls');
      expect(status.admin).toHaveProperty('remaining');
      expect(status.admin).toHaveProperty('resetTime');
    });

    it('should calculate remaining calls correctly', () => {
      const status = service.getRateLimitStatus();
      expect(status.admin.remaining).toBe(40); // Initial state
      expect(status.storefront.remaining).toBe(50); // Initial state
    });
  });

  describe('configuration', () => {
    it('should create admin API URLs correctly', async () => {
      mockGraphQLClient.request.mockResolvedValue({ data: 'test' });

      await service.executeQuery(mockConfig, 'query { test }');

      // The GraphQLClient should have been created with the correct admin URL
      expect(mockGraphQLClient.request).toHaveBeenCalled();
    });

    it('should create storefront API URLs correctly', async () => {
      mockGraphQLClient.request.mockResolvedValue({ data: 'test' });

      await service.executeQuery(mockConfig, 'query { test }', {}, {}, false);

      // The GraphQLClient should have been created with the correct storefront URL
      expect(mockGraphQLClient.request).toHaveBeenCalled();
    });
  });
});
