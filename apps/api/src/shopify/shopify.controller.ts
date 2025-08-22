import { Controller, Post, Body, Headers, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ShopifyService } from './shopify.service';
import { ShopifyWebhookService, WebhookEvent } from './shopify-webhook.service';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard';
import { CurrentShop, CurrentShopId } from '../auth/decorators/current-shop.decorator';
import { ShopifyShop } from './shopify.service';

@ApiTags('shopify')
@Controller('shopify')
export class ShopifyController {
  private readonly logger = new Logger(ShopifyController.name);

  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly webhookService: ShopifyWebhookService,
  ) {}

  @Post('install')
  @ApiOperation({ summary: 'Install app to a Shopify store' })
  @ApiResponse({ status: 201, description: 'App installed successfully' })
  async installApp(
    @Body() installData: {
      shopifyDomain: string;
      accessToken: string;
      scope: string;
      email?: string;
      name?: string;
    },
  ) {
    const shop = await this.shopifyService.upsertShop(installData);
    return {
      message: 'App installed successfully',
      shop: {
        id: shop.id,
        domain: shop.shopifyDomain,
        scope: shop.scope,
      },
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Shopify webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Body() webhookData: any,
    @Headers('x-shopify-hmac-sha256') signature: string,
    @Headers('x-shopify-topic') topic: string,
    @Headers('x-shopify-shop-domain') shopDomain: string,
  ) {
    this.logger.log(`Processing webhook: ${topic} for shop: ${shopDomain}`);

    try {
      // Validate webhook signature
      const config = this.shopifyService.getShopifyConfig();
      const isValid = this.webhookService.validateWebhookSignature(
        JSON.stringify(webhookData),
        signature,
        config.webhookSecret,
      );

      if (!isValid) {
        this.logger.warn(`Invalid webhook signature for shop: ${shopDomain}`);
        throw new Error('Invalid webhook signature');
      }

      // Create webhook event
      const event: WebhookEvent = {
        topic,
        shopDomain,
        data: webhookData,
        timestamp: new Date(),
        requestId: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // Process webhook event
      await this.webhookService.processWebhookEvent(event);

      this.logger.log(`Webhook processed successfully: ${topic} for shop: ${shopDomain}`);
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(`Error processing webhook ${topic} for shop ${shopDomain}:`, error);
      throw error;
    }
  }

  @Post('auth/callback')
  @UseGuards(ShopifyAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Handle OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth callback processed successfully' })
  async handleOAuthCallback(
    @CurrentShop() shop: ShopifyShop,
    @CurrentShopId() shopId: string,
    @Body() callbackData: any,
  ) {
    // Handle OAuth callback data
    // This would typically update the shop's access token and scope
    
    return {
      message: 'OAuth callback processed successfully',
      shopId,
      shopDomain: shop.shopifyDomain,
    };
  }
}
