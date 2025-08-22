import { Injectable, Logger } from '@nestjs/common';
import { ShopifyGraphQLClientService, ShopifyGraphQLConfig, GraphQLRequestOptions } from './shopify-graphql-client.service';
import { LoggerService } from '@shopify-quiz-builder/common';
import { MonitoringService } from '@shopify-quiz-builder/common';

// Shopify GraphQL types
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText?: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
  tags: string[];
  productType?: string;
  vendor?: string;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    id: string;
    url: string;
    altText?: string;
  };
  productsCount: number;
}

export interface ShopifyCustomer {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  tags: string[];
  acceptsMarketing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyShop {
  id: string;
  name: string;
  email: string;
  myshopifyDomain: string;
  currencyCode: string;
  primaryDomain: {
    url: string;
    host: string;
  };
  timezoneAbbreviation: string;
  ianaTimezone: string;
  plan: {
    displayName: string;
    partnerDevelopment: boolean;
    shopifyPlus: boolean;
  };
}

@Injectable()
export class ShopifyOperationsService {
  private readonly logger = new Logger(ShopifyOperationsService.name);
  private readonly loggerService = new LoggerService();
  private readonly monitoringService = new MonitoringService(this.loggerService);

  constructor(
    private readonly graphQLClient: ShopifyGraphQLClientService,
  ) {}

