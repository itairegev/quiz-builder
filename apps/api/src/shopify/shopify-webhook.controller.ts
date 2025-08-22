import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ShopifyWebhookService, WebhookRegistration, WebhookSubscription } from './shopify-webhook.service';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard';
import { CurrentShop, CurrentShopId } from '../auth/decorators/current-shop.decorator';
import { ShopifyShop } from './shopify.service';

@ApiTags('shopify-webhooks')
@Controller('shopify/webhooks')
@UseGuards(ShopifyAuthGuard)
@ApiBearerAuth()
export class ShopifyWebhookController {
  private readonly logger = new Logger(ShopifyWebhookController.name);

  constructor(private readonly webhookService: ShopifyWebhookService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new webhook with Shopify' })
  @ApiResponse({ status: 201, description: 'Webhook registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook configuration' })
  async registerWebhook(
    @CurrentShop() shop: ShopifyShop,
    @CurrentShopId() shopId: string,
    @Body() webhookData: WebhookRegistration,
  ): Promise<WebhookSubscription> {
    this.logger.log(`Registering webhook for shop: ${shop.shopifyDomain}`);

    try {
      return await this.webhookService.registerWebhook(
        shop.shopifyDomain,
        shop.accessToken,
        webhookData,
      );
    } catch (error) {
      this.logger.error(`Failed to register webhook for ${shop.shopifyDomain}:`, error);
      throw error;
    }
  }

  @Delete('unregister/:webhookId')
  @ApiOperation({ summary: 'Unregister a webhook from Shopify' })
  @ApiResponse({ status: 200, description: 'Webhook unregistered successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiParam({ name: 'webhookId', description: 'Shopify webhook subscription ID' })
  async unregisterWebhook(
    @CurrentShop() shop: ShopifyShop,
    @CurrentShopId() shopId: string,
    @Param('webhookId') webhookId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Unregistering webhook ${webhookId} for shop: ${shop.shopifyDomain}`);

    try {
      const success = await this.webhookService.unregisterWebhook(
        shop.shopifyDomain,
        shop.accessToken,
        webhookId,
      );

      return {
        success,
        message: success ? 'Webhook unregistered successfully' : 'Failed to unregister webhook',
      };
    } catch (error) {
      this.logger.error(`Failed to unregister webhook ${webhookId} for ${shop.shopifyDomain}:`, error);
      throw error;
    }
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get all webhook subscriptions for a shop' })
  @ApiResponse({ status: 200, description: 'Webhook subscriptions retrieved successfully' })
  async getWebhookSubscriptions(
    @CurrentShop() shop: ShopifyShop,
    @CurrentShopId() shopId: string,
  ): Promise<WebhookSubscription[]> {
    this.logger.log(`Getting webhook subscriptions for shop: ${shop.shopifyDomain}`);

    try {
      return await this.webhookService.getWebhookSubscriptions(
        shop.shopifyDomain,
        shop.accessToken,
      );
    } catch (error) {
      this.logger.error(`Failed to get webhook subscriptions for ${shop.shopifyDomain}:`, error);
      throw error;
    }
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get webhook event logs for a shop' })
  @ApiResponse({ status: 200, description: 'Webhook logs retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of logs to return (default: 100)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of logs to skip (default: 0)' })
  async getWebhookLogs(
    @CurrentShop() shop: ShopifyShop,
    @CurrentShopId() shopId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<any[]> {
    this.logger.log(`Getting webhook logs for shop: ${shop.shopifyDomain}`);

    try {
      const limitNum = limit ? parseInt(limit, 10) : 100;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      if (limitNum < 1 || limitNum > 1000) {
        throw new BadRequestException('Limit must be between 1 and 1000');
      }

      if (offsetNum < 0) {
        throw new BadRequestException('Offset must be non-negative');
      }

      return await this.webhookService.getWebhookEventLogs(
        shop.shopifyDomain,
        limitNum,
        offsetNum,
      );
    } catch (error) {
      this.logger.error(`Failed to get webhook logs for ${shop.shopifyDomain}:`, error);
      throw error;
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get webhook statistics for a shop' })
  @ApiResponse({ status: 200, description: 'Webhook statistics retrieved successfully' })
  async getWebhookStatistics(
    @CurrentShop() shop: ShopifyShop,
    @CurrentShopId() shopId: string,
  ): Promise<any> {
    this.logger.log(`Getting webhook statistics for shop: ${shop.shopifyDomain}`);

    try {
      return await this.webhookService.getWebhookStatistics(shop.shopifyDomain);
    } catch (error) {
      this.logger.error(`Failed to get webhook statistics for ${shop.shopifyDomain}:`, error);
      throw error;
    }
  }

  @Post('test')
  @ApiOperation({ summary: 'Test webhook endpoint with sample data' })
  @ApiResponse({ status: 200, description: 'Test webhook processed successfully' })
  async testWebhook(
    @CurrentShop() shop: ShopifyShop,
    @CurrentShopId() shopId: string,
    @Body() testData: { topic: string; data: any },
  ): Promise<{ message: string; processed: boolean }> {
    this.logger.log(`Testing webhook for shop: ${shop.shopifyDomain} with topic: ${testData.topic}`);

    try {
      const event = {
        topic: testData.topic,
        shopDomain: shop.shopifyDomain,
        data: testData.data,
        timestamp: new Date(),
        requestId: `test_${Date.now()}`,
      };

      await this.webhookService.processWebhookEvent(event);

      return {
        message: 'Test webhook processed successfully',
        processed: true,
      };
    } catch (error) {
      this.logger.error(`Failed to process test webhook for ${shop.shopifyDomain}:`, error);
      throw error;
    }
  }

  @Post('bulk-register')
  @ApiOperation({ summary: 'Register multiple webhooks at once' })
  @ApiResponse({ status: 201, description: 'Webhooks registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook configuration' })
  async bulkRegisterWebhooks(
    @CurrentShop() shop: ShopifyShop,
    @CurrentShopId() shopId: string,
    @Body() webhooks: WebhookRegistration[],
  ): Promise<{ success: WebhookSubscription[]; failed: string[] }> {
    this.logger.log(`Bulk registering ${webhooks.length} webhooks for shop: ${shop.shopifyDomain}`);

    const success: WebhookSubscription[] = [];
    const failed: string[] = [];

    for (const webhook of webhooks) {
      try {
        const subscription = await this.webhookService.registerWebhook(
          shop.shopifyDomain,
          shop.accessToken,
          webhook,
        );
        success.push(subscription);
      } catch (error) {
        this.logger.error(`Failed to register webhook ${webhook.topic}:`, error);
        failed.push(`${webhook.topic}: ${error.message}`);
      }
    }

    return { success, failed };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check webhook system health' })
  @ApiResponse({ status: 200, description: 'Webhook system health status' })
  async getWebhookHealth(
    @CurrentShop() shop: ShopifyShop,
    @CurrentShopId() shopId: string,
  ): Promise<{ status: string; message: string; timestamp: string }> {
    this.logger.log(`Checking webhook health for shop: ${shop.shopifyDomain}`);

    try {
      // Get recent webhook statistics to check health
      const stats = await this.webhookService.getWebhookStatistics(shop.shopifyDomain);
      
      let status = 'healthy';
      let message = 'Webhook system is functioning normally';

      if (stats.failedEvents > 0) {
        const failureRate = (stats.failedEvents / stats.totalEvents) * 100;
        if (failureRate > 10) {
          status = 'degraded';
          message = `Webhook system has high failure rate: ${failureRate.toFixed(1)}%`;
        } else if (failureRate > 5) {
          status = 'warning';
          message = `Webhook system has moderate failure rate: ${failureRate.toFixed(1)}%`;
        }
      }

      if (stats.totalEvents === 0) {
        status = 'unknown';
        message = 'No webhook events processed yet';
      }

      return {
        status,
        message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to check webhook health for ${shop.shopifyDomain}:`, error);
      return {
        status: 'error',
        message: 'Failed to check webhook system health',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
