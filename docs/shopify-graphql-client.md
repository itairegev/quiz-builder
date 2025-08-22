# Shopify GraphQL Client Documentation

## Overview

The Shopify GraphQL Client is a robust, production-ready implementation that provides seamless integration with Shopify's GraphQL APIs. It's built with NestJS best practices and includes comprehensive error handling, rate limiting, retry logic, and monitoring.

## Architecture

### Core Components

1. **ShopifyGraphQLClientService** - Low-level GraphQL client with HTTP handling
2. **ShopifyOperationsService** - High-level business operations abstraction
3. **ShopifyConfigService** - Centralized configuration management
4. **Exception Classes** - Domain-specific error handling

### Service Hierarchy

```
ShopifyModule
├── ShopifyGraphQLClientService (Core HTTP/GraphQL handling)
├── ShopifyOperationsService (Business operations)
├── ShopifyConfigService (Configuration)
└── ShopifyService (Legacy OAuth/auth)
```

## Installation & Dependencies

### Required Packages

```bash
pnpm add graphql-request @shopify/shopify-api @shopify/admin-api-client
pnpm add -D @types/graphql
```

### Package Versions

```json
{
  "graphql-request": "^6.1.0",
  "@shopify/shopify-api": "^8.0.0",
  "@shopify/admin-api-client": "^1.0.0"
}
```

## Configuration

### Environment Variables

```env
# Shopify API Configuration
SHOPIFY_API_VERSION="2024-01"
SHOPIFY_ADMIN_API_VERSION="2024-01"
SHOPIFY_STOREFRONT_API_VERSION="2024-01"

# Rate Limiting
SHOPIFY_ADMIN_RATE_LIMIT="2"
SHOPIFY_STOREFRONT_RATE_LIMIT="2"
SHOPIFY_ADMIN_BURST_LIMIT="40"
SHOPIFY_STOREFRONT_BURST_LIMIT="50"

# Retry Configuration
SHOPIFY_MAX_RETRIES="3"
SHOPIFY_RETRY_DELAY="1000"
SHOPIFY_CIRCUIT_BREAKER_THRESHOLD="5"
```

### Configuration Service

```typescript
@Injectable()
export class ShopifyConfigService {
  getApiVersion(): string {
    return this.configService.get('SHOPIFY_API_VERSION') || '2024-01';
  }

  getGraphQLConfig(shopDomain: string, accessToken: string): ShopifyGraphQLConfig {
    return {
      shopDomain,
      accessToken,
      apiVersion: this.getApiVersion(),
      adminApiVersion: this.getAdminApiVersion(),
      storefrontApiVersion: this.getStorefrontApiVersion(),
    };
  }
}
```

## Core GraphQL Client

### ShopifyGraphQLClientService

The core service handles all low-level GraphQL operations with built-in rate limiting and retry logic.

#### Key Features

- **Rate Limiting**: Respects Shopify API limits
- **Retry Logic**: Exponential backoff with circuit breaker
- **Error Handling**: Comprehensive error classification
- **Performance Monitoring**: Request/response timing
- **Request Tracing**: Unique request IDs

#### Basic Usage

```typescript
@Injectable()
export class MyService {
  constructor(
    private readonly graphQLClient: ShopifyGraphQLClientService,
    private readonly configService: ShopifyConfigService,
  ) {}

  async getShopInfo(shopDomain: string, accessToken: string) {
    const config = this.configService.getGraphQLConfig(shopDomain, accessToken);
    
    const query = `
      query {
        shop {
          id
          name
          email
          currency
          timezone
        }
      }
    `;

    return this.graphQLClient.executeQuery(config, query);
  }
}
```

#### Rate Limiting

The client automatically handles Shopify's rate limits:

- **Admin API**: 2 calls/second, 40 calls/10 seconds
- **Storefront API**: 2 calls/second, 50 calls/10 seconds

