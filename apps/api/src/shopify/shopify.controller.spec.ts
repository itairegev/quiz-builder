import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyController } from './shopify.controller';
import { ShopifyService } from './shopify.service';

describe('ShopifyController', () => {
  let controller: ShopifyController;
  let shopifyService: ShopifyService;

  const mockShopifyService = {
    upsertShop: jest.fn(),
    validateWebhookSignature: jest.fn(),
    getShopifyConfig: jest.fn(),
  };

  const mockShop = {
    id: 'test-shop-id',
    shopifyDomain: 'test.myshopify.com',
    accessToken: 'test-token',
    scope: 'read_products,write_products',
    email: 'test@example.com',
    name: 'Test Shop',
    currency: 'USD',
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopifyController],
      providers: [
        {
          provide: ShopifyService,
          useValue: mockShopifyService,
        },
      ],
    }).compile();

    controller = module.get<ShopifyController>(ShopifyController);
    shopifyService = module.get<ShopifyService>(ShopifyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('installApp', () => {
    const installData = {
      shopifyDomain: 'test.myshopify.com',
      accessToken: 'test-token',
      scope: 'read_products,write_products',
      email: 'test@example.com',
      name: 'Test Shop',
    };

    it('should install app successfully', async () => {
      mockShopifyService.upsertShop.mockResolvedValue(mockShop);

      const result = await controller.installApp(installData);

      expect(result).toEqual({
        message: 'App installed successfully',
        shop: {
          id: mockShop.id,
          domain: mockShop.shopifyDomain,
          scope: mockShop.scope,
        },
      });
      expect(mockShopifyService.upsertShop).toHaveBeenCalledWith(installData);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      mockShopifyService.upsertShop.mockRejectedValue(error);

      await expect(controller.installApp(installData)).rejects.toThrow(error);
    });
  });

  describe('handleWebhook', () => {
    const webhookData = { test: 'data' };
    const signature = 'test-signature';
    const topic = 'app/uninstalled';
    const shopDomain = 'test.myshopify.com';

    it('should process webhook successfully with valid signature', async () => {
      const mockConfig = {
        webhookSecret: 'test-secret',
      };

      mockShopifyService.getShopifyConfig.mockReturnValue(mockConfig);
      mockShopifyService.validateWebhookSignature.mockReturnValue(true);

      const result = await controller.handleWebhook(
        webhookData,
        signature,
        topic,
        shopDomain
      );

      expect(result).toEqual({ message: 'Webhook processed successfully' });
      expect(mockShopifyService.validateWebhookSignature).toHaveBeenCalledWith(
        JSON.stringify(webhookData),
        signature,
        mockConfig.webhookSecret
      );
    });

    it('should throw error for invalid webhook signature', async () => {
      const mockConfig = {
        webhookSecret: 'test-secret',
      };

      mockShopifyService.getShopifyConfig.mockReturnValue(mockConfig);
      mockShopifyService.validateWebhookSignature.mockReturnValue(false);

      await expect(
        controller.handleWebhook(webhookData, signature, topic, shopDomain)
      ).rejects.toThrow('Invalid webhook signature');
    });

    it('should handle app/uninstalled topic', async () => {
      const mockConfig = {
        webhookSecret: 'test-secret',
      };

      mockShopifyService.getShopifyConfig.mockReturnValue(mockConfig);
      mockShopifyService.validateWebhookSignature.mockReturnValue(true);

      const result = await controller.handleWebhook(
        webhookData,
        signature,
        'app/uninstalled',
        shopDomain
      );

      expect(result).toEqual({ message: 'Webhook processed successfully' });
    });

    it('should handle shop/update topic', async () => {
      const mockConfig = {
        webhookSecret: 'test-secret',
      };

      mockShopifyService.getShopifyConfig.mockReturnValue(mockConfig);
      mockShopifyService.validateWebhookSignature.mockReturnValue(true);

      const result = await controller.handleWebhook(
        webhookData,
        signature,
        'shop/update',
        shopDomain
      );

      expect(result).toEqual({ message: 'Webhook processed successfully' });
    });

    it('should handle unknown webhook topics', async () => {
      const mockConfig = {
        webhookSecret: 'test-secret',
      };

      mockShopifyService.getShopifyConfig.mockReturnValue(mockConfig);
      mockShopifyService.validateWebhookSignature.mockReturnValue(true);

      const result = await controller.handleWebhook(
        webhookData,
        signature,
        'unknown/topic',
        shopDomain
      );

      expect(result).toEqual({ message: 'Webhook processed successfully' });
    });
  });

  describe('handleOAuthCallback', () => {
    const callbackData = { code: 'test-code', state: 'test-state' };

    it('should process OAuth callback successfully', async () => {
      const result = await controller.handleOAuthCallback(
        mockShop,
        mockShop.id,
        callbackData
      );

      expect(result).toEqual({
        message: 'OAuth callback processed successfully',
        shopId: mockShop.id,
        shopDomain: mockShop.shopifyDomain,
      });
    });

    it('should handle different shop data', async () => {
      const differentShop = {
        ...mockShop,
        id: 'different-shop-id',
        shopifyDomain: 'different.myshopify.com',
      };

      const result = await controller.handleOAuthCallback(
        differentShop,
        differentShop.id,
        callbackData
      );

      expect(result).toEqual({
        message: 'OAuth callback processed successfully',
        shopId: differentShop.id,
        shopDomain: differentShop.shopifyDomain,
      });
    });
  });
});
