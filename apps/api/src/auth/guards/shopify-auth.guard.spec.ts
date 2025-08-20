import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ShopifyAuthGuard } from './shopify-auth.guard';
import { ShopifyService } from '../../shopify/shopify.service';

describe('ShopifyAuthGuard', () => {
  let guard: ShopifyAuthGuard;
  let shopifyService: ShopifyService;

  const mockShopifyService = {
    authenticateShop: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {},
      }),
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyAuthGuard,
        {
          provide: ShopifyService,
          useValue: mockShopifyService,
        },
      ],
    }).compile();

    guard = module.get<ShopifyAuthGuard>(ShopifyAuthGuard);
    shopifyService = module.get<ShopifyService>(ShopifyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when authentication is successful', async () => {
      const mockShop = {
        id: 'test-shop-id',
        shopifyDomain: 'test.myshopify.com',
        accessToken: 'test-token',
        scope: 'read_products',
        email: 'test@example.com',
        name: 'Test Shop',
        currency: 'USD',
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = {
        headers: {
          'x-shopify-shop-domain': 'test.myshopify.com',
          authorization: 'Bearer test-token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      mockShopifyService.authenticateShop.mockResolvedValue({
        shop: mockShop,
        isValid: true,
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockShopifyService.authenticateShop).toHaveBeenCalledWith(
        'test.myshopify.com',
        'test-token'
      );
      expect(mockRequest.shop).toEqual(mockShop);
      expect(mockRequest.shopId).toBe('test-shop-id');
    });

    it('should throw UnauthorizedException when shop domain is missing', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer test-token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('Shopify authentication required')
      );
    });

    it('should throw UnauthorizedException when access token is missing', async () => {
      const mockRequest = {
        headers: {
          'x-shopify-shop-domain': 'test.myshopify.com',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('Shopify authentication required')
      );
    });

    it('should throw UnauthorizedException when access token is empty', async () => {
      const mockRequest = {
        headers: {
          'x-shopify-shop-domain': 'test.myshopify.com',
          authorization: 'Bearer ',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('Shopify authentication required')
      );
    });

    it('should throw UnauthorizedException when authentication fails', async () => {
      const mockRequest = {
        headers: {
          'x-shopify-shop-domain': 'test.myshopify.com',
          authorization: 'Bearer invalid-token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      mockShopifyService.authenticateShop.mockResolvedValue({
        shop: null,
        isValid: false,
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('Invalid Shopify authentication')
      );
    });

    it('should properly extract Bearer token from authorization header', async () => {
      const mockRequest = {
        headers: {
          'x-shopify-shop-domain': 'test.myshopify.com',
          authorization: 'Bearer test-bearer-token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const mockShop = {
        id: 'test-shop-id',
        shopifyDomain: 'test.myshopify.com',
        accessToken: 'test-bearer-token',
        scope: 'read_products',
        email: 'test@example.com',
        name: 'Test Shop',
        currency: 'USD',
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockShopifyService.authenticateShop.mockResolvedValue({
        shop: mockShop,
        isValid: true,
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockShopifyService.authenticateShop).toHaveBeenCalledWith(
        'test.myshopify.com',
        'test-bearer-token'
      );
    });

    it('should handle malformed authorization header', async () => {
      const mockRequest = {
        headers: {
          'x-shopify-shop-domain': 'test.myshopify.com',
          authorization: 'InvalidFormat test-token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException('Shopify authentication required')
      );
    });

    it('should handle authentication service errors', async () => {
      const mockRequest = {
        headers: {
          'x-shopify-shop-domain': 'test.myshopify.com',
          authorization: 'Bearer test-token',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const error = new Error('Service error');
      mockShopifyService.authenticateShop.mockRejectedValue(error);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(error);
    });
  });
});
