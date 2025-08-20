import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ShopifyService, ShopifyShop, ShopifyAuthResult } from './shopify.service';
import { PrismaService } from '@shopify-quiz-builder/database';

describe('ShopifyService', () => {
  let service: ShopifyService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockShop: ShopifyShop = {
    id: 'test-shop-id',
    shopifyDomain: 'test.myshopify.com',
    accessToken: 'test-access-token',
    scope: 'read_products,write_products',
    email: 'test@example.com',
    name: 'Test Shop',
    currency: 'USD',
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    shop: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ShopifyService>(ShopifyService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticateShop', () => {
    it('should successfully authenticate a valid shop', async () => {
      mockPrismaService.shop.findUnique.mockResolvedValue(mockShop);

      const result: ShopifyAuthResult = await service.authenticateShop(
        'test.myshopify.com',
        'test-access-token'
      );

      expect(result.isValid).toBe(true);
      expect(result.shop).toEqual(mockShop);
      expect(mockPrismaService.shop.findUnique).toHaveBeenCalledWith({
        where: { shopifyDomain: 'test.myshopify.com' },
      });
    });

    it('should return invalid result when shop not found', async () => {
      mockPrismaService.shop.findUnique.mockResolvedValue(null);

      const result: ShopifyAuthResult = await service.authenticateShop(
        'nonexistent.myshopify.com',
        'test-token'
      );

      expect(result.isValid).toBe(false);
      expect(result.shop).toBeNull();
    });

    it('should return invalid result when access token does not match', async () => {
      mockPrismaService.shop.findUnique.mockResolvedValue(mockShop);

      const result: ShopifyAuthResult = await service.authenticateShop(
        'test.myshopify.com',
        'wrong-token'
      );

      expect(result.isValid).toBe(false);
      expect(result.shop).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaService.shop.findUnique.mockRejectedValue(new Error('Database error'));

      const result: ShopifyAuthResult = await service.authenticateShop(
        'test.myshopify.com',
        'test-token'
      );

      expect(result.isValid).toBe(false);
      expect(result.shop).toBeNull();
    });
  });

  describe('getShopByDomain', () => {
    it('should return shop when found', async () => {
      mockPrismaService.shop.findUnique.mockResolvedValue(mockShop);

      const result = await service.getShopByDomain('test.myshopify.com');

      expect(result).toEqual(mockShop);
      expect(mockPrismaService.shop.findUnique).toHaveBeenCalledWith({
        where: { shopifyDomain: 'test.myshopify.com' },
      });
    });

    it('should return null when shop not found', async () => {
      mockPrismaService.shop.findUnique.mockResolvedValue(null);

      const result = await service.getShopByDomain('nonexistent.myshopify.com');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaService.shop.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await service.getShopByDomain('test.myshopify.com');

      expect(result).toBeNull();
    });
  });

  describe('upsertShop', () => {
    const shopData = {
      shopifyDomain: 'test.myshopify.com',
      accessToken: 'new-access-token',
      scope: 'read_products,write_products,read_customers',
      email: 'new@example.com',
      name: 'New Test Shop',
      currency: 'EUR',
      timezone: 'Europe/London',
    };

    it('should create new shop when it does not exist', async () => {
      const newShop = { ...mockShop, ...shopData };
      mockPrismaService.shop.upsert.mockResolvedValue(newShop);

      const result = await service.upsertShop(shopData);

      expect(result).toEqual(newShop);
      expect(mockPrismaService.shop.upsert).toHaveBeenCalledWith({
        where: { shopifyDomain: shopData.shopifyDomain },
        update: {
          accessToken: shopData.accessToken,
          scope: shopData.scope,
          email: shopData.email,
          name: shopData.name,
          currency: shopData.currency,
          timezone: shopData.timezone,
          updatedAt: expect.any(Date),
        },
        create: shopData,
      });
    });

    it('should update existing shop when it exists', async () => {
      const updatedShop = { ...mockShop, ...shopData };
      mockPrismaService.shop.upsert.mockResolvedValue(updatedShop);

      const result = await service.upsertShop(shopData);

      expect(result).toEqual(updatedShop);
    });

    it('should use default values when currency and timezone not provided', async () => {
      const shopDataWithoutDefaults = {
        shopifyDomain: 'test.myshopify.com',
        accessToken: 'test-token',
        scope: 'read_products',
      };

      mockPrismaService.shop.upsert.mockResolvedValue(mockShop);

      await service.upsertShop(shopDataWithoutDefaults);

      expect(mockPrismaService.shop.upsert).toHaveBeenCalledWith({
        where: { shopifyDomain: shopDataWithoutDefaults.shopifyDomain },
        update: {
          accessToken: shopDataWithoutDefaults.accessToken,
          scope: shopDataWithoutDefaults.scope,
          email: undefined,
          name: undefined,
          currency: 'USD',
          timezone: 'UTC',
          updatedAt: expect.any(Date),
        },
        create: {
          ...shopDataWithoutDefaults,
          currency: 'USD',
          timezone: 'UTC',
        },
      });
    });

    it('should handle database errors', async () => {
      mockPrismaService.shop.upsert.mockRejectedValue(new Error('Database error'));

      await expect(service.upsertShop(shopData)).rejects.toThrow('Database error');
    });
  });

  describe('validateWebhookSignature', () => {
    it('should return true in development environment', () => {
      mockConfigService.get.mockReturnValue('development');

      const result = service.validateWebhookSignature(
        'test-body',
        'test-signature',
        'test-secret'
      );

      expect(result).toBe(true);
    });

    it('should return false in production environment', () => {
      mockConfigService.get.mockReturnValue('production');

      const result = service.validateWebhookSignature(
        'test-body',
        'test-signature',
        'test-secret'
      );

      expect(result).toBe(false);
    });
  });

  describe('getShopifyConfig', () => {
    it('should return Shopify configuration from environment variables', () => {
      const mockConfig = {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        scopes: 'read_products,write_products',
        webhookSecret: 'test-webhook-secret',
        appUrl: 'https://test-app.com',
      };

      mockConfigService.get
        .mockReturnValueOnce(mockConfig.apiKey)
        .mockReturnValueOnce(mockConfig.apiSecret)
        .mockReturnValueOnce(mockConfig.scopes)
        .mockReturnValueOnce(mockConfig.webhookSecret)
        .mockReturnValueOnce(mockConfig.appUrl);

      const result = service.getShopifyConfig();

      expect(result).toEqual(mockConfig);
      expect(configService.get).toHaveBeenCalledWith('SHOPIFY_API_KEY');
      expect(configService.get).toHaveBeenCalledWith('SHOPIFY_API_SECRET');
      expect(configService.get).toHaveBeenCalledWith('SHOPIFY_SCOPES');
      expect(configService.get).toHaveBeenCalledWith('SHOPIFY_WEBHOOK_SECRET');
      expect(configService.get).toHaveBeenCalledWith('SHOPIFY_APP_URL');
    });
  });
});
