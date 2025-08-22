import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ShopifyService } from './shopify.service';
import { ShopifyController } from './shopify.controller';
import { ShopifyWebhookService } from './shopify-webhook.service';
import { ShopifyWebhookController } from './shopify-webhook.controller';
import { ShopifyWebhookManagerService } from './shopify-webhook-manager.service';
import { ShopifyGraphQLClientService } from './shopify-graphql-client.service';
import { ShopifyOperationsService } from './shopify-operations.service';
import { ShopifyConfigService } from './shopify-config.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ShopifyController, ShopifyWebhookController],
  providers: [
    ShopifyService,
    ShopifyWebhookService,
    ShopifyWebhookManagerService,
    ShopifyGraphQLClientService,
    ShopifyOperationsService,
    ShopifyConfigService,
  ],
  exports: [
    ShopifyService,
    ShopifyWebhookService,
    ShopifyWebhookManagerService,
    ShopifyGraphQLClientService,
    ShopifyOperationsService,
    ShopifyConfigService,
  ],
})
export class ShopifyModule {}
