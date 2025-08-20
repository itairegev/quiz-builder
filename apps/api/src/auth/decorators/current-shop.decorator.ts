import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ShopifyShop } from '../../shopify/shopify.service';

export const CurrentShop = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ShopifyShop => {
    const request = ctx.switchToHttp().getRequest();
    return request.shop;
  },
);

export const CurrentShopId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.shopId;
  },
);
