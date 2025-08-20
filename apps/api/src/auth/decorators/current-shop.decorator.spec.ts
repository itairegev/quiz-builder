import { ExecutionContext } from '@nestjs/common';
import { CurrentShop, CurrentShopId } from './current-shop.decorator';

describe('Current Shop Decorators', () => {
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

  const mockExecutionContext: ExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        shop: mockShop,
        shopId: mockShop.id,
      }),
    }),
  } as ExecutionContext;

  describe('CurrentShop', () => {
    it('should extract shop from request', () => {
      const result = CurrentShop(undefined, mockExecutionContext);
      expect(result).toEqual(mockShop);
    });

    it('should handle request without shop context', () => {
      const contextWithoutShop: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      const result = CurrentShop(undefined, contextWithoutShop);
      expect(result).toBeUndefined();
    });

    it('should handle request with null shop context', () => {
      const contextWithNullShop: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ shop: null }),
        }),
      } as ExecutionContext;

      const result = CurrentShop(undefined, contextWithNullShop);
      expect(result).toBeNull();
    });
  });

  describe('CurrentShopId', () => {
    it('should extract shop ID from request', () => {
      const result = CurrentShopId(undefined, mockExecutionContext);
      expect(result).toBe(mockShop.id);
    });

    it('should handle request without shop ID context', () => {
      const contextWithoutShopId: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      const result = CurrentShopId(undefined, contextWithoutShopId);
      expect(result).toBeUndefined();
    });

    it('should handle request with null shop ID context', () => {
      const contextWithNullShopId: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ shopId: null }),
        }),
      } as ExecutionContext;

      const result = CurrentShopId(undefined, contextWithNullShopId);
      expect(result).toBeNull();
    });

    it('should handle request with empty string shop ID', () => {
      const contextWithEmptyShopId: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ shopId: '' }),
        }),
      } as ExecutionContext;

      const result = CurrentShopId(undefined, contextWithEmptyShopId);
      expect(result).toBe('');
    });
  });

  describe('Decorator behavior', () => {
    it('should ignore data parameter', () => {
      const resultWithData = CurrentShop('some-data', mockExecutionContext);
      const resultWithoutData = CurrentShop(undefined, mockExecutionContext);
      
      expect(resultWithData).toEqual(resultWithoutData);
      expect(resultWithData).toEqual(mockShop);
    });

    it('should ignore data parameter for CurrentShopId', () => {
      const resultWithData = CurrentShopId('some-data', mockExecutionContext);
      const resultWithoutData = CurrentShopId(undefined, mockExecutionContext);
      
      expect(resultWithData).toEqual(resultWithoutData);
      expect(resultWithData).toBe(mockShop.id);
    });

    it('should work with different shop data structures', () => {
      const differentShop = {
        id: 'different-id',
        shopifyDomain: 'different.myshopify.com',
        accessToken: 'different-token',
        scope: 'read_products',
        email: 'different@example.com',
        name: 'Different Shop',
        currency: 'EUR',
        timezone: 'Europe/London',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const contextWithDifferentShop: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            shop: differentShop,
            shopId: differentShop.id,
          }),
        }),
      } as ExecutionContext;

      const shopResult = CurrentShop(undefined, contextWithDifferentShop);
      const shopIdResult = CurrentShopId(undefined, contextWithDifferentShop);

      expect(shopResult).toEqual(differentShop);
      expect(shopIdResult).toBe(differentShop.id);
    });
  });
});
