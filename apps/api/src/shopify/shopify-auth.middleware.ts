import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ShopifyService } from './shopify.service';

@Injectable()
export class ShopifyAuthMiddleware implements NestMiddleware {
  constructor(private readonly shopifyService: ShopifyService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const shopDomain = req.headers['x-shopify-shop-domain'] as string;
      const authHeader = req.headers.authorization;
      
      if (!shopDomain || !authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Shopify authentication required');
      }
      
      const accessToken = authHeader.replace('Bearer ', '');
      
      if (!accessToken) {
        throw new UnauthorizedException('Shopify authentication required');
      }

      // Authenticate the shop
      const authResult = await this.shopifyService.authenticateShop(shopDomain, accessToken);

      if (!authResult.isValid) {
        throw new UnauthorizedException('Invalid Shopify authentication');
      }

      // Attach shop information to the request
      req['shop'] = authResult.shop;
      req['shopId'] = authResult.shop.id;

      next();
    } catch (error) {
      next(error);
    }
  }
}
