import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShopifyWebhookService, WebhookRegistration } from './shopify-webhook.service';

export interface WebhookTopic {
  topic: string;
  description: string;
  required: boolean;
  version: string;
}

@Injectable()
export class ShopifyWebhookManagerService {
  private readonly logger = new Logger(ShopifyWebhookManagerService.name);

  // Default webhook topics for the app
  private readonly defaultWebhookTopics: WebhookTopic[] = [
    {
      topic: 'app/uninstalled',
      description: 'App uninstalled from shop',
      required: true,
      version: '2024-01',
    },
    {
      topic: 'app/installed',
      description: 'App installed on shop',
      required: true,
      version: '2024-01',
    },
    {
      topic: 'customers/create',
      description: 'New customer created',
      required: false,
      version: '2024-01',
    },
    {
      topic: 'customers/update',
      description: 'Customer updated',
      required: false,
      version: '2024-01',
    },
    {
      topic: 'orders/create',
      description: 'New order created',
      required: false,
      version: '2024-01',
    },
    {
      topic: 'orders/fulfilled',
      description: 'Order fulfilled',
      required: false,
      version: '2024-01',
    },
    {
      topic: 'shop/update',
      description: 'Shop information updated',
      required: false,
      version: '2024-01',
    },
    {
      topic: 'products/create',
      description: 'New product created',
      required: false,
      version: '2024-01',
    },
    {
      topic: 'products/update',
      description: 'Product updated',
      required: false,
      version: '2024-01',
    },
    {
      topic: 'collections/create',
      description: 'New collection created',
      required: false,
      version: '2024-01',
    },
    {
      topic: 'collections/update',
      description: 'Collection updated',
      required: false,
      version: '2024-01',
    },
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly webhookService: ShopifyWebhookService,
  ) {}

  /**
   * Get all available webhook topics
   */
  getAvailableWebhookTopics(): WebhookTopic[] {
    return [...this.defaultWebhookTopics];
  }

  /**
   * Get required webhook topics
   */
  getRequiredWebhookTopics(): WebhookTopic[] {
    return this.defaultWebhookTopics.filter(topic => topic.required);
  }

  /**
   * Get optional webhook topics
   */
  getOptionalWebhookTopics(): WebhookTopic[] {
    return this.defaultWebhookTopics.filter(topic => !topic.required);
  }

  /**
   * Register default webhooks for a shop during app installation
   */
  async registerDefaultWebhooks(
    shopDomain: string,
    accessToken: string,
    includeOptional: boolean = false,
  ): Promise<{ success: string[]; failed: string[] }> {
    this.logger.log(`Registering default webhooks for shop: ${shopDomain}`);

    const topicsToRegister = includeOptional 
      ? this.defaultWebhookTopics 
      : this.getRequiredWebhookTopics();

    const success: string[] = [];
    const failed: string[] = [];

    for (const topic of topicsToRegister) {
      try {
        const webhookRegistration: WebhookRegistration = {
          topic: topic.topic,
          address: this.buildWebhookUrl(shopDomain, topic.topic),
          format: 'json',
          version: topic.version,
        };

        await this.webhookService.registerWebhook(
          shopDomain,
          accessToken,
          webhookRegistration,
        );

        success.push(topic.topic);
        this.logger.log(`Webhook registered successfully: ${topic.topic} for ${shopDomain}`);
      } catch (error) {
        this.logger.error(`Failed to register webhook ${topic.topic} for ${shopDomain}:`, error);
        failed.push(`${topic.topic}: ${error.message}`);
      }
    }

    this.logger.log(`Webhook registration completed for ${shopDomain}. Success: ${success.length}, Failed: ${failed.length}`);

    return { success, failed };
  }

  /**
   * Register specific webhook topics for a shop
   */
  async registerSpecificWebhooks(
    shopDomain: string,
    accessToken: string,
    topics: string[],
  ): Promise<{ success: string[]; failed: string[] }> {
    this.logger.log(`Registering specific webhooks for shop: ${shopDomain}: ${topics.join(', ')}`);

    const success: string[] = [];
    const failed: string[] = [];

    for (const topic of topics) {
      try {
        const topicConfig = this.defaultWebhookTopics.find(t => t.topic === topic);
        if (!topicConfig) {
          failed.push(`${topic}: Unknown webhook topic`);
          continue;
        }

        const webhookRegistration: WebhookRegistration = {
          topic: topicConfig.topic,
          address: this.buildWebhookUrl(shopDomain, topicConfig.topic),
          format: 'json',
          version: topicConfig.version,
        };

        await this.webhookService.registerWebhook(
          shopDomain,
          accessToken,
          webhookRegistration,
        );

        success.push(topic);
        this.logger.log(`Webhook registered successfully: ${topic} for ${shopDomain}`);
      } catch (error) {
        this.logger.error(`Failed to register webhook ${topic} for ${shopDomain}:`, error);
        failed.push(`${topic}: ${error.message}`);
      }
    }

    return { success, failed };
  }

  /**
   * Unregister all webhooks for a shop (during app uninstallation)
   */
  async unregisterAllWebhooks(
    shopDomain: string,
    accessToken: string,
  ): Promise<{ success: string[]; failed: string[] }> {
    this.logger.log(`Unregistering all webhooks for shop: ${shopDomain}`);

    try {
      // Get current webhook subscriptions
      const subscriptions = await this.webhookService.getWebhookSubscriptions(
        shopDomain,
        accessToken,
      );

      const success: string[] = [];
      const failed: string[] = [];

      for (const subscription of subscriptions) {
        try {
          await this.webhookService.unregisterWebhook(
            shopDomain,
            accessToken,
            subscription.id,
          );
          success.push(subscription.topic);
        } catch (error) {
          this.logger.error(`Failed to unregister webhook ${subscription.topic}:`, error);
          failed.push(`${subscription.topic}: ${error.message}`);
        }
      }

      this.logger.log(`Webhook unregistration completed for ${shopDomain}. Success: ${success.length}, Failed: ${failed.length}`);

      return { success, failed };
    } catch (error) {
      this.logger.error(`Error getting webhook subscriptions for ${shopDomain}:`, error);
      return { success: [], failed: [`Error: ${error.message}`] };
    }
  }

