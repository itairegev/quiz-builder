import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ShopifyService } from '../../shopify/shopify.service';

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  constructor(private readonly shopifyService: ShopifyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const shopDomain = request.headers['x-shopify-shop-domain'] as string;
    const authHeader = request.headers.authorization;
    
    // Validate authorization header format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Shopify authentication required');
    }
    
    const accessToken = authHeader.replace('Bearer ', '');

    if (!shopDomain || !accessToken) {
      throw new UnauthorizedException('Shopify authentication required');
    }

    // Authenticate the shop
    const authResult = await this.shopifyService.authenticateShop(shopDomain, accessToken);

    if (!authResult.isValid) {
      throw new UnauthorizedException('Invalid Shopify authentication');
    }

    // Store shop info in request for later use
    request['shop'] = authResult.shop;
    request['shopId'] = authResult.shop.id;

    return true;
  }
}
