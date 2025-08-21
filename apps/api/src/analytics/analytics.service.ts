import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shopify-quiz-builder/database';
import { AnalyticsQueryDto, ExportAnalyticsDto } from './dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuizAnalytics(quizId: string, shopId: string, query: AnalyticsQueryDto = {}) {
    // Verify the quiz belongs to the shop
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: quizId,
        shopId: shopId,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found or does not belong to this shop');
    }

    const startDate = query.startDate ? new Date(query.startDate) : new Date(0);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Get submissions for the quiz in the date range
    const submissions = await this.prisma.submission.findMany({
      where: {
        quizId: quizId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        answers: true,
      },
    });

    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(s => s.status === 'COMPLETED').length;
    const completionRate = totalSubmissions > 0 ? completedSubmissions / totalSubmissions : 0;

    // Calculate average time spent for completed submissions
    const completedWithTime = submissions.filter(s => s.completedAt && s.startedAt);
    const averageTimeSpent = completedWithTime.length > 0
      ? completedWithTime.reduce((acc, s) => {
          const timeSpent = s.completedAt!.getTime() - s.startedAt.getTime();
          return acc + timeSpent;
        }, 0) / completedWithTime.length
      : 0;

    // Get question performance data
    const questionPerformance = await this.getQuestionPerformance(quizId, startDate, endDate);

    return {
      quizId,
      totalSubmissions,
      completedSubmissions,
      completionRate,
      averageTimeSpent,
      questionPerformance,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  async getShopAnalytics(shopId: string, query: AnalyticsQueryDto = {}) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(0);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Get all quizzes for the shop
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        shopId: shopId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        submissions: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const totalQuizzes = quizzes.length;
    const totalSubmissions = quizzes.reduce((acc, quiz) => acc + quiz.submissions.length, 0);
    const averageQuizCompletion = totalQuizzes > 0 ? totalSubmissions / totalQuizzes : 0;

    // Get top performing quizzes
    const topPerformingQuizzes = quizzes
      .map(quiz => ({
        quizId: quiz.id,
        title: quiz.title,
        submissions: quiz.submissions.length,
        completionRate: quiz.submissions.filter(s => s.status === 'COMPLETED').length / Math.max(quiz.submissions.length, 1),
      }))
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 5);

    return {
      shopId,
      totalQuizzes,
      totalSubmissions,
      averageQuizCompletion,
      topPerformingQuizzes,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  async getCustomerAnalytics(customerId: string, shopId: string, query: AnalyticsQueryDto = {}) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(0);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Get customer submissions across all quizzes in the shop
    const submissions = await this.prisma.submission.findMany({
      where: {
        sessionId: customerId, // Using sessionId as customerId for now
        quiz: {
          shopId: shopId,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (submissions.length === 0) {
      return null; // Customer not found
    }

    const totalQuizzesTaken = submissions.length;
    const completedQuizzes = submissions.filter(s => s.status === 'COMPLETED').length;
    const completionRate = totalQuizzesTaken > 0 ? completedQuizzes / totalQuizzesTaken : 0;

    // Calculate average time spent
    const completedWithTime = submissions.filter(s => s.completedAt && s.startedAt);
    const averageTimePerQuiz = completedWithTime.length > 0
      ? completedWithTime.reduce((acc, s) => {
          const timeSpent = s.completedAt!.getTime() - s.startedAt.getTime();
          return acc + timeSpent;
        }, 0) / completedWithTime.length
      : 0;

    return {
      customerId,
      totalQuizzesTaken,
      completionRate,
      averageTimePerQuiz,
      quizHistory: submissions.map(s => ({
        quizId: s.quiz.id,
        title: s.quiz.title,
        status: s.status,
        completedAt: s.completedAt,
      })),
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  async getRevenueAnalytics(shopId: string, query: AnalyticsQueryDto = {}) {
    // This would integrate with Shopify's revenue data
    // For now, returning mock data structure
    return {
      totalRevenue: 0,
      monthlyRevenue: [],
      revenueByQuiz: [],
      conversionMetrics: {
        overallConversion: 0,
        conversionByQuiz: [],
      },
    };
  }

  async getConversionAnalytics(shopId: string, query: AnalyticsQueryDto = {}) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(0);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Get all submissions for the shop
    const submissions = await this.prisma.submission.findMany({
      where: {
        quiz: {
          shopId: shopId,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(s => s.status === 'COMPLETED').length;
    const overallConversion = totalSubmissions > 0 ? completedSubmissions / totalSubmissions : 0;

    // Group by quiz
    const quizGroups = submissions.reduce((acc, submission) => {
      const quizId = submission.quiz.id;
      if (!acc[quizId]) {
        acc[quizId] = {
          quizId,
          title: submission.quiz.title,
          submissions: 0,
          conversions: 0,
        };
      }
      acc[quizId].submissions++;
      if (submission.status === 'COMPLETED') {
        acc[quizId].conversions++;
      }
      return acc;
    }, {} as Record<string, any>);

    const conversionByQuiz = Object.values(quizGroups).map((quiz: any) => ({
      ...quiz,
      conversion: quiz.submissions > 0 ? quiz.conversions / quiz.submissions : 0,
    }));

    return {
      overallConversion,
      conversionByQuiz,
      totalSubmissions,
      completedSubmissions,
    };
  }

  async getTrendAnalytics(shopId: string, query: AnalyticsQueryDto = {}) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(0);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Get submissions grouped by date
    const submissions = await this.prisma.submission.findMany({
      where: {
        quiz: {
          shopId: shopId,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Group by date
    const dateGroups = submissions.reduce((acc, submission) => {
      const date = submission.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          submissions: 0,
          conversions: 0,
        };
      }
      acc[date].submissions++;
      if (submission.status === 'COMPLETED') {
        acc[date].conversions++;
      }
      return acc;
    }, {} as Record<string, any>);

    const trends = Object.entries(dateGroups).map(([date, data]) => ({
      date,
      submissions: data.submissions,
      conversions: data.conversions,
    }));

    return {
      submissions: trends,
      conversions: trends,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  async exportAnalytics(shopId: string, exportRequest: ExportAnalyticsDto) {
    // This would generate and return the export file
    // For now, returning mock data structure
    const filename = `analytics_${exportRequest.startDate}_to_${exportRequest.endDate}.${exportRequest.format}`;
    
    return {
      filename,
      format: exportRequest.format,
      data: 'Mock export data',
      size: '1KB',
    };
  }

  private async getQuestionPerformance(quizId: string, startDate: Date, endDate: Date) {
    const submissions = await this.prisma.submission.findMany({
      where: {
        quizId: quizId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    // Group answers by question
    const questionStats = submissions.reduce((acc, submission) => {
      submission.answers.forEach(answer => {
        const questionId = answer.questionId;
        if (!acc[questionId]) {
          acc[questionId] = {
            questionId,
            totalAttempts: 0,
            correctAnswers: 0,
          };
        }
        acc[questionId].totalAttempts++;
        // This would need logic to determine correct answers based on question type
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.values(questionStats).map((stat: any) => ({
      ...stat,
      successRate: stat.totalAttempts > 0 ? stat.correctAnswers / stat.totalAttempts : 0,
    }));
  }
}