  /**
   * Verify webhook registration status for a shop
   */
  async verifyWebhookRegistration(
    shopDomain: string,
    accessToken: string,
  ): Promise<{
    registered: string[];
    missing: string[];
    status: 'complete' | 'partial' | 'none';
  }> {
    this.logger.log(`Verifying webhook registration for shop: ${shopDomain}`);

    try {
      const subscriptions = await this.webhookService.getWebhookSubscriptions(
        shopDomain,
        accessToken,
      );

      const registeredTopics = subscriptions.map(sub => sub.topic);
      const requiredTopics = this.getRequiredWebhookTopics().map(t => t.topic);
      const missingTopics = requiredTopics.filter(topic => !registeredTopics.includes(topic));

      let status: 'complete' | 'partial' | 'none';
      if (missingTopics.length === 0) {
        status = 'complete';
      } else if (registeredTopics.length > 0) {
        status = 'partial';
      } else {
        status = 'none';
      }

      this.logger.log(`Webhook verification for ${shopDomain}: ${status}. Registered: ${registeredTopics.length}, Missing: ${missingTopics.length}`);

      return {
        registered: registeredTopics,
        missing: missingTopics,
        status,
      };
    } catch (error) {
      this.logger.error(`Error verifying webhook registration for ${shopDomain}:`, error);
      return {
        registered: [],
        missing: this.getRequiredWebhookTopics().map(t => t.topic),
        status: 'none',
      };
    }
  }

  /**
   * Repair webhook registration by registering missing required webhooks
   */
  async repairWebhookRegistration(
    shopDomain: string,
    accessToken: string,
  ): Promise<{ success: string[]; failed: string[] }> {
    this.logger.log(`Repairing webhook registration for shop: ${shopDomain}`);

    const verification = await this.verifyWebhookRegistration(shopDomain, accessToken);

    if (verification.status === 'complete') {
      this.logger.log(`Webhook registration is complete for ${shopDomain}, no repair needed`);
      return { success: [], failed: [] };
    }

    return await this.registerSpecificWebhooks(
      shopDomain,
      accessToken,
      verification.missing,
    );
  }

  /**
   * Get webhook registration recommendations for a shop
   */
  getWebhookRecommendations(shopDomain: string): {
    required: WebhookTopic[];
    recommended: WebhookTopic[];
    optional: WebhookTopic[];
  } {
    const required = this.getRequiredWebhookTopics();
    const optional = this.getOptionalWebhookTopics();

    // Recommend customer and order webhooks for most shops
    const recommended = optional.filter(topic => 
      topic.topic.startsWith('customers/') || topic.topic.startsWith('orders/')
    );

    // Remaining optional webhooks
    const remainingOptional = optional.filter(topic => 
      !recommended.some(rec => rec.topic === topic.topic)
    );

    return {
      required,
      recommended,
      optional: remainingOptional,
    };
  }

  /**
   * Build webhook URL for a specific topic
   */
  private buildWebhookUrl(shopDomain: string, topic: string): string {
    const baseUrl = this.configService.get('SHOPIFY_APP_URL') || 'https://your-app-domain.com';
    return `${baseUrl}/api/v1/shopify/webhook`;
  }

  /**
   * Validate webhook configuration
   */
  validateWebhookConfiguration(webhook: WebhookRegistration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!webhook.topic) {
      errors.push('Webhook topic is required');
    }

    if (!webhook.address) {
      errors.push('Webhook address is required');
    }

    if (!webhook.format) {
      errors.push('Webhook format is required');
    }

    if (!webhook.version) {
      errors.push('Webhook version is required');
    }

    if (webhook.format !== 'json' && webhook.format !== 'xml') {
      errors.push('Webhook format must be either "json" or "xml"');
    }

    // Validate URL format
    try {
      new URL(webhook.address);
    } catch {
      errors.push('Webhook address must be a valid URL');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get webhook statistics summary
   */
  async getWebhookSummary(shopDomain: string): Promise<{
    totalTopics: number;
    registeredTopics: number;
    requiredTopics: number;
    missingRequiredTopics: number;
    health: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      const stats = await this.webhookService.getWebhookStatistics(shopDomain);
      const requiredTopics = this.getRequiredWebhookTopics().length;
      const registeredTopics = stats.totalEvents > 0 ? stats.processedEvents : 0;
      const missingRequiredTopics = Math.max(0, requiredTopics - registeredTopics);

      let health: 'healthy' | 'warning' | 'critical';
      if (missingRequiredTopics === 0 && stats.successRate >= 95) {
        health = 'healthy';
      } else if (missingRequiredTopics === 0 && stats.successRate >= 80) {
        health = 'warning';
      } else {
        health = 'critical';
      }

      return {
        totalTopics: this.defaultWebhookTopics.length,
        registeredTopics,
        requiredTopics,
        missingRequiredTopics,
        health,
      };
    } catch (error) {
      this.logger.error(`Error getting webhook summary for ${shopDomain}:`, error);
      return {
        totalTopics: this.defaultWebhookTopics.length,
        registeredTopics: 0,
        requiredTopics: this.getRequiredWebhookTopics().length,
        missingRequiredTopics: this.getRequiredWebhookTopics().length,
        health: 'critical',
      };
    }
  }
}
