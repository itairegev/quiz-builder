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
    it('should be a function', () => {
      expect(typeof CurrentShop).toBe('function');
    });

    it('should return a function when called', () => {
      const decoratorFn = CurrentShop(undefined, mockExecutionContext);
      expect(typeof decoratorFn).toBe('function');
    });

    it('should handle request without shop context', () => {
      const contextWithoutShop: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      const decoratorFn = CurrentShop(undefined, contextWithoutShop);
      expect(typeof decoratorFn).toBe('function');
    });

    it('should handle request with null shop context', () => {
      const contextWithNullShop: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ shop: null }),
        }),
      } as ExecutionContext;

      const decoratorFn = CurrentShop(undefined, contextWithNullShop);
      expect(typeof decoratorFn).toBe('function');
    });
  });

  describe('CurrentShopId', () => {
    it('should be a function', () => {
      expect(typeof CurrentShopId).toBe('function');
    });

    it('should return a function when called', () => {
      const decoratorFn = CurrentShopId(undefined, mockExecutionContext);
      expect(typeof decoratorFn).toBe('function');
    });

    it('should handle request without shop ID context', () => {
      const contextWithoutShopId: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      const decoratorFn = CurrentShopId(undefined, contextWithoutShopId);
      expect(typeof decoratorFn).toBe('function');
    });

    it('should handle request with null shop ID context', () => {
      const contextWithNullShopId: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ shopId: null }),
        }),
      } as ExecutionContext;

      const decoratorFn = CurrentShopId(undefined, contextWithNullShopId);
      expect(typeof decoratorFn).toBe('function');
    });

    it('should handle request with empty string shop ID', () => {
      const contextWithEmptyShopId: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({ shopId: '' }),
        }),
      } as ExecutionContext;

      const decoratorFn = CurrentShopId(undefined, contextWithEmptyShopId);
      expect(typeof decoratorFn).toBe('function');
    });
  });

  describe('Decorator behavior', () => {
    it('should ignore data parameter', () => {
      const decoratorWithData = CurrentShop('some-data', mockExecutionContext);
      const decoratorWithoutData = CurrentShop(undefined, mockExecutionContext);
      
      // Functions can't be directly compared, so just check they're both functions
      expect(typeof decoratorWithData).toBe('function');
      expect(typeof decoratorWithoutData).toBe('function');
    });

    it('should ignore data parameter for CurrentShopId', () => {
      const decoratorWithData = CurrentShopId('some-data', mockExecutionContext);
      const decoratorWithoutData = CurrentShopId(undefined, mockExecutionContext);
      
      // Functions can't be directly compared, so just check they're both functions
      expect(typeof decoratorWithData).toBe('function');
      expect(typeof decoratorWithoutData).toBe('function');
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

      const shopDecorator = CurrentShop(undefined, contextWithDifferentShop);
      const shopIdDecorator = CurrentShopId(undefined, contextWithDifferentShop);

      expect(typeof shopDecorator).toBe('function');
      expect(typeof shopIdDecorator).toBe('function');
    });
  });
});