  /**
   * Get shop information
   */
  async getShopInfo(
    config: ShopifyGraphQLConfig,
    options: GraphQLRequestOptions = {}
  ): Promise<ShopifyShop> {
    const query = `
      query getShop {
        shop {
          id
          name
          email
          myshopifyDomain
          currencyCode
          primaryDomain {
            url
            host
          }
          timezoneAbbreviation
          ianaTimezone
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
        }
      }
    `;

    try {
      const result = await this.graphQLClient.executeQuery<{ shop: ShopifyShop }>(
        config,
        query,
        {},
        options
      );

      this.loggerService.log('Shop info retrieved successfully', {
        service: 'ShopifyOperationsService',
        method: 'getShopInfo',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
      });

      return result.shop;
    } catch (error) {
      this.loggerService.log('Failed to retrieve shop info', {
        service: 'ShopifyOperationsService',
        method: 'getShopInfo',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get products with pagination and filtering
   */
  async getProducts(
    config: ShopifyGraphQLConfig,
    options: GraphQLRequestOptions & {
      first?: number;
      after?: string;
      query?: string;
      productType?: string;
      vendor?: string;
      tags?: string[];
    } = {}
  ): Promise<{
    products: ShopifyProduct[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  }> {
    const { first = 50, after, query, productType, vendor, tags, ...requestOptions } = options;

    // Build filter query
    let filterQuery = '';
    if (query || productType || vendor || tags?.length) {
      const filters = [];
      if (query) filters.push(`title:*${query}*`);
      if (productType) filters.push(`product_type:${productType}`);
      if (vendor) filters.push(`vendor:${vendor}`);
      if (tags?.length) filters.push(`tag:(${tags.join(' AND ')})`);
      filterQuery = `, query: "${filters.join(' AND ')}"`;
    }

    const graphqlQuery = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after${filterQuery}) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
              tags
              productType
              vendor
            }
          }
        }
      }
    `;

    try {
      const result = await this.graphQLClient.executeQuery<{
        products: {
          pageInfo: any;
          edges: Array<{ node: ShopifyProduct }>;
        };
      }>(
        config,
        graphqlQuery,
        { first, after },
        requestOptions
      );

      const products = result.products.edges.map(edge => edge.node);

      this.loggerService.log('Products retrieved successfully', {
        service: 'ShopifyOperationsService',
        method: 'getProducts',
        shopId: requestOptions.shopId,
        shopDomain: config.shopDomain,
        count: products.length,
        hasNextPage: result.products.pageInfo.hasNextPage,
      });

      return {
        products,
        pageInfo: result.products.pageInfo,
      };
    } catch (error) {
      this.loggerService.log('Failed to retrieve products', {
        service: 'ShopifyOperationsService',
        method: 'getProducts',
        shopId: requestOptions.shopId,
        shopDomain: config.shopDomain,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get collections with pagination
   */
  async getCollections(
    config: ShopifyGraphQLConfig,
    options: GraphQLRequestOptions & {
      first?: number;
      after?: string;
    } = {}
  ): Promise<{
    collections: ShopifyCollection[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
  }> {
    const { first = 50, after, ...requestOptions } = options;

    const query = `
      query getCollections($first: Int!, $after: String) {
        collections(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              description
              image {
                id
                url
                altText
              }
              productsCount
            }
          }
        }
      }
    `;

    try {
      const result = await this.graphQLClient.executeQuery<{
        collections: {
          pageInfo: any;
          edges: Array<{ node: ShopifyCollection }>;
        };
      }>(
        config,
        query,
        { first, after },
        requestOptions
      );

      const collections = result.collections.edges.map(edge => edge.node);

      this.loggerService.log('Collections retrieved successfully', {
        service: 'ShopifyOperationsService',
        method: 'getCollections',
        shopId: requestOptions.shopId,
        shopDomain: config.shopDomain,
        count: collections.length,
      });

      return {
        collections,
        pageInfo: result.collections.pageInfo,
      };
    } catch (error) {
      this.loggerService.log('Failed to retrieve collections', {
        service: 'ShopifyOperationsService',
        method: 'getCollections',
        shopId: requestOptions.shopId,
        shopDomain: config.shopDomain,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get a single product by ID or handle
   */
  async getProduct(
    config: ShopifyGraphQLConfig,
    identifier: string,
    options: GraphQLRequestOptions = {}
  ): Promise<ShopifyProduct> {
    // Check if identifier is an ID or handle
    const isId = identifier.startsWith('gid://');
    const query = isId ? `
      query getProductById($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
          tags
          productType
          vendor
        }
      }
    ` : `
      query getProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
          tags
          productType
          vendor
        }
      }
    `;

    try {
      const variables = isId ? { id: identifier } : { handle: identifier };
      const result = await this.graphQLClient.executeQuery<{
        product?: ShopifyProduct;
        productByHandle?: ShopifyProduct;
      }>(
        config,
        query,
        variables,
        options
      );

      const product = result.product || result.productByHandle;
      if (!product) {
        throw new Error(`Product not found: ${identifier}`);
      }

      this.loggerService.log('Product retrieved successfully', {
        service: 'ShopifyOperationsService',
        method: 'getProduct',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
        productId: product.id,
        productTitle: product.title,
      });

      return product;
    } catch (error) {
      this.loggerService.log('Failed to retrieve product', {
        service: 'ShopifyOperationsService',
        method: 'getProduct',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
        identifier,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create or update a customer
   */
  async upsertCustomer(
    config: ShopifyGraphQLConfig,
    customerData: {
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      tags?: string[];
      acceptsMarketing?: boolean;
    },
    options: GraphQLRequestOptions = {}
  ): Promise<ShopifyCustomer> {
    const mutation = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
            phone
            tags
            acceptsMarketing
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const result = await this.graphQLClient.executeMutation<{
        customerCreate: {
          customer?: ShopifyCustomer;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>(
        config,
        mutation,
        { input: customerData },
        options
      );

      if (result.customerCreate.userErrors?.length > 0) {
        const errors = result.customerCreate.userErrors.map(e => `${e.field}: ${e.message}`).join(', ');
        throw new Error(`Customer creation failed: ${errors}`);
      }

      if (!result.customerCreate.customer) {
        throw new Error('Customer creation failed: No customer returned');
      }

      this.loggerService.log('Customer created successfully', {
        service: 'ShopifyOperationsService',
        method: 'upsertCustomer',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
        customerEmail: customerData.email,
      });

      return result.customerCreate.customer;
    } catch (error) {
      this.loggerService.log('Failed to create customer', {
        service: 'ShopifyOperationsService',
        method: 'upsertCustomer',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
        customerEmail: customerData.email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Add tags to a customer
   */
  async addCustomerTags(
    config: ShopifyGraphQLConfig,
    customerId: string,
    tags: string[],
    options: GraphQLRequestOptions = {}
  ): Promise<ShopifyCustomer> {
    const mutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
            phone
            tags
            acceptsMarketing
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      // First get current customer to see existing tags
      const currentCustomer = await this.getCustomer(config, customerId, options);
      const updatedTags = [...new Set([...currentCustomer.tags, ...tags])];

      const result = await this.graphQLClient.executeMutation<{
        customerUpdate: {
          customer?: ShopifyCustomer;
          userErrors: Array<{ field: string; message: string }>;
        };
      }>(
        config,
        mutation,
        { input: { id: customerId, tags: updatedTags } },
        options
      );

      if (result.customerUpdate.userErrors?.length > 0) {
        const errors = result.customerUpdate.userErrors.map(e => `${e.field}: ${e.message}`).join(', ');
        throw new Error(`Customer update failed: ${errors}`);
      }

      if (!result.customerUpdate.customer) {
        throw new Error('Customer update failed: No customer returned');
      }

      this.loggerService.log('Customer tags updated successfully', {
        service: 'ShopifyOperationsService',
        method: 'addCustomerTags',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
        customerId,
        tagsAdded: tags,
        totalTags: updatedTags.length,
      });

      return result.customerUpdate.customer;
    } catch (error) {
      this.loggerService.log('Failed to update customer tags', {
        service: 'ShopifyOperationsService',
        method: 'addCustomerTags',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
        customerId,
        tags,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get a customer by ID
   */
  async getCustomer(
    config: ShopifyGraphQLConfig,
    customerId: string,
    options: GraphQLRequestOptions = {}
  ): Promise<ShopifyCustomer> {
    const query = `
      query getCustomer($id: ID!) {
        customer(id: $id) {
          id
          firstName
          lastName
          email
          phone
          tags
          acceptsMarketing
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const result = await this.graphQLClient.executeQuery<{
        customer?: ShopifyCustomer;
      }>(
        config,
        query,
        { id: customerId },
        options
      );

      if (!result.customer) {
        throw new Error(`Customer not found: ${customerId}`);
      }

      this.loggerService.log('Customer retrieved successfully', {
        service: 'ShopifyOperationsService',
        method: 'getCustomer',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
        customerId,
      });

      return result.customer;
    } catch (error) {
      this.loggerService.log('Failed to retrieve customer', {
        service: 'ShopifyOperationsService',
        method: 'getCustomer',
        shopId: options.shopId,
        shopDomain: config.shopDomain,
        customerId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    return this.graphQLClient.getRateLimitStatus();
  }
}
