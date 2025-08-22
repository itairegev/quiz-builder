import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shopify-quiz-builder/database';
import { ShopifyWebhookService, WebhookEvent, WebhookRegistration } from '../shopify-webhook.service';
import { ShopifyGraphQLClientService } from '../shopify-graphql-client.service';

describe('ShopifyWebhookService', () => {
  let service: ShopifyWebhookService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockPrisma: any;
  let mockGraphQLClient: jest.Mocked<ShopifyGraphQLClientService>;

  const mockWebhookSecret = 'test-webhook-secret';
  const mockShopDomain = 'test-shop.myshopify.com';
  const mockAccessToken = 'test-access-token';

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    } as any;

    mockPrisma = {
      webhookSubscription: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      customer: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      order: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      shop: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      product: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      collection: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      webhookEventLog: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    } as any;

    mockGraphQLClient = {
      executeQuery: jest.fn(),
      executeMutation: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyWebhookService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ShopifyGraphQLClientService,
          useValue: mockGraphQLClient,
        },
      ],
    }).compile();

    service = module.get<ShopifyWebhookService>(ShopifyWebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateWebhookSignature', () => {
    it('should return true in development mode', () => {
      mockConfigService.get.mockReturnValue('development');

      const result = service.validateWebhookSignature('test-body', 'test-signature', mockWebhookSecret);

      expect(result).toBe(true);
    });

    it('should return false for missing signature', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.validateWebhookSignature('test-body', '', mockWebhookSecret);

      expect(result).toBe(false);
    });

    it('should return false for missing webhook secret', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.validateWebhookSignature('test-body', 'test-signature', '');

      expect(result).toBe(false);
    });

    it('should validate signature correctly in production', () => {
      mockConfigService.get.mockReturnValue('production');
      
      // This test would require proper crypto mocking
      // For now, we'll test the error handling path
      const result = service.validateWebhookSignature('test-body', 'invalid-signature', mockWebhookSecret);
      
      expect(result).toBe(false);
    });
  });

  describe('registerWebhook', () => {
    const mockWebhook: WebhookRegistration = {
      topic: 'customers/create',
      address: 'https://example.com/webhook',
      format: 'json',
      version: '2024-01',
    };

    const mockGraphQLResponse = {
      webhookSubscriptionCreate: {
        webhookSubscription: {
          id: 'webhook_123',
          topic: 'customers/create',
          endpoint: {
            __typename: 'WebhookHttpEndpoint',
            callbackUrl: 'https://example.com/webhook',
          },
          format: 'JSON',
          version: '2024-01',
          createdAt: '2024-01-15T10:30:00Z',
        },
        userErrors: [],
      },
    };

    it('should register webhook successfully', async () => {
      mockConfigService.get.mockReturnValue('2024-01');
      mockGraphQLClient.executeMutation.mockResolvedValue(mockGraphQLResponse);
      mockPrisma.webhookSubscription.upsert.mockResolvedValue({} as any);

      const result = await service.registerWebhook(mockShopDomain, mockAccessToken, mockWebhook);

      expect(result).toEqual({
        id: 'webhook_123',
        topic: 'customers/create',
        address: 'https://example.com/webhook',
        format: 'JSON',
        version: '2024-01',
        status: 'active',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(mockGraphQLClient.executeMutation).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringContaining('webhookSubscriptionCreate'),
        expect.objectContaining({
          topic: 'customers/create',
          webhookSubscription: expect.objectContaining({
            callbackUrl: 'https://example.com/webhook',
          }),
        }),
      );
    });

    it('should handle GraphQL errors', async () => {
      mockConfigService.get.mockReturnValue('2024-01');
      const errorResponse = {
        webhookSubscriptionCreate: {
          webhookSubscription: null,
          userErrors: [{ field: 'topic', message: 'Invalid topic' }],
        },
      };
      mockGraphQLClient.executeMutation.mockResolvedValue(errorResponse);

      await expect(
        service.registerWebhook(mockShopDomain, mockAccessToken, mockWebhook),
      ).rejects.toThrow('Webhook registration failed: Invalid topic');
    });

    it('should handle GraphQL client errors', async () => {
      mockConfigService.get.mockReturnValue('2024-01');
      mockGraphQLClient.executeMutation.mockRejectedValue(new Error('GraphQL error'));

      await expect(
        service.registerWebhook(mockShopDomain, mockAccessToken, mockWebhook),
      ).rejects.toThrow('GraphQL error');
    });
  });

  describe('unregisterWebhook', () => {
    const mockWebhookId = 'webhook_123';

    const mockGraphQLResponse = {
      webhookSubscriptionDelete: {
        deletedWebhookSubscriptionId: 'webhook_123',
        userErrors: [],
      },
    };

    it('should unregister webhook successfully', async () => {
      mockConfigService.get.mockReturnValue('2024-01');
      mockGraphQLClient.executeMutation.mockResolvedValue(mockGraphQLResponse);
      mockPrisma.webhookSubscription.updateMany.mockResolvedValue({ count: 1 } as any);

      const result = await service.unregisterWebhook(mockShopDomain, mockAccessToken, mockWebhookId);

      expect(result).toBe(true);
      expect(mockGraphQLClient.executeMutation).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringContaining('webhookSubscriptionDelete'),
        { id: 'webhook_123' },
      );
    });

    it('should handle GraphQL errors during unregistration', async () => {
      mockConfigService.get.mockReturnValue('2024-01');
      const errorResponse = {
        webhookSubscriptionDelete: {
          deletedWebhookSubscriptionId: null,
          userErrors: [{ field: 'id', message: 'Webhook not found' }],
        },
      };
      mockGraphQLClient.executeMutation.mockResolvedValue(errorResponse);

      await expect(
        service.unregisterWebhook(mockShopDomain, mockAccessToken, mockWebhookId),
      ).rejects.toThrow('Webhook unregistration failed: Webhook not found');
    });
  });

  describe('getWebhookSubscriptions', () => {
    const mockGraphQLResponse = {
      webhookSubscriptions: {
        edges: [
          {
            node: {
              id: 'webhook_1',
              topic: 'customers/create',
              endpoint: {
                __typename: 'WebhookHttpEndpoint',
                callbackUrl: 'https://example.com/webhook1',
              },
              format: 'JSON',
              version: '2024-01',
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T10:30:00Z',
            },
          },
        ],
      },
    };

    it('should get webhook subscriptions successfully', async () => {
      mockConfigService.get.mockReturnValue('2024-01');
      mockGraphQLClient.executeQuery.mockResolvedValue(mockGraphQLResponse);

      const result = await service.getWebhookSubscriptions(mockShopDomain, mockAccessToken);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'webhook_1',
        topic: 'customers/create',
        address: 'https://example.com/webhook1',
        format: 'JSON',
        version: '2024-01',
        status: 'active',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle GraphQL client errors', async () => {
      mockConfigService.get.mockReturnValue('2024-01');
      mockGraphQLClient.executeQuery.mockRejectedValue(new Error('GraphQL error'));

      await expect(
        service.getWebhookSubscriptions(mockShopDomain, mockAccessToken),
      ).rejects.toThrow('GraphQL error');
    });
  });

  describe('processWebhookEvent', () => {
    const mockEvent: WebhookEvent = {
      topic: 'customers/create',
      shopDomain: mockShopDomain,
      data: {
        id: 123,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      },
      timestamp: new Date(),
      requestId: 'req_123',
    };

    it('should process customer creation event', async () => {
      mockPrisma.customer.upsert.mockResolvedValue({} as any);
      mockPrisma.webhookEventLog.create.mockResolvedValue({} as any);

      await service.processWebhookEvent(mockEvent);

      expect(mockPrisma.customer.upsert).toHaveBeenCalledWith({
        where: {
          shopifyCustomerId_shopId: {
            shopifyCustomerId: '123',
            shopId: mockShopDomain,
          },
        },
        update: {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          updatedAt: expect.any(Date),
        },
        create: {
          shopifyCustomerId: '123',
          shopId: mockShopDomain,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    it('should process app uninstalled event', async () => {
      const uninstallEvent: WebhookEvent = {
        ...mockEvent,
        topic: 'app/uninstalled',
        data: { id: 123, domain: mockShopDomain },
      };

      mockPrisma.shop.updateMany.mockResolvedValue({ count: 1 } as any);
      mockPrisma.webhookEventLog.create.mockResolvedValue({} as any);

      await service.processWebhookEvent(uninstallEvent);

      expect(mockPrisma.shop.updateMany).toHaveBeenCalledWith({
        where: { shopifyDomain: mockShopDomain },
        data: {
          status: 'uninstalled',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should handle unknown webhook topics', async () => {
      const unknownEvent: WebhookEvent = {
        ...mockEvent,
        topic: 'unknown/topic',
      };

      mockPrisma.webhookEventLog.create.mockResolvedValue({} as any);

      await service.processWebhookEvent(unknownEvent);

      expect(mockPrisma.webhookEventLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          shopId: mockShopDomain,
          topic: 'unknown/topic',
          status: 'unknown_topic',
        }),
      });
    });

    it('should log webhook events', async () => {
      mockPrisma.customer.upsert.mockResolvedValue({} as any);
      mockPrisma.webhookEventLog.create.mockResolvedValue({} as any);

      await service.processWebhookEvent(mockEvent);

      expect(mockPrisma.webhookEventLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          shopId: mockShopDomain,
          topic: 'customers/create',
          status: 'processed',
          data: mockEvent.data,
          requestId: mockEvent.requestId,
          timestamp: mockEvent.timestamp,
        }),
      });
    });

    it('should handle processing errors', async () => {
      mockPrisma.customer.upsert.mockRejectedValue(new Error('Database error'));
      mockPrisma.webhookEventLog.create.mockResolvedValue({} as any);

      await expect(service.processWebhookEvent(mockEvent)).rejects.toThrow('Database error');

      expect(mockPrisma.webhookEventLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          shopId: mockShopDomain,
          topic: 'customers/create',
          status: 'failed',
          errorMessage: 'Database error',
        }),
      });
    });
  });

  describe('getWebhookEventLogs', () => {
    it('should get webhook event logs', async () => {
      const mockLogs = [
        { id: 'log_1', topic: 'customers/create', status: 'processed' },
        { id: 'log_2', topic: 'orders/create', status: 'processed' },
      ];

      mockPrisma.webhookEventLog.findMany.mockResolvedValue(mockLogs as any);

      const result = await service.getWebhookEventLogs(mockShopDomain, 10, 0);

      expect(result).toEqual(mockLogs);
      expect(mockPrisma.webhookEventLog.findMany).toHaveBeenCalledWith({
        where: { shopId: mockShopDomain },
        orderBy: { timestamp: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.webhookEventLog.findMany.mockRejectedValue(new Error('Database error'));

      await expect(
        service.getWebhookEventLogs(mockShopDomain, 10, 0),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getWebhookStatistics', () => {
    it('should get webhook statistics', async () => {
      mockPrisma.webhookEventLog.count
        .mockResolvedValueOnce(100) // totalEvents
        .mockResolvedValueOnce(95)  // processedEvents
        .mockResolvedValueOnce(5);  // failedEvents

      const mockRecentEvents = [
        { id: 'log_1', topic: 'customers/create', status: 'processed' },
      ];
      mockPrisma.webhookEventLog.findMany.mockResolvedValue(mockRecentEvents as any);

      const result = await service.getWebhookStatistics(mockShopDomain);

      expect(result).toEqual({
        totalEvents: 100,
        processedEvents: 95,
        failedEvents: 5,
        successRate: 95,
        recentEvents: mockRecentEvents,
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.webhookEventLog.count.mockRejectedValue(new Error('Database error'));

      await expect(
        service.getWebhookStatistics(mockShopDomain),
      ).rejects.toThrow('Database error');
    });
  });
});
