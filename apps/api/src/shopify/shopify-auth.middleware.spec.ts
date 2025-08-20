import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ShopifyAuthMiddleware } from './shopify-auth.middleware';
import { ShopifyService } from './shopify.service';

describe('ShopifyAuthMiddleware', () => {
  let middleware: ShopifyAuthMiddleware;
  let shopifyService: ShopifyService;

  const mockShopifyService = {
    authenticateShop: jest.fn(),
  };

  const mockRequest = {
    headers: {},
  } as any;

  const mockResponse = {} as any;

  const mockNext = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyAuthMiddleware,
        {
          provide: ShopifyService,
          useValue: mockShopifyService,
        },
      ],
    }).compile();

    middleware = module.get<ShopifyAuthMiddleware>(ShopifyAuthMiddleware);
    shopifyService = module.get<ShopifyService>(ShopifyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should call next() when authentication is successful', async () => {
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

      mockRequest.headers = {
        'x-shopify-shop-domain': 'test.myshopify.com',
        authorization: 'Bearer test-token',
      };

      mockShopifyService.authenticateShop.mockResolvedValue({
        shop: mockShop,
        isValid: true,
      });

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockShopifyService.authenticateShop).toHaveBeenCalledWith(
        'test.myshopify.com',
        'test-token'
      );
      expect(mockRequest.shop).toEqual(mockShop);
      expect(mockRequest.shopId).toBe('test-shop-id');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw UnauthorizedException when shop domain is missing', async () => {
      mockRequest.headers = {
        authorization: 'Bearer test-token',
      };

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Shopify authentication required',
        })
      );
    });

    it('should throw UnauthorizedException when access token is missing', async () => {
      mockRequest.headers = {
        'x-shopify-shop-domain': 'test.myshopify.com',
      };

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Shopify authentication required',
        })
      );
    });

    it('should throw UnauthorizedException when access token is empty', async () => {
      mockRequest.headers = {
        'x-shopify-shop-domain': 'test.myshopify.com',
        authorization: 'Bearer ',
      };

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Shopify authentication required',
        })
      );
    });

    it('should throw UnauthorizedException when authentication fails', async () => {
      mockRequest.headers = {
        'x-shopify-shop-domain': 'test.myshopify.com',
        authorization: 'Bearer invalid-token',
      };

      mockShopifyService.authenticateShop.mockResolvedValue({
        shop: null,
        isValid: false,
      });

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid Shopify authentication',
        })
      );
    });

    it('should handle authentication service errors', async () => {
      mockRequest.headers = {
        'x-shopify-shop-domain': 'test.myshopify.com',
        authorization: 'Bearer test-token',
      };

      const error = new Error('Service error');
      mockShopifyService.authenticateShop.mockRejectedValue(error);

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should properly extract Bearer token from authorization header', async () => {
      mockRequest.headers = {
        'x-shopify-shop-domain': 'test.myshopify.com',
        authorization: 'Bearer test-bearer-token',
      };

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

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockShopifyService.authenticateShop).toHaveBeenCalledWith(
        'test.myshopify.com',
        'test-bearer-token'
      );
    });

    it('should handle malformed authorization header', async () => {
      mockRequest.headers = {
        'x-shopify-shop-domain': 'test.myshopify.com',
        authorization: 'InvalidFormat test-token',
      };

      await middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Shopify authentication required',
        })
      );
    });
  });
});
