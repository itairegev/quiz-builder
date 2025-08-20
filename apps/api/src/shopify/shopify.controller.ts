import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ShopifyService } from './shopify.service';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard';
import { CurrentShop, CurrentShopId } from '../auth/decorators/current-shop.decorator';
import { ShopifyShop } from './shopify.service';

@ApiTags('shopify')
@Controller('shopify')
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}

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
    // Validate webhook signature
    const config = this.shopifyService.getShopifyConfig();
    const isValid = this.shopifyService.validateWebhookSignature(
      JSON.stringify(webhookData),
      signature,
      config.webhookSecret,
    );

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Process webhook based on topic
    switch (topic) {
      case 'app/uninstalled':
        // Handle app uninstallation
        break;
      case 'shop/update':
        // Handle shop updates
        break;
      default:
        // Handle other webhook topics
        break;
    }

    return { message: 'Webhook processed successfully' };
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
