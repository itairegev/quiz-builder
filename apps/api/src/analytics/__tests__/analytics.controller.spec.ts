import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from '../analytics.controller';
import { AnalyticsService } from '../analytics.service';
import { ShopifyAuthGuard } from '../../auth/guards/shopify-auth.guard';
import { AnalyticsGroupBy, AnalyticsMetrics } from '../dto/analytics-query.dto';
import { ExportFormat } from '../dto/export-analytics.dto';
import { SubmissionStatus } from '../../submissions/dto/submission-query.dto';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;
  let mockShopifyAuthGuard: jest.Mocked<ShopifyAuthGuard>;

  const mockQuizAnalytics = {
    quizId: 'quiz1',
    totalSubmissions: 150,
    completedSubmissions: 128,
    completionRate: 0.85,
    averageTimeSpent: 180,
    questionPerformance: [
      {
        questionId: 'q1',
        correctAnswers: 120,
        totalAttempts: 150,
        successRate: 0.8,
        averageTime: 45,
      },
    ],
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    },
  };

  const mockShopAnalytics = {
    shopId: 'shop1',
    totalQuizzes: 5,
    totalSubmissions: 750,
    averageQuizCompletion: 0.82,
    topPerformingQuizzes: [
      {
        quizId: 'quiz1',
        title: 'Product Preference Quiz',
        submissions: 150,
        completionRate: 0.85,
      },
    ],
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    },
  };

  const mockCustomerAnalytics = {
    customerId: 'customer1',
    totalQuizzesTaken: 8,
    completionRate: 0.9,
    averageTimePerQuiz: 150,
    quizHistory: [
      {
        quizId: 'quiz1',
        title: 'Product Preference Quiz',
        status: SubmissionStatus.COMPLETED,
        completedAt: new Date('2024-01-15'),
      },
    ],
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    },
  };

  beforeEach(async () => {
    const mockAnalyticsService = {
      getQuizAnalytics: jest.fn(),
      getShopAnalytics: jest.fn(),
      getCustomerAnalytics: jest.fn(),
      getRevenueAnalytics: jest.fn(),
      getConversionAnalytics: jest.fn(),
      getTrendAnalytics: jest.fn(),
      exportAnalytics: jest.fn(),
    };

    const mockShopifyAuthGuardInstance = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    })
    .overrideGuard(ShopifyAuthGuard)
    .useValue(mockShopifyAuthGuardInstance)
    .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
    mockShopifyAuthGuard = module.get(ShopifyAuthGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getQuizAnalytics', () => {
    it('should return analytics for a specific quiz', async () => {
      jest.spyOn(service, 'getQuizAnalytics').mockResolvedValue(mockQuizAnalytics);

      const result = await controller.getQuizAnalytics('quiz1', 'shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(service.getQuizAnalytics).toHaveBeenCalledWith('quiz1', 'shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(result).toEqual(mockQuizAnalytics);
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Analytics service error');
      jest.spyOn(service, 'getQuizAnalytics').mockRejectedValue(error);

      await expect(
        controller.getQuizAnalytics('quiz1', 'shop1', {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      ).rejects.toThrow('Analytics service error');
    });
  });

  describe('getShopAnalytics', () => {
    it('should return overall shop analytics', async () => {
      jest.spyOn(service, 'getShopAnalytics').mockResolvedValue(mockShopAnalytics);

      const result = await controller.getShopAnalytics('shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        includeRevenue: true,
      });

      expect(service.getShopAnalytics).toHaveBeenCalledWith('shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        includeRevenue: true,
      });
      expect(result).toEqual(mockShopAnalytics);
    });

    it('should handle missing date parameters', async () => {
      jest.spyOn(service, 'getShopAnalytics').mockResolvedValue(mockShopAnalytics);

      const result = await controller.getShopAnalytics('shop1', {});

      expect(service.getShopAnalytics).toHaveBeenCalledWith('shop1', {});
      expect(result).toEqual(mockShopAnalytics);
    });
  });

  describe('getCustomerAnalytics', () => {
    it('should return analytics for a specific customer', async () => {
      jest.spyOn(service, 'getCustomerAnalytics').mockResolvedValue(mockCustomerAnalytics);

      const result = await controller.getCustomerAnalytics('customer1', 'shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        includeRevenue: true,
      });

      expect(service.getCustomerAnalytics).toHaveBeenCalledWith('customer1', 'shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        includeRevenue: true,
      });
      expect(result).toEqual(mockCustomerAnalytics);
    });

    it('should handle customer not found', async () => {
      jest.spyOn(service, 'getCustomerAnalytics').mockResolvedValue(null);

      await expect(
        controller.getCustomerAnalytics('nonexistent', 'shop1', {})
      ).rejects.toThrow('Customer not found');
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should return revenue analytics for the shop', async () => {
      const mockRevenueAnalytics = {
        totalRevenue: 1250.50,
        monthlyRevenue: [
          { month: '2024-01', revenue: 1250.50 },
          { month: '2023-12', revenue: 1100.00 },
        ],
        revenueByQuiz: [
          { quizId: 'quiz1', revenue: 450.00, submissions: 150 },
          { quizId: 'quiz2', revenue: 800.50, submissions: 200 },
        ],
        conversionMetrics: {
          overallConversion: 0.12,
          conversionByQuiz: [
            { quizId: 'quiz1', conversion: 0.15 },
            { quizId: 'quiz2', conversion: 0.10 },
          ],
        },
      };

      jest.spyOn(service, 'getRevenueAnalytics').mockResolvedValue(mockRevenueAnalytics);

      const result = await controller.getRevenueAnalytics('shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: AnalyticsGroupBy.MONTH,
      });

      expect(service.getRevenueAnalytics).toHaveBeenCalledWith('shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: AnalyticsGroupBy.MONTH,
      });
      expect(result).toEqual(mockRevenueAnalytics);
    });
  });

  describe('getConversionAnalytics', () => {
    it('should return conversion analytics', async () => {
      const mockConversionAnalytics = {
        overallConversion: 0.12,
        conversionByQuiz: [
          { quizId: 'quiz1', conversion: 0.15, submissions: 150, conversions: 23 },
          { quizId: 'quiz2', conversion: 0.10, submissions: 200, conversions: 20 },
        ],
        totalSubmissions: 350,
        completedSubmissions: 43,
      };

      jest.spyOn(service, 'getConversionAnalytics').mockResolvedValue(mockConversionAnalytics);

      const result = await controller.getConversionAnalytics('shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        includeTrends: true,
      });

      expect(service.getConversionAnalytics).toHaveBeenCalledWith('shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        includeTrends: true,
      });
      expect(result).toEqual(mockConversionAnalytics);
    });
  });

  describe('getTrendAnalytics', () => {
    it('should return trend analytics', async () => {
      const mockTrendAnalytics = {
        submissions: [
          { date: '2024-01-01', submissions: 10, conversions: 1 },
          { date: '2024-01-02', submissions: 15, conversions: 2 },
        ],
        conversions: [
          { date: '2024-01-01', submissions: 10, conversions: 1 },
          { date: '2024-01-02', submissions: 15, conversions: 2 },
        ],
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
      };

      jest.spyOn(service, 'getTrendAnalytics').mockResolvedValue(mockTrendAnalytics);

      const result = await controller.getTrendAnalytics('shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        metrics: [AnalyticsMetrics.SUBMISSIONS, AnalyticsMetrics.CONVERSIONS],
      });

      expect(service.getTrendAnalytics).toHaveBeenCalledWith('shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        metrics: [AnalyticsMetrics.SUBMISSIONS, AnalyticsMetrics.CONVERSIONS],
      });
      expect(result).toEqual(mockTrendAnalytics);
    });
  });

  describe('exportAnalytics', () => {
    it('should export analytics data', async () => {
      const mockExportData = {
        filename: 'analytics_2024-01-01_to_2024-01-31.csv',
        data: 'csv,data,here',
        format: ExportFormat.CSV,
        size: '2.5KB',
      };

      jest.spyOn(service, 'exportAnalytics').mockResolvedValue(mockExportData);

      const result = await controller.exportAnalytics({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        format: ExportFormat.CSV,
        includeRevenue: true,
      }, 'shop1');

      expect(service.exportAnalytics).toHaveBeenCalledWith('shop1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        format: ExportFormat.CSV,
        includeRevenue: true,
      });
      expect(result).toEqual(mockExportData);
    });

    it('should handle export errors gracefully', async () => {
      const error = new Error('Export failed');
      jest.spyOn(service, 'exportAnalytics').mockRejectedValue(error);

      await expect(
        controller.exportAnalytics({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: ExportFormat.CSV,
        }, 'shop1')
      ).rejects.toThrow('Export failed');
    });
  });
});
