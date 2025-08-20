import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentShop = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const shop = request.shop;
    
    if (!shop) {
      throw new Error('Shop not found in request. Make sure ShopifyAuthGuard is applied.');
    }
    
    // For now, return the shop domain as the shopId
    // In a real implementation, you'd look up the shop in the database
    return shop.domain;
  },
);
