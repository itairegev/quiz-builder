import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shopify-quiz-builder/database';
import * as crypto from 'crypto';
import { ShopifyGraphQLClientService } from './shopify-graphql-client.service';
import { ShopifyGraphQLConfig } from './shopify-graphql-client.service';

export interface WebhookEvent {
  topic: string;
  shopDomain: string;
  data: any;
  timestamp: Date;
  requestId: string;
}

export interface WebhookRegistration {
  topic: string;
  address: string;
  format: 'json' | 'xml';
  version: string;
  includeFields?: string[];
  metafieldNamespaces?: string[];
  privateMetafieldNamespaces?: string[];
}

export interface WebhookSubscription {
  id: string;
  topic: string;
  address: string;
  format: string;
  version: string;
  status: 'active' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ShopifyWebhookService {
  private readonly logger = new Logger(ShopifyWebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly graphQLClient: ShopifyGraphQLClientService,
  ) {}

  /**
   * Validate webhook signature using HMAC-SHA256
   */
  validateWebhookSignature(
    body: string,
    signature: string,
    webhookSecret: string,
  ): boolean {
    try {
      if (!signature || !webhookSecret) {
        this.logger.warn('Missing webhook signature or secret');
        return false;
      }

      // In development, allow bypass for testing
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.debug('Development mode: bypassing webhook signature validation');
        return true;
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body, 'utf8')
        .digest('base64');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        this.logger.warn('Webhook signature validation failed', {
          expected: expectedSignature,
          received: signature,
        });
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Register webhook with Shopify
   */
  async registerWebhook(
    shopDomain: string,
    accessToken: string,
    webhook: WebhookRegistration,
  ): Promise<WebhookSubscription> {
    try {
      const config: ShopifyGraphQLConfig = {
        shopDomain,
        accessToken,
        apiVersion: this.configService.get('SHOPIFY_API_VERSION') || '2024-01',
      };

      const mutation = `
        mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            webhookSubscription {
              id
              topic
              endpoint {
                __typename
                ... on WebhookHttpEndpoint {
                  callbackUrl
                }
              }
              format
              version
              createdAt
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        topic: webhook.topic,
        webhookSubscription: {
          callbackUrl: webhook.address,
          format: webhook.format.toUpperCase(),
          version: webhook.version,
          includeFields: webhook.includeFields,
          metafieldNamespaces: webhook.metafieldNamespaces,
          privateMetafieldNamespaces: webhook.privateMetafieldNamespaces,
        },
      };

      const result = await this.graphQLClient.executeMutation(config, mutation, variables) as any;

      if (result.webhookSubscriptionCreate.userErrors?.length > 0) {
        const errors = result.webhookSubscriptionCreate.userErrors;
        this.logger.error('Failed to register webhook:', errors);
        throw new BadRequestException(`Webhook registration failed: ${errors[0].message}`);
      }

      const subscription = result.webhookSubscriptionCreate.webhookSubscription;
      
      // Store webhook subscription in database
      await this.prisma.webhookSubscription.upsert({
        where: { 
          shopId_topic: {
            shopId: shopDomain,
            topic: webhook.topic,
          }
        },
        update: {
          address: subscription.endpoint.callbackUrl,
          format: subscription.format,
          version: subscription.version,
          status: 'active',
          updatedAt: new Date(),
        },
        create: {
          shopId: shopDomain,
          topic: webhook.topic,
          address: subscription.endpoint.callbackUrl,
          format: subscription.format,
          version: subscription.version,
          status: 'active',
        },
      });

      this.logger.log(`Webhook registered successfully for ${shopDomain}: ${webhook.topic}`);

      return {
        id: subscription.id,
        topic: subscription.topic,
        address: subscription.endpoint.callbackUrl,
        format: subscription.format,
        version: subscription.version,
        status: 'active',
        createdAt: new Date(subscription.createdAt),
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error registering webhook for ${shopDomain}:`, error);
      throw error;
    }
  }

  /**
   * Unregister webhook from Shopify
   */
  async unregisterWebhook(
    shopDomain: string,
    accessToken: string,
    webhookId: string,
  ): Promise<boolean> {
    try {
      const config: ShopifyGraphQLConfig = {
        shopDomain,
        accessToken,
        apiVersion: this.configService.get('SHOPIFY_API_VERSION') || '2024-01',
      };

      const mutation = `
        mutation webhookSubscriptionDelete($id: ID!) {
          webhookSubscriptionDelete(input: { id: $id }) {
            deletedWebhookSubscriptionId
            userErrors {
              field
              message
            }
          }
        }
      `;

      const result = await this.graphQLClient.executeMutation(config, mutation, { id: webhookId }) as any;

      if (result.webhookSubscriptionDelete.userErrors?.length > 0) {
        const errors = result.webhookSubscriptionDelete.userErrors;
        this.logger.error('Failed to unregister webhook:', errors);
        throw new BadRequestException(`Webhook unregistration failed: ${errors[0].message}`);
      }

      // Update database status
      await this.prisma.webhookSubscription.updateMany({
        where: { 
          shopId: shopDomain,
          topic: webhookId,
        },
        data: {
          status: 'disabled',
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Webhook unregistered successfully for ${shopDomain}: ${webhookId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error unregistering webhook for ${shopDomain}:`, error);
      throw error;
    }
  }

  /**
   * Get webhook subscriptions for a shop
   */
  async getWebhookSubscriptions(
    shopDomain: string,
    accessToken: string,
  ): Promise<WebhookSubscription[]> {
    try {
      const config: ShopifyGraphQLConfig = {
        shopDomain,
        accessToken,
        apiVersion: this.configService.get('SHOPIFY_API_VERSION') || '2024-01',
      };

      const query = `
        query {
          webhookSubscriptions(first: 50) {
            edges {
              node {
                id
                topic
                endpoint {
                  __typename
                  ... on WebhookHttpEndpoint {
                    callbackUrl
                  }
                }
                format
                version
                createdAt
                updatedAt
              }
            }
          }
        }
      `;

      const result = await this.graphQLClient.executeQuery(config, query) as any;
      
      return result.webhookSubscriptions.edges.map((edge: any) => ({
        id: edge.node.id,
        topic: edge.node.topic,
        address: edge.node.endpoint.callbackUrl,
        format: edge.node.format,
        version: edge.node.version,
        status: 'active', // Shopify doesn't provide status in this query
        createdAt: new Date(edge.node.createdAt),
        updatedAt: new Date(edge.node.updatedAt),
      }));
    } catch (error) {
      this.logger.error(`Error getting webhook subscriptions for ${shopDomain}:`, error);
      throw error;
    }
  }

  /**
   * Process webhook event based on topic
   */
  async processWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      this.logger.log(`Processing webhook event: ${event.topic} for ${event.shopDomain}`);

      switch (event.topic) {
        case 'app/uninstalled':
          await this.handleAppUninstalled(event);
          break;
        case 'app/installed':
          await this.handleAppInstalled(event);
          break;
        case 'customers/create':
          await this.handleCustomerCreated(event);
          break;
        case 'customers/update':
          await this.handleCustomerUpdated(event);
          break;
        case 'orders/create':
          await this.handleOrderCreated(event);
          break;
        case 'orders/fulfilled':
          await this.handleOrderFulfilled(event);
          break;
        case 'shop/update':
          await this.handleShopUpdated(event);
          break;
        case 'products/create':
          await this.handleProductCreated(event);
          break;
        case 'products/update':
          await this.handleProductUpdated(event);
          break;
        case 'collections/create':
          await this.handleCollectionCreated(event);
          break;
        case 'collections/update':
          await this.handleCollectionUpdated(event);
          break;
        default:
          this.logger.warn(`Unknown webhook topic: ${event.topic}`);
          await this.handleUnknownTopic(event);
      }

      // Log successful processing
      await this.logWebhookEvent(event, 'processed');
      
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event.topic}:`, error);
      await this.logWebhookEvent(event, 'failed', error.message);
      throw error;
    }
  }

  /**
   * Handle app uninstallation
   */
  private async handleAppUninstalled(event: WebhookEvent): Promise<void> {
    this.logger.log(`App uninstalled from shop: ${event.shopDomain}`);
    
    // Update shop status in database
    await this.prisma.shop.updateMany({
      where: { shopifyDomain: event.shopDomain },
      data: {
        status: 'uninstalled',
        updatedAt: new Date(),
      },
    });

    // Clean up shop-specific data
    await this.cleanupShopData(event.shopDomain);
  }

  /**
   * Handle app installation
   */
  private async handleAppInstalled(event: WebhookEvent): Promise<void> {
    this.logger.log(`App installed on shop: ${event.shopDomain}`);
    
    // Update shop status in database
    await this.prisma.shop.updateMany({
      where: { shopifyDomain: event.shopDomain },
      data: {
        status: 'active',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Handle customer creation
   */
  private async handleCustomerCreated(event: WebhookEvent): Promise<void> {
    this.logger.log(`Customer created in shop: ${event.shopDomain}`);
    
    const customerData = event.data;
    
    // Store customer data for quiz analytics
    await this.prisma.customer.upsert({
      where: { 
        shopifyCustomerId_shopId: {
          shopifyCustomerId: customerData.id.toString(),
          shopId: event.shopDomain,
        }
      },
      update: {
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        updatedAt: new Date(),
      },
      create: {
        shopifyCustomerId: customerData.id.toString(),
        shopId: event.shopDomain,
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
      },
    });
  }

  /**
   * Handle customer updates
   */
  private async handleCustomerUpdated(event: WebhookEvent): Promise<void> {
    this.logger.log(`Customer updated in shop: ${event.shopDomain}`);
    
    const customerData = event.data;
    
    // Update customer data
    await this.prisma.customer.updateMany({
      where: { 
        shopifyCustomerId: customerData.id.toString(),
        shopId: event.shopDomain,
      },
      data: {
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Handle order creation
   */
  private async handleOrderCreated(event: WebhookEvent): Promise<void> {
    this.logger.log(`Order created in shop: ${event.shopDomain}`);
    
    const orderData = event.data;
    
    // Store order data for quiz analytics
    await this.prisma.order.upsert({
      where: { 
        shopifyOrderId_shopId: {
          shopifyOrderId: orderData.id.toString(),
          shopId: event.shopDomain,
        }
      },
      update: {
        orderNumber: orderData.order_number,
        totalPrice: orderData.total_price,
        currency: orderData.currency,
        customerId: orderData.customer?.id?.toString(),
        updatedAt: new Date(),
      },
      create: {
        shopifyOrderId: orderData.id.toString(),
        shopId: event.shopDomain,
        orderNumber: orderData.order_number,
        totalPrice: orderData.total_price,
        currency: orderData.currency,
        customerId: orderData.customer?.id?.toString(),
      },
    });
  }

  /**
   * Handle order fulfillment
   */
  private async handleOrderFulfilled(event: WebhookEvent): Promise<void> {
    this.logger.log(`Order fulfilled in shop: ${event.shopDomain}`);
    
    const orderData = event.data;
    
    // Update order status
    await this.prisma.order.updateMany({
      where: { 
        shopifyOrderId: orderData.id.toString(),
        shopId: event.shopDomain,
      },
      data: {
        status: 'fulfilled',
        fulfilledAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Handle shop updates
   */
  private async handleShopUpdated(event: WebhookEvent): Promise<void> {
    this.logger.log(`Shop updated: ${event.shopDomain}`);
    
    const shopData = event.data;
    
    // Update shop information
    await this.prisma.shop.updateMany({
      where: { shopifyDomain: event.shopDomain },
      data: {
        name: shopData.name,
        email: shopData.email,
        currency: shopData.currency,
        timezone: shopData.iana_timezone,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Handle product creation
   */
  private async handleProductCreated(event: WebhookEvent): Promise<void> {
    this.logger.log(`Product created in shop: ${event.shopDomain}`);
    
    const productData = event.data;
    
    // Store product data for quiz recommendations
    await this.prisma.product.upsert({
      where: { 
        shopifyProductId_shopId: {
          shopifyProductId: productData.id.toString(),
          shopId: event.shopDomain,
        }
      },
      update: {
        title: productData.title,
        handle: productData.handle,
        productType: productData.product_type,
        vendor: productData.vendor,
        tags: productData.tags,
        updatedAt: new Date(),
      },
      create: {
        shopifyProductId: productData.id.toString(),
        shopId: event.shopDomain,
        title: productData.title,
        handle: productData.handle,
        productType: productData.product_type,
        vendor: productData.vendor,
        tags: productData.tags,
      },
    });
  }

  /**
   * Handle product updates
   */
  private async handleProductUpdated(event: WebhookEvent): Promise<void> {
    this.logger.log(`Product updated in shop: ${event.shopDomain}`);
    
    const productData = event.data;
    
    // Update product data
    await this.prisma.product.updateMany({
      where: { 
        shopifyProductId: productData.id.toString(),
        shopId: event.shopDomain,
      },
      data: {
        title: productData.title,
        handle: productData.handle,
        productType: productData.product_type,
        vendor: productData.vendor,
        tags: productData.tags,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Handle collection creation
   */
  private async handleCollectionCreated(event: WebhookEvent): Promise<void> {
    this.logger.log(`Collection created in shop: ${event.shopDomain}`);
    
    const collectionData = event.data;
    
    // Store collection data
    await this.prisma.collection.upsert({
      where: { 
        shopifyCollectionId_shopId: {
          shopifyCollectionId: collectionData.id.toString(),
          shopId: event.shopDomain,
        }
      },
      update: {
        title: collectionData.title,
        handle: collectionData.handle,
        description: collectionData.description,
        updatedAt: new Date(),
      },
      create: {
        shopifyCollectionId: collectionData.id.toString(),
        shopId: event.shopDomain,
        title: collectionData.title,
        handle: collectionData.handle,
        description: collectionData.description,
      },
    });
  }

  /**
   * Handle collection updates
   */
  private async handleCollectionUpdated(event: WebhookEvent): Promise<void> {
    this.logger.log(`Collection updated in shop: ${event.shopDomain}`);
    
    const collectionData = event.data;
    
    // Update collection data
    await this.prisma.collection.updateMany({
      where: { 
        shopifyCollectionId: collectionData.id.toString(),
        shopId: event.shopDomain,
      },
      data: {
        title: collectionData.title,
        handle: collectionData.handle,
        description: collectionData.description,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Handle unknown webhook topics
   */
  private async handleUnknownTopic(event: WebhookEvent): Promise<void> {
    this.logger.warn(`Unknown webhook topic: ${event.topic} for shop: ${event.shopDomain}`);
    
    // Log unknown topic for monitoring
    await this.logWebhookEvent(event, 'unknown_topic');
  }

  /**
   * Clean up shop data when app is uninstalled
   */
  private async cleanupShopData(shopDomain: string): Promise<void> {
    try {
      // Remove webhook subscriptions
      await this.prisma.webhookSubscription.deleteMany({
        where: { shopId: shopDomain },
      });

      // Remove customer data
      await this.prisma.customer.deleteMany({
        where: { shopId: shopDomain },
      });

      // Remove order data
      await this.prisma.order.deleteMany({
        where: { shopId: shopDomain },
      });

      // Remove product data
      await this.prisma.product.deleteMany({
        where: { shopId: shopDomain },
      });

      // Remove collection data
      await this.prisma.collection.deleteMany({
        where: { shopId: shopDomain },
      });

      this.logger.log(`Shop data cleaned up for: ${shopDomain}`);
    } catch (error) {
      this.logger.error(`Error cleaning up shop data for ${shopDomain}:`, error);
    }
  }

  /**
   * Log webhook event for monitoring and debugging
   */
  private async logWebhookEvent(
    event: WebhookEvent,
    status: 'processed' | 'failed' | 'unknown_topic',
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.prisma.webhookEventLog.create({
        data: {
          shopId: event.shopDomain,
          topic: event.topic,
          status,
          data: event.data,
          errorMessage,
          requestId: event.requestId,
          timestamp: event.timestamp,
        },
      });
    } catch (error) {
      this.logger.error('Error logging webhook event:', error);
    }
  }

  /**
   * Get webhook event logs for a shop
   */
  async getWebhookEventLogs(
    shopDomain: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<any[]> {
    try {
      return await this.prisma.webhookEventLog.findMany({
        where: { shopId: shopDomain },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.logger.error(`Error getting webhook event logs for ${shopDomain}:`, error);
      throw error;
    }
  }

  /**
   * Get webhook statistics for a shop
   */
  async getWebhookStatistics(shopDomain: string): Promise<any> {
    try {
      const [totalEvents, processedEvents, failedEvents, recentEvents] = await Promise.all([
        this.prisma.webhookEventLog.count({ where: { shopId: shopDomain } }),
        this.prisma.webhookEventLog.count({ 
          where: { shopId: shopDomain, status: 'processed' } 
        }),
        this.prisma.webhookEventLog.count({ 
          where: { shopId: shopDomain, status: 'failed' } 
        }),
        this.prisma.webhookEventLog.findMany({
          where: { shopId: shopDomain },
          orderBy: { timestamp: 'desc' },
          take: 10,
        }),
      ]);

      return {
        totalEvents,
        processedEvents,
        failedEvents,
        successRate: totalEvents > 0 ? (processedEvents / totalEvents) * 100 : 0,
        recentEvents,
      };
    } catch (error) {
      this.logger.error(`Error getting webhook statistics for ${shopDomain}:`, error);
      throw error;
    }
  }
}
