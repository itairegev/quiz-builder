import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyOperationsService } from '../shopify-operations.service';
import { ShopifyGraphQLClientService } from '../shopify-graphql-client.service';
import { LoggerService } from '@shopify-quiz-builder/common';
import { MonitoringService } from '@shopify-quiz-builder/common';

// Mock the GraphQL client service
const mockGraphQLClient = {
  executeQuery: jest.fn(),
  executeMutation: jest.fn(),
  getRateLimitStatus: jest.fn(),
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

describe('ShopifyOperationsService', () => {
  let service: ShopifyOperationsService;
  let graphQLClient: ShopifyGraphQLClientService;

  const mockConfig = {
    shopDomain: 'test-shop.myshopify.com',
    accessToken: 'test-access-token',
    apiVersion: '2024-01',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyOperationsService,
        {
          provide: ShopifyGraphQLClientService,
          useValue: mockGraphQLClient,
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

    service = module.get<ShopifyOperationsService>(ShopifyOperationsService);
    graphQLClient = module.get<ShopifyGraphQLClientService>(ShopifyGraphQLClientService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getShopInfo', () => {
    it('should retrieve shop information successfully', async () => {
      const mockShopData = {
        shop: {
          id: 'gid://shopify/Shop/123',
          name: 'Test Shop',
          email: 'test@shop.com',
          myshopifyDomain: 'test-shop.myshopify.com',
          currencyCode: 'USD',
          primaryDomain: {
            url: 'https://test-shop.com',
            host: 'test-shop.com',
          },
          timezoneAbbreviation: 'EST',
          ianaTimezone: 'America/New_York',
          plan: {
            displayName: 'Basic Shopify',
            partnerDevelopment: false,
            shopifyPlus: false,
          },
        },
      };

      mockGraphQLClient.executeQuery.mockResolvedValue(mockShopData);

      const result = await service.getShopInfo(mockConfig, { shopId: 'shop_123' });

      expect(result).toEqual(mockShopData.shop);
      expect(mockGraphQLClient.executeQuery).toHaveBeenCalledWith(
        mockConfig,
        expect.stringContaining('query getShop'),
        {},
        { shopId: 'shop_123' }
      );
    });

    it('should handle errors when retrieving shop info', async () => {
      const mockError = new Error('Shop not found');
      mockGraphQLClient.executeQuery.mockRejectedValue(mockError);

      await expect(
        service.getShopInfo(mockConfig, { shopId: 'shop_123' })
      ).rejects.toThrow('Shop not found');
    });
  });

  describe('getProducts', () => {
    it('should retrieve products with pagination', async () => {
      const mockProductsData = {
        products: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          edges: [
            {
              node: {
                id: 'gid://shopify/Product/123',
                title: 'Test Product',
                handle: 'test-product',
                description: 'A test product',
                priceRange: {
                  minVariantPrice: {
                    amount: '19.99',
                    currencyCode: 'USD',
                  },
                },
                images: { edges: [] },
                variants: { edges: [] },
                tags: ['test'],
                productType: 'Test Type',
                vendor: 'Test Vendor',
              },
            },
          ],
        },
      };

      mockGraphQLClient.executeQuery.mockResolvedValue(mockProductsData);

      const result = await service.getProducts(mockConfig, { 
        first: 10, 
        shopId: 'shop_123' 
      });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].title).toBe('Test Product');
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it('should apply filters when provided', async () => {
      const mockProductsData = {
        products: {
          pageInfo: { hasNextPage: false, hasPreviousPage: false },
          edges: [],
        },
      };

      mockGraphQLClient.executeQuery.mockResolvedValue(mockProductsData);

      await service.getProducts(mockConfig, {
        query: 'test',
        productType: 'Test Type',
        tags: ['tag1', 'tag2'],
        shopId: 'shop_123',
      });

      expect(mockGraphQLClient.executeQuery).toHaveBeenCalledWith(
        mockConfig,
        expect.stringContaining('title:*test*'),
        { first: 50, after: undefined },
        { shopId: 'shop_123' }
      );
    });
  });

  describe('getCollections', () => {
    it('should retrieve collections with pagination', async () => {
      const mockCollectionsData = {
        collections: {
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          edges: [
            {
              node: {
                id: 'gid://shopify/Collection/123',
                title: 'Test Collection',
                handle: 'test-collection',
                description: 'A test collection',
                image: null,
                productsCount: 5,
              },
            },
          ],
        },
      };

      mockGraphQLClient.executeQuery.mockResolvedValue(mockCollectionsData);

      const result = await service.getCollections(mockConfig, { 
        first: 10, 
        shopId: 'shop_123' 
      });

      expect(result.collections).toHaveLength(1);
      expect(result.collections[0].title).toBe('Test Collection');
      expect(result.collections[0].productsCount).toBe(5);
    });
  });

  describe('getProduct', () => {
    it('should retrieve a product by ID', async () => {
      const mockProductData = {
        product: {
          id: 'gid://shopify/Product/123',
          title: 'Test Product',
          handle: 'test-product',
          description: 'A test product',
          priceRange: {
            minVariantPrice: {
              amount: '19.99',
              currencyCode: 'USD',
            },
          },
          images: { edges: [] },
          variants: { edges: [] },
          tags: ['test'],
          productType: 'Test Type',
          vendor: 'Test Vendor',
        },
      };

      mockGraphQLClient.executeQuery.mockResolvedValue(mockProductData);

      const result = await service.getProduct(
        mockConfig,
        'gid://shopify/Product/123',
        { shopId: 'shop_123' }
      );

      expect(result.title).toBe('Test Product');
      expect(mockGraphQLClient.executeQuery).toHaveBeenCalledWith(
        mockConfig,
        expect.stringContaining('query getProductById'),
        { id: 'gid://shopify/Product/123' },
        { shopId: 'shop_123' }
      );
    });

    it('should retrieve a product by handle', async () => {
      const mockProductData = {
        productByHandle: {
          id: 'gid://shopify/Product/123',
          title: 'Test Product',
          handle: 'test-product',
          description: 'A test product',
          priceRange: {
            minVariantPrice: {
              amount: '19.99',
              currencyCode: 'USD',
            },
          },
          images: { edges: [] },
          variants: { edges: [] },
          tags: ['test'],
          productType: 'Test Type',
          vendor: 'Test Vendor',
        },
      };

      mockGraphQLClient.executeQuery.mockResolvedValue(mockProductData);

      const result = await service.getProduct(
        mockConfig,
        'test-product',
        { shopId: 'shop_123' }
      );

      expect(result.title).toBe('Test Product');
      expect(mockGraphQLClient.executeQuery).toHaveBeenCalledWith(
        mockConfig,
        expect.stringContaining('query getProductByHandle'),
        { handle: 'test-product' },
        { shopId: 'shop_123' }
      );
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status from GraphQL client', () => {
      const mockRateLimitStatus = {
        admin: { calls: 5, remaining: 35, resetTime: new Date() },
        storefront: { calls: 3, remaining: 47, resetTime: new Date() },
      };

      mockGraphQLClient.getRateLimitStatus.mockReturnValue(mockRateLimitStatus);

      const result = service.getRateLimitStatus();

      expect(result).toEqual(mockRateLimitStatus);
      expect(mockGraphQLClient.getRateLimitStatus).toHaveBeenCalled();
    });
  });
});
