# API Reference

## Overview

The Shopify Quiz Builder API provides a comprehensive set of endpoints for managing quizzes, Shopify integration, user authentication, and system monitoring. All endpoints follow RESTful principles and return consistent JSON responses.

## Base URL

```
Development: http://localhost:3001/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

### Shopify Authentication

Most endpoints require Shopify authentication via headers:

```http
X-Shopify-Shop-Domain: your-shop.myshopify.com
Authorization: Bearer your-access-token
```

### Authentication Guard

The `ShopifyAuthGuard` validates these headers and adds shop information to the request object.

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "data": {
    // Response data here
  },
  "statusCode": 200,
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/quizzes",
  "requestId": "req_123456789"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/quizzes",
  "requestId": "req_123456789",
  "details": {
    "field": "title",
    "issue": "Title is required"
  }
}
```

## Shopify Endpoints

### App Installation

#### Install App

```http
POST /api/v1/shopify/install
```

**Request Body:**
```json
{
  "shop": "your-shop.myshopify.com",
  "code": "authorization_code",
  "state": "state_parameter"
}
```

**Response:**
```json
{
  "data": {
    "shopId": "shop_123",
    "shopDomain": "your-shop.myshopify.com",
    "accessToken": "shpat_...",
    "scope": "read_products,write_customers",
    "email": "admin@shop.com",
    "name": "Your Shop Name"
  },
  "statusCode": 201,
  "message": "App installed successfully"
}
```

### Webhooks

#### Process Webhook

```http
POST /api/v1/shopify/webhook
```

**Headers:**
```http
X-Shopify-Hmac-Sha256: webhook_signature
X-Shopify-Topic: app/uninstalled
X-Shopify-Shop-Domain: your-shop.myshopify.com
```

**Request Body:**
```json
{
  "id": 123456789,
  "domain": "your-shop.myshopify.com",
  "email": "admin@shop.com"
}
```

**Response:**
```json
{
  "data": {
    "message": "Webhook processed successfully"
  },
  "statusCode": 201,
  "message": "Webhook processed"
}
```

### OAuth Callback

#### Process OAuth Callback

```http
POST /api/v1/shopify/auth/callback
```

**Headers:**
```http
X-Shopify-Shop-Domain: your-shop.myshopify.com
Authorization: Bearer your-access-token
```

**Request Body:**
```json
{
  "code": "authorization_code",
  "state": "state_parameter"
}
```

**Response:**
```json
{
  "data": {
    "message": "OAuth callback processed successfully",
    "shopId": "shop_123",
    "shopDomain": "your-shop.myshopify.com"
  },
  "statusCode": 201,
  "message": "OAuth callback processed"
}
```

## Quiz Management

### Quizzes

#### Get All Quizzes

```http
GET /api/v1/quizzes
```

