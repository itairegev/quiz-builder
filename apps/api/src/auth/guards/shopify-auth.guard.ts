import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const shopifyDomain = request.headers['x-shopify-shop-domain'] as string;
    const accessToken = request.headers.authorization?.replace('Bearer ', '');

    if (!shopifyDomain || !accessToken) {
      throw new UnauthorizedException('Shopify authentication required');
    }

    // Store shop info in request for later use
    request['shop'] = {
      domain: shopifyDomain,
      accessToken,
    };

    return true;
  }
}
