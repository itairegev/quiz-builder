import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ShopifyModule } from './shopify.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';

describe('Shopify Authentication Integration', () => {
  let app: INestApplication;
  let shopifyService: any;

  const mockShopifyService = {
    authenticateShop: jest.fn(),
    upsertShop: jest.fn(),
    validateWebhookSignature: jest.fn(),
    getShopifyConfig: jest.fn(),
  };

  const mockShop = {
    id: 'test-shop-id',
    shopifyDomain: 'test.myshopify.com',
    accessToken: 'test-access-token',
    scope: 'read_products,write_products',
    email: 'test@example.com',
    name: 'Test Shop',
    currency: 'USD',
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env'],
        }),
        DatabaseModule,
        AuthModule,
        ShopifyModule,
      ],
    })
      .overrideProvider('ShopifyService')
      .useValue(mockShopifyService)
      .compile();

    app = moduleFixture.createNestApplication();
    shopifyService = moduleFixture.get('ShopifyService');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Shop Installation Flow', () => {
    it('should install app successfully', async () => {
      mockShopifyService.upsertShop.mockResolvedValue(mockShop);

      const response = await request(app.getHttpServer())
        .post('/api/v1/shopify/install')
        .send({
          shopifyDomain: 'test.myshopify.com',
          accessToken: 'test-access-token',
          scope: 'read_products,write_products',
          email: 'test@example.com',
          name: 'Test Shop',
        })
        .expect(201);

      expect(response.body).toEqual({
        data: {
          message: 'App installed successfully',
          shop: {
            id: mockShop.id,
            domain: mockShop.shopifyDomain,
            scope: mockShop.scope,
          },
        },
        statusCode: 201,
        message: 'Success',
        timestamp: expect.any(String),
        path: '/api/v1/shopify/install',
      });

      expect(mockShopifyService.upsertShop).toHaveBeenCalledWith({
        shopifyDomain: 'test.myshopify.com',
        accessToken: 'test-access-token',
        scope: 'read_products,write_products',
        email: 'test@example.com',
        name: 'Test Shop',
      });
    });

    it('should handle installation errors gracefully', async () => {
      mockShopifyService.upsertShop.mockRejectedValue(new Error('Database error'));

      await request(app.getHttpServer())
        .post('/api/v1/shopify/install')
        .send({
          shopifyDomain: 'test.myshopify.com',
          accessToken: 'test-access-token',
          scope: 'read_products',
        })
        .expect(500);
    });
  });

  describe('Webhook Handling', () => {
    it('should process valid webhooks', async () => {
      const mockConfig = {
        webhookSecret: 'test-secret',
      };

      mockShopifyService.getShopifyConfig.mockReturnValue(mockConfig);
      mockShopifyService.validateWebhookSignature.mockReturnValue(true);

      const response = await request(app.getHttpServer())
        .post('/api/v1/shopify/webhook')
        .set('x-shopify-hmac-sha256', 'test-signature')
        .set('x-shopify-topic', 'app/uninstalled')
        .set('x-shopify-shop-domain', 'test.myshopify.com')
        .send({ test: 'data' })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Webhook processed successfully',
      });

      expect(mockShopifyService.validateWebhookSignature).toHaveBeenCalledWith(
        '{"test":"data"}',
        'test-signature',
        'test-secret'
      );
    });

    it('should reject invalid webhook signatures', async () => {
      const mockConfig = {
        webhookSecret: 'test-secret',
      };

      mockShopifyService.getShopifyConfig.mockReturnValue(mockConfig);
      mockShopifyService.validateWebhookSignature.mockReturnValue(false);

      await request(app.getHttpServer())
        .post('/api/v1/shopify/webhook')
        .set('x-shopify-hmac-sha256', 'invalid-signature')
        .set('x-shopify-topic', 'app/uninstalled')
        .set('x-shopify-shop-domain', 'test.myshopify.com')
        .send({ test: 'data' })
        .expect(500);
    });
  });

  describe('OAuth Callback Flow', () => {
    it('should process OAuth callback with valid authentication', async () => {
      mockShopifyService.authenticateShop.mockResolvedValue({
        shop: mockShop,
        isValid: true,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/shopify/auth/callback')
        .set('x-shopify-shop-domain', 'test.myshopify.com')
        .set('authorization', 'Bearer test-access-token')
        .send({ code: 'test-code', state: 'test-state' })
        .expect(200);

      expect(response.body).toEqual({
        message: 'OAuth callback processed successfully',
        shopId: mockShop.id,
        shopDomain: mockShop.shopifyDomain,
      });
    });

    it('should reject OAuth callback without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/shopify/auth/callback')
        .send({ code: 'test-code', state: 'test-state' })
        .expect(401);
    });

    it('should reject OAuth callback with invalid authentication', async () => {
      mockShopifyService.authenticateShop.mockResolvedValue({
        shop: null,
        isValid: false,
      });

      await request(app.getHttpServer())
        .post('/api/v1/shopify/auth/callback')
        .set('x-shopify-shop-domain', 'test.myshopify.com')
        .set('authorization', 'Bearer invalid-token')
        .send({ code: 'test-code', state: 'test-state' })
        .expect(401);
    });
  });

  describe('Authentication Middleware Integration', () => {
    it('should protect routes that require Shopify authentication', async () => {
      // Test a protected route without authentication
      await request(app.getHttpServer())
        .get('/api/v1/quizzes')
        .expect(401);
    });

    it('should allow access to protected routes with valid authentication', async () => {
      mockShopifyService.authenticateShop.mockResolvedValue({
        shop: mockShop,
        isValid: true,
      });

      // Mock the quizzes service to return empty array
      const mockQuizzesService = {
        findAllQuizzes: jest.fn().mockResolvedValue([]),
      };

      // Override the quizzes service in the test module
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.test', '.env'],
          }),
          DatabaseModule,
          AuthModule,
          ShopifyModule,
        ],
      })
        .overrideProvider('ShopifyService')
        .useValue(mockShopifyService)
        .overrideProvider('QuizzesService')
        .useValue(mockQuizzesService)
        .compile();

      const testApp = moduleFixture.createNestApplication();
      await testApp.init();

      const response = await request(testApp.getHttpServer())
        .get('/api/v1/quizzes')
        .set('x-shopify-shop-domain', 'test.myshopify.com')
        .set('authorization', 'Bearer test-access-token')
        .expect(200);

      expect(response.body).toEqual({
        data: [],
        statusCode: 200,
        message: 'Success',
        timestamp: expect.any(String),
        path: '/api/v1/quizzes',
      });

      await testApp.close();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required headers gracefully', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/shopify/auth/callback')
        .set('x-shopify-shop-domain', 'test.myshopify.com')
        // Missing authorization header
        .send({ code: 'test-code' })
        .expect(401);
    });

    it('should handle malformed authorization headers', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/shopify/auth/callback')
        .set('x-shopify-shop-domain', 'test.myshopify.com')
        .set('authorization', 'InvalidFormat test-token')
        .send({ code: 'test-code' })
        .expect(401);
    });

    it('should handle service layer errors', async () => {
      mockShopifyService.authenticateShop.mockRejectedValue(new Error('Service error'));

      await request(app.getHttpServer())
        .post('/api/v1/shopify/auth/callback')
        .set('x-shopify-shop-domain', 'test.myshopify.com')
        .set('authorization', 'Bearer test-token')
        .send({ code: 'test-code' })
        .expect(500);
    });
  });
});