```typescript
// Check current rate limit status
const status = this.graphQLClient.getRateLimitStatus();
console.log('Admin API calls remaining:', status.admin.remaining);
console.log('Storefront API calls remaining:', status.storefront.remaining);
```

#### Retry Logic

Automatic retry with exponential backoff:

```typescript
const options: GraphQLRequestOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};

const result = await this.graphQLClient.executeQuery(
  config, 
  query, 
  variables, 
  options
);
```

## Operations Service

### ShopifyOperationsService

High-level service that abstracts common Shopify operations.

#### Available Operations

1. **Shop Management**
   - Get shop information
   - Update shop settings

2. **Product Operations**
   - Fetch products with filtering
   - Pagination support
   - Search and filtering

3. **Collection Operations**
   - Get collections
   - Collection products

4. **Customer Management**
   - Create/update customers
   - Add customer tags
   - Customer lookup

#### Product Operations Example

```typescript
// Get products with filtering
const result = await this.shopifyOperations.getProducts(config, {
  first: 10,
  after: cursor,
  query: 'shoes',
  productType: 'footwear',
  vendor: 'Nike',
  tags: ['running', 'athletic']
});

// Access results
const { products, pageInfo } = result;
console.log(`Found ${products.length} products`);
console.log('Has next page:', pageInfo.hasNextPage);
```

#### Customer Management Example

```typescript
// Create or update customer
const customer = await this.shopifyOperations.upsertCustomer(config, {
  email: 'customer@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  tags: ['quiz-user', 'high-value'],
  acceptsMarketing: true
});

// Add additional tags
const updatedCustomer = await this.shopifyOperations.addCustomerTags(
  config,
  customer.id,
  ['new-segment', 'promo-ready']
);
```

## Error Handling

### Exception Types

The client provides comprehensive error handling with custom exception classes:

```typescript
// Shopify API errors
export class ShopifyApiException extends BaseException {
  constructor(
    message: string,
    statusCode: number = 500,
    details?: any,
    requestId?: string
  ) {
    super(message, statusCode, 'SHOPIFY_API_ERROR', details, requestId);
  }
}

// Rate limiting errors
export class ShopifyRateLimitException extends ShopifyApiException {
  constructor(message: string, retryAfter?: number, requestId?: string) {
    super(message, 429, { retryAfter }, requestId);
  }
}

// Authentication errors
export class ShopifyAuthenticationException extends ShopifyApiException {
  constructor(message: string, details?: any, requestId?: string) {
    super(message, 401, details, requestId);
  }
}
```

### Error Response Format

```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded",
  "error": "SHOPIFY_RATE_LIMIT_ERROR",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/shopify/products",
  "requestId": "req_123456789",
  "details": {
    "retryAfter": 60,
    "limit": "2 calls/second"
  }
}
```

## Testing

### Test Configuration

The Jest configuration includes special handling for ES modules:

```javascript
// jest.config.js
transformIgnorePatterns: [
  'node_modules/(?!(graphql-request|@graphql-tools)/)'
]
```

### Test Examples

```typescript
describe('ShopifyGraphQLClientService', () => {
  let service: ShopifyGraphQLClientService;
  let mockMonitoringService: jest.Mocked<MonitoringService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopifyGraphQLClientService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ShopifyGraphQLClientService>(ShopifyGraphQLClientService);
    
    // Manually inject mocked services
    (service as any).monitoringService = mockMonitoringService;
  });

  it('should execute GraphQL query successfully', async () => {
    const config: ShopifyGraphQLConfig = {
      shopDomain: 'test.myshopify.com',
      accessToken: 'test-token',
      apiVersion: '2024-01',
    };

    const query = 'query { shop { name } }';
    const result = await service.executeQuery(config, query);

    expect(result).toBeDefined();
    expect(mockMonitoringService.recordApiCallMetrics).toHaveBeenCalled();
  });
});
```

## Performance Monitoring

### Metrics Collection

The client automatically collects performance metrics:

- **API Call Metrics**: Request rates, response times, error rates
- **Rate Limiting**: Calls made, remaining quota, reset times
- **Retry Statistics**: Retry attempts, success rates
- **Error Tracking**: Error types, frequencies, impact

### Health Checks

```typescript
// Check client health
const health = await this.graphQLClient.checkHealth();

// Check rate limit status
const rateLimitStatus = this.graphQLClient.getRateLimitStatus();

// Check external service connectivity
const connectivity = await this.graphQLClient.checkConnectivity();
```

## Best Practices

### 1. Configuration Management

```typescript
// Use configuration service for all settings
const config = this.shopifyConfigService.getGraphQLConfig(shopDomain, accessToken);

// Validate configuration before use
if (!this.shopifyConfigService.validateConfig()) {
  throw new Error('Invalid Shopify configuration');
}
```

### 2. Error Handling

```typescript
try {
  const result = await this.graphQLClient.executeQuery(config, query);
  return result;
} catch (error) {
  if (error instanceof ShopifyRateLimitException) {
    // Handle rate limiting
    await this.handleRateLimit(error);
  } else if (error instanceof ShopifyAuthenticationException) {
    // Handle authentication issues
    await this.refreshToken();
  } else {
    // Log and rethrow
    this.logger.error('GraphQL query failed', error);
    throw error;
  }
}
```

### 3. Rate Limiting

```typescript
// Check rate limits before making calls
const status = this.graphQLClient.getRateLimitStatus();
if (status.admin.remaining < 5) {
  // Implement backoff strategy
  await this.implementBackoff();
}

// Use batch operations when possible
const results = await Promise.all(
  productIds.map(id => this.getProduct(config, id))
);
```

### 4. Monitoring

```typescript
// Set up alerts for critical failures
this.monitoringService.setAlertThreshold('shopify_api_errors', 10);

// Track business metrics
this.monitoringService.recordMetric('products_fetched', 1, {
  shop: shopDomain,
  operation: 'getProducts'
});
```

## Troubleshooting

### Common Issues

1. **Rate Limiting Errors**
   - Check current rate limit status
   - Implement exponential backoff
   - Use batch operations

2. **Authentication Errors**
   - Verify access token validity
   - Check token expiration
   - Validate shop domain

3. **GraphQL Errors**
   - Validate query syntax
   - Check field permissions
   - Verify API version compatibility

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Set log level
this.logger.setLogLevel('debug');

// Enable request/response logging
const options: GraphQLRequestOptions = {
  enableLogging: true,
  logLevel: 'debug'
};
```

## Migration Guide

### From REST API

```typescript
// Old REST approach
const response = await fetch(`https://${shopDomain}/admin/api/2024-01/products.json`, {
  headers: { 'X-Shopify-Access-Token': accessToken }
});

// New GraphQL approach
const query = `
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

const result = await this.graphQLClient.executeQuery(config, query);
```

### From Legacy Shopify Service

```typescript
// Old service
const products = await this.shopifyService.getProducts(shopDomain, accessToken);

// New operations service
const config = this.shopifyConfigService.getGraphQLConfig(shopDomain, accessToken);
const result = await this.shopifyOperations.getProducts(config, { first: 50 });
```

## Future Enhancements

### Planned Features

1. **Webhook Support**: Real-time store updates
2. **Bulk Operations**: Efficient batch processing
3. **Caching Layer**: Redis-based response caching
4. **Advanced Filtering**: Complex query builders
5. **Real-time Updates**: GraphQL subscriptions

### API Version Management

```typescript
// Automatic API version detection
const supportedVersions = ['2024-01', '2023-10', '2023-07'];
const bestVersion = await this.detectBestApiVersion(shopDomain);

// Graceful fallback
if (bestVersion !== this.config.apiVersion) {
  this.logger.warn(`Falling back to API version ${bestVersion}`);
}
```

---

*Last updated: January 15, 2024*  
*Version: 1.0.0*
