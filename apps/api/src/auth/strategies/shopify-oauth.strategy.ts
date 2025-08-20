import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface ShopifyOAuthProfile {
  id: string;
  shop: string;
  accessToken: string;
  scope: string;
  state: string;
}

@Injectable()
export class ShopifyOAuthStrategy extends PassportStrategy(Strategy, 'shopify') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL: 'https://{shop}.myshopify.com/admin/oauth/authorize',
      tokenURL: 'https://{shop}.myshopify.com/admin/oauth/access_token',
      clientID: configService.get<string>('SHOPIFY_API_KEY'),
      clientSecret: configService.get<string>('SHOPIFY_API_SECRET'),
      callbackURL: configService.get<string>('SHOPIFY_APP_URL') + '/auth/shopify/callback',
      scope: configService.get<string>('SHOPIFY_SCOPES') || 'read_products,write_products',
      state: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: ShopifyOAuthProfile,
    done: Function,
  ): Promise<any> {
    try {
      // Validate the shop domain
      if (!profile.shop || !profile.shop.endsWith('.myshopify.com')) {
        return done(new UnauthorizedException('Invalid shop domain'), false);
      }

      // Validate access token
      if (!accessToken) {
        return done(new UnauthorizedException('No access token received'), false);
      }

      // Store shop info for later use
      const shopInfo = {
        shopId: profile.id,
        shopDomain: profile.shop,
        accessToken,
        scope: profile.scope,
        state: profile.state,
      };

      return done(null, shopInfo);
    } catch (error) {
      return done(error, false);
    }
  }

  // Override the authorization URL to include shop parameter
  authorizationParams(options: any): any {
    const shop = options.shop || options.req?.query?.shop;
    if (shop) {
      options.authorizationURL = options.authorizationURL.replace('{shop}', shop);
    }
    return options;
  }
}
