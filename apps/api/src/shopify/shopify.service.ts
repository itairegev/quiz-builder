import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shopify-quiz-builder/database';

export interface ShopifyShop {
  id: string;
  shopifyDomain: string;
  accessToken: string;
  scope: string;
  email?: string;
  name?: string;
  currency: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopifyAuthResult {
  shop: ShopifyShop;
  isValid: boolean;
}

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Authenticate a Shopify request and return shop information
   */
  async authenticateShop(shopDomain: string, accessToken: string): Promise<ShopifyAuthResult> {
    try {
      // Find the shop in our database
      const shop = await this.prisma.shop.findUnique({
        where: { shopifyDomain: shopDomain },
      });

      if (!shop) {
        this.logger.warn(`Shop not found in database: ${shopDomain}`);
        return { shop: null, isValid: false };
      }

      // Verify the access token matches
      if (shop.accessToken !== accessToken) {
        this.logger.warn(`Invalid access token for shop: ${shopDomain}`);
        return { shop: null, isValid: false };
      }

      // TODO: In production, validate the token with Shopify's API
      // For now, we'll trust the stored token
      
      this.logger.log(`Successfully authenticated shop: ${shopDomain}`);
      return { shop, isValid: true };
    } catch (error) {
      this.logger.error(`Error authenticating shop ${shopDomain}:`, error);
      return { shop: null, isValid: false };
    }
  }

  /**
   * Get shop information by domain
   */
  async getShopByDomain(shopDomain: string): Promise<ShopifyShop | null> {
    try {
      return await this.prisma.shop.findUnique({
        where: { shopifyDomain: shopDomain },
      });
    } catch (error) {
      this.logger.error(`Error getting shop by domain ${shopDomain}:`, error);
      return null;
    }
  }

  /**
   * Create or update shop information
   */
  async upsertShop(shopData: {
    shopifyDomain: string;
    accessToken: string;
    scope: string;
    email?: string;
    name?: string;
    currency?: string;
    timezone?: string;
  }): Promise<ShopifyShop> {
    try {
      const shop = await this.prisma.shop.upsert({
        where: { shopifyDomain: shopData.shopifyDomain },
        update: {
          accessToken: shopData.accessToken,
          scope: shopData.scope,
          email: shopData.email,
          name: shopData.name,
          currency: shopData.currency || 'USD',
          timezone: shopData.timezone || 'UTC',
          updatedAt: new Date(),
        },
        create: {
          shopifyDomain: shopData.shopifyDomain,
          accessToken: shopData.accessToken,
          scope: shopData.scope,
          email: shopData.email,
          name: shopData.name,
          currency: shopData.currency || 'USD',
          timezone: shopData.timezone || 'UTC',
        },
      });

      this.logger.log(`Shop ${shopData.shopifyDomain} upserted successfully`);
      return shop;
    } catch (error) {
      this.logger.error(`Error upserting shop ${shopData.shopifyDomain}:`, error);
      throw error;
    }
  }

  /**
   * Validate Shopify webhook signature
   */
  validateWebhookSignature(
    body: string,
    signature: string,
    webhookSecret: string,
  ): boolean {
    // TODO: Implement proper HMAC validation
    // For now, return true in development
    if (this.configService.get('NODE_ENV') === 'development') {
      return true;
    }
    
    // In production, implement proper HMAC validation
    // const expectedSignature = crypto
    //   .createHmac('sha256', webhookSecret)
    //   .update(body, 'utf8')
    //   .digest('base64');
    // return crypto.timingSafeEqual(
    //   Buffer.from(signature),
    //   Buffer.from(expectedSignature)
    // );
    
    return false;
  }

  /**
   * Get Shopify API configuration
   */
  getShopifyConfig() {
    return {
      apiKey: this.configService.get<string>('SHOPIFY_API_KEY'),
      apiSecret: this.configService.get<string>('SHOPIFY_API_SECRET'),
      scopes: this.configService.get<string>('SHOPIFY_SCOPES'),
      webhookSecret: this.configService.get<string>('SHOPIFY_WEBHOOK_SECRET'),
      appUrl: this.configService.get<string>('SHOPIFY_APP_URL'),
    };
  }
}