**Headers:**
```http
X-Shopify-Shop-Domain: your-shop.myshopify.com
Authorization: Bearer your-access-token
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (draft, published, archived)

**Response:**
```json
{
  "data": {
    "quizzes": [
      {
        "id": "quiz_123",
        "title": "Product Recommendation Quiz",
        "description": "Find your perfect product",
        "status": "published",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  },
  "statusCode": 200,
  "message": "Quizzes retrieved successfully"
}
```

#### Create Quiz

```http
POST /api/v1/quizzes
```

**Headers:**
```http
X-Shopify-Shop-Domain: your-shop.myshopify.com
Authorization: Bearer your-access-token
```

**Request Body:**
```json
{
  "title": "New Quiz",
  "description": "Quiz description",
  "type": "guided",
  "settings": {
    "showProgress": true,
    "allowBacktracking": false,
    "timeLimit": 300
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "quiz_456",
    "title": "New Quiz",
    "description": "Quiz description",
    "type": "guided",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "statusCode": 201,
  "message": "Quiz created successfully"
}
```

#### Get Quiz by ID

```http
GET /api/v1/quizzes/{quizId}
```

**Response:**
```json
{
  "data": {
    "id": "quiz_123",
    "title": "Product Recommendation Quiz",
    "description": "Find your perfect product",
    "type": "guided",
    "status": "published",
    "settings": {
      "showProgress": true,
      "allowBacktracking": false,
      "timeLimit": 300
    },
    "questions": [
      {
        "id": "q_1",
        "text": "What type of product are you looking for?",
        "type": "multiple_choice",
        "options": [
          { "id": "opt_1", "text": "Shoes", "value": "shoes" },
          { "id": "opt_2", "text": "Clothing", "value": "clothing" }
        ]
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "statusCode": 200,
  "message": "Quiz retrieved successfully"
}
```

#### Update Quiz

```http
PUT /api/v1/quizzes/{quizId}
```

**Request Body:**
```json
{
  "title": "Updated Quiz Title",
  "description": "Updated description",
  "settings": {
    "showProgress": false,
    "allowBacktracking": true
  }
}
```

#### Delete Quiz

```http
DELETE /api/v1/quizzes/{quizId}
```

**Response:**
```json
{
  "data": {
    "message": "Quiz deleted successfully"
  },
  "statusCode": 200,
  "message": "Quiz deleted"
}
```

### Questions

#### Get Quiz Questions

```http
GET /api/v1/quizzes/{quizId}/questions
```

**Response:**
```json
{
  "data": {
    "questions": [
      {
        "id": "q_1",
        "text": "What type of product are you looking for?",
        "type": "multiple_choice",
        "order": 1,
        "options": [
          { "id": "opt_1", "text": "Shoes", "value": "shoes" },
          { "id": "opt_2", "text": "Clothing", "value": "clothing" }
        ]
      }
    ]
  },
  "statusCode": 200,
  "message": "Questions retrieved successfully"
}
```

#### Add Question to Quiz

```http
POST /api/v1/quizzes/{quizId}/questions
```

**Request Body:**
```json
{
  "text": "What is your budget range?",
  "type": "multiple_choice",
  "order": 2,
  "options": [
    { "text": "Under $50", "value": "budget_low" },
    { "text": "$50-$100", "value": "budget_medium" },
    { "text": "Over $100", "value": "budget_high" }
  ]
}
```

### Quiz Responses

#### Submit Quiz Response

```http
POST /api/v1/quizzes/{quizId}/responses
```

**Request Body:**
```json
{
  "customerEmail": "customer@example.com",
  "answers": [
    {
      "questionId": "q_1",
      "answer": "shoes"
    },
    {
      "questionId": "q_2",
      "answer": "budget_medium"
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "id": "resp_123",
    "quizId": "quiz_123",
    "customerEmail": "customer@example.com",
    "score": 85,
    "recommendations": [
      {
        "productId": "prod_456",
        "title": "Running Shoes",
        "reason": "Based on your preference for athletic footwear"
      }
    ],
    "completedAt": "2024-01-15T10:30:00Z"
  },
  "statusCode": 201,
  "message": "Quiz response submitted successfully"
}
```

#### Get Quiz Responses

```http
GET /api/v1/quizzes/{quizId}/responses
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `customerEmail` (optional): Filter by customer email

## Health & Monitoring

### Health Check

#### System Health

```http
GET /api/v1/health
```

**Response:**
```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 15,
        "details": "Connected successfully"
      },
      "memory": {
        "status": "healthy",
        "usage": 65.2,
        "details": "65.2% memory usage"
      },
      "external": {
        "status": "healthy",
        "responseTime": 120,
        "details": "All external services responding"
      }
    }
  },
  "statusCode": 200,
  "message": "Health check completed"
}
```

#### Database Health

```http
GET /api/v1/health/database
```

#### Memory Health

```http
GET /api/v1/health/memory
```

#### External Services Health

```http
GET /api/v1/health/external
```

### Monitoring

#### Get Metrics

```http
GET /api/v1/monitoring/metrics
```

**Query Parameters:**
- `type` (optional): Metric type (api, business, system)
- `period` (optional): Time period (1h, 24h, 7d, 30d)

**Response:**
```json
{
  "data": {
    "apiMetrics": {
      "requestRate": 45.2,
      "responseTime": 125,
      "errorRate": 2.1,
      "successRate": 97.9
    },
    "businessMetrics": {
      "quizCompletions": 156,
      "conversions": 23,
      "averageScore": 78.5
    },
    "systemMetrics": {
      "memoryUsage": 65.2,
      "cpuUsage": 12.8,
      "diskUsage": 45.1
    }
  },
  "statusCode": 200,
  "message": "Metrics retrieved successfully"
}
```

#### Record Custom Metric

```http
POST /api/v1/monitoring/metrics
```

**Request Body:**
```json
{
  "name": "custom_event",
  "value": 1,
  "tags": {
    "shop": "your-shop.myshopify.com",
    "event": "quiz_started"
  }
}
```

## Error Codes

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Types

- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication required
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND_ERROR` - Resource not found
- `RATE_LIMIT_ERROR` - Rate limit exceeded
- `SHOPIFY_API_ERROR` - Shopify API error
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_ERROR` - Internal server error

## Rate Limiting

### Shopify API Limits

- **Admin API**: 2 calls/second, 40 calls/10 seconds
- **Storefront API**: 2 calls/second, 50 calls/10 seconds

### Response Headers

```http
X-RateLimit-Limit: 2
X-RateLimit-Remaining: 1
X-RateLimit-Reset: 1642233600
Retry-After: 60
```

## Pagination

### Pagination Headers

```http
X-Pagination-Page: 1
X-Pagination-Limit: 10
X-Pagination-Total: 100
X-Pagination-Pages: 10
```

### Pagination Response

```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Webhooks

### Webhook Events

- `app/uninstalled` - App uninstalled from shop
- `app/installed` - App installed on shop
- `customers/create` - New customer created
- `customers/update` - Customer updated
- `orders/create` - New order created
- `orders/fulfilled` - Order fulfilled

### Webhook Verification

All webhooks are verified using HMAC-SHA256 signature validation.

## SDK Usage

### JavaScript/TypeScript

```typescript
import { ShopifyQuizBuilderClient } from '@shopify-quiz-builder/sdk';

const client = new ShopifyQuizBuilderClient({
  baseUrl: 'https://api.your-domain.com/api/v1',
  shopDomain: 'your-shop.myshopify.com',
  accessToken: 'your-access-token'
});

// Create a quiz
const quiz = await client.quizzes.create({
  title: 'Product Quiz',
  description: 'Find your perfect product'
});

// Submit a response
const response = await client.quizzes.submitResponse(quiz.id, {
  customerEmail: 'customer@example.com',
  answers: [
    { questionId: 'q_1', answer: 'shoes' }
  ]
});
```

## Testing

### Test Endpoints

```http
GET /api/v1/test/health
POST /api/v1/test/webhook
```

### Test Data

Test endpoints return mock data for development and testing purposes.

---

*Last updated: January 15, 2024*  
*API Version: 1.0.0*
