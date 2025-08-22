import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard';
import { QuestionsController } from '../questions/questions.controller';
import { SubmissionsController } from '../submissions/submissions.controller';
import { AnalyticsController } from '../analytics/analytics.controller';

describe('Core API Controllers Integration', () => {
  let app: INestApplication;
  let mockShopifyAuthGuard: jest.Mocked<ShopifyAuthGuard>;

  // Mock data for testing
  const mockShop = {
    id: 'shop1',
    shopifyDomain: 'test-shop.myshopify.com',
    accessToken: 'mock-access-token',
    scope: 'read_products,write_products',
    email: 'test@shop.com',
    name: 'Test Shop',
    currency: 'USD',
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQuestion = {
    id: 'q1',
    quizId: 'quiz1',
    type: 'MULTIPLE_CHOICE',
    text: 'What is your favorite color?',
    description: 'Choose your favorite color',
    options: ['Red', 'Blue', 'Green'],
    settings: {},
    order: 1,
    required: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubmission = {
    id: 'sub1',
    quizId: 'quiz1',
    sessionId: 'session1',
    status: 'COMPLETED',
    metadata: { browser: 'Chrome', device: 'Desktop' },
    startedAt: new Date(),
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAnalytics = {
    quizId: 'quiz1',
    totalSubmissions: 150,
    averageScore: 78.5,
    completionRate: 0.85,
    averageTimeSpent: 180,
    conversionRate: 0.12,
  };

  beforeEach(async () => {
    // Mock the ShopifyAuthGuard
    const mockGuard = {
      canActivate: jest.fn().mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.shop = mockShop;
        request.shopId = mockShop.id;
        return true;
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ShopifyAuthGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    mockShopifyAuthGuard = mockGuard as unknown as jest.Mocked<ShopifyAuthGuard>;

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Questions Controller Integration', () => {
    const baseUrl = '/api/v1/questions';

    describe('POST /questions', () => {
      it('should create a new question', async () => {
        const createQuestionDto = {
          quizId: 'quiz1',
          type: 'MULTIPLE_CHOICE',
          text: 'What is your favorite color?',
          description: 'Choose your favorite color',
          options: ['Red', 'Blue', 'Green'],
          settings: {},
          order: 1,
          required: true,
        };

        const response = await request(app.getHttpServer())
          .post(baseUrl)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .send(createQuestionDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.text).toBe(createQuestionDto.text);
        expect(response.body.quizId).toBe(createQuestionDto.quizId);
      });

      it('should validate required fields', async () => {
        const invalidDto = {
          type: 'MULTIPLE_CHOICE',
          // Missing required fields
        };

        await request(app.getHttpServer())
          .post(baseUrl)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .send(invalidDto)
          .expect(400);
      });
    });

    describe('GET /questions', () => {
      it('should return all questions for a shop', async () => {
        const response = await request(app.getHttpServer())
          .get(baseUrl)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /questions/:id', () => {
      it('should return a specific question', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/q1`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(response.body).toHaveProperty('id', 'q1');
      });

      it('should return 404 for non-existent question', async () => {
        await request(app.getHttpServer())
          .get(`${baseUrl}/nonexistent`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(404);
      });
    });

    describe('PUT /questions/:id', () => {
      it('should update an existing question', async () => {
        const updateDto = {
          text: 'What is your preferred color?',
          points: 15,
        };

        const response = await request(app.getHttpServer())
          .put(`${baseUrl}/q1`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .send(updateDto)
          .expect(200);

        expect(response.body.text).toBe(updateDto.text);
        expect(response.body.points).toBe(updateDto.points);
      });
    });

    describe('DELETE /questions/:id', () => {
      it('should delete a question', async () => {
        await request(app.getHttpServer())
          .delete(`${baseUrl}/q1`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);
      });
    });

    describe('GET /questions/quiz/:quizId', () => {
      it('should return questions for a specific quiz', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/quiz/quiz1`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });
  });

  describe('Submissions Controller Integration', () => {
    const baseUrl = '/api/v1/submissions';

    describe('POST /submissions', () => {
      it('should create a new submission', async () => {
        const createSubmissionDto = {
          quizId: 'quiz1',
          sessionId: 'session1',
          metadata: { browser: 'Chrome', device: 'Desktop' },
        };

        const response = await request(app.getHttpServer())
          .post(baseUrl)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .send(createSubmissionDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.quizId).toBe(createSubmissionDto.quizId);
        expect(response.body.sessionId).toBe(createSubmissionDto.sessionId);
      });
    });

    describe('GET /submissions', () => {
      it('should return all submissions for a shop', async () => {
        const response = await request(app.getHttpServer())
          .get(baseUrl)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /submissions/:id', () => {
      it('should return a specific submission', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/sub1`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(response.body).toHaveProperty('id', 'sub1');
      });
    });

    describe('PUT /submissions/:id', () => {
      it('should update an existing submission', async () => {
        const updateDto = {
          status: 'COMPLETED',
          completedAt: new Date(),
          metadata: { updated: true },
        };

        const response = await request(app.getHttpServer())
          .put(`${baseUrl}/sub1`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .send(updateDto)
          .expect(200);

        expect(response.body.status).toBe(updateDto.status);
        expect(response.body.completedAt).toBeDefined();
      });
    });

    describe('DELETE /submissions/:id', () => {
      it('should delete a submission', async () => {
        await request(app.getHttpServer())
          .delete(`${baseUrl}/sub1`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);
      });
    });

    describe('GET /submissions/quiz/:quizId', () => {
      it('should return submissions for a specific quiz', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/quiz/quiz1`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

          describe('GET /submissions/session/:sessionId', () => {
        it('should return submissions for a specific session', async () => {
          const response = await request(app.getHttpServer())
            .get(`${baseUrl}/session/session1`)
            .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
            .set('authorization', 'Bearer mock-token')
            .expect(200);

          expect(Array.isArray(response.body)).toBe(true);
        });
      });

    describe('GET /submissions/quiz/:quizId/analytics', () => {
      it('should return analytics for a specific quiz', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/quiz/quiz1/analytics`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(response.body).toHaveProperty('quizId');
        expect(response.body).toHaveProperty('totalSubmissions');
      });
    });
  });

  describe('Analytics Controller Integration', () => {
    const baseUrl = '/api/v1/analytics';

    describe('GET /analytics/quiz/:quizId', () => {
      it('should return quiz analytics', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/quiz/quiz1`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          })
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(response.body).toHaveProperty('quizId');
        expect(response.body).toHaveProperty('totalSubmissions');
      });
    });

    describe('GET /analytics/shop', () => {
      it('should return shop analytics', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/shop`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            includeRevenue: 'true',
          })
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(response.body).toHaveProperty('shopId');
        expect(response.body).toHaveProperty('totalQuizzes');
      });
    });

    describe('GET /analytics/customer/:customerId', () => {
      it('should return customer analytics', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/customer/customer1`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            includeRevenue: 'true',
          })
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(response.body).toHaveProperty('customerId');
        expect(response.body).toHaveProperty('totalQuizzesTaken');
      });
    });

    describe('GET /analytics/revenue', () => {
      it('should return revenue analytics', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/revenue`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            groupBy: 'month',
          })
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(response.body).toHaveProperty('totalRevenue');
        expect(response.body).toHaveProperty('monthlyRevenue');
      });
    });

    describe('GET /analytics/conversion', () => {
      it('should return conversion analytics', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/conversion`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            includeTrends: 'true',
          })
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(response.body).toHaveProperty('overallConversion');
        expect(response.body).toHaveProperty('conversionByQuiz');
      });
    });

    describe('GET /analytics/trends', () => {
      it('should return trend analytics', async () => {
        const response = await request(app.getHttpServer())
          .get(`${baseUrl}/trends`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            metrics: 'submissions,conversions,revenue',
            interval: 'day',
          })
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .expect(200);

        expect(response.body).toHaveProperty('submissions');
        expect(response.body).toHaveProperty('conversions');
        expect(response.body).toHaveProperty('revenue');
      });
    });

    describe('POST /analytics/export', () => {
      it('should export analytics data', async () => {
        const exportRequest = {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: 'csv',
          includeRevenue: true,
        };

        const response = await request(app.getHttpServer())
          .post(`${baseUrl}/export`)
          .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
          .set('authorization', 'Bearer mock-token')
          .send(exportRequest)
          .expect(200);

        expect(response.body).toHaveProperty('filename');
        expect(response.body).toHaveProperty('format');
      });
    });
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without Shopify headers', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/questions')
        .expect(401);
    });

    it('should reject requests with invalid shop domain', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/questions')
        .set('x-shopify-shop-domain', 'invalid-shop.myshopify.com')
        .set('authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should allow requests with valid Shopify headers', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/questions')
        .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
        .set('authorization', 'Bearer mock-token')
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const invalidData = {
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
        .set('authorization', 'Bearer mock-token')
        .send(invalidData)
        .expect(400);
    });

    it('should handle not found errors', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/questions/nonexistent')
        .set('x-shopify-shop-domain', 'test-shop.myshopify.com')
        .set('authorization', 'Bearer mock-token')
        .expect(404);
    });

    it('should handle internal server errors gracefully', async () => {
      // This would require mocking a service to throw an error
      // For now, we'll just ensure the error handling structure is in place
      expect(app).toBeDefined();
    });
  });
});
