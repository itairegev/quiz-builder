import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '@shopify-quiz-builder/database';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // Quiz operations
  async createQuiz(data: any) {
    return this.prisma.quiz.create({ data });
  }

  async findQuizById(id: string) {
    return this.prisma.quiz.findUnique({ where: { id } });
  }

  async findQuizzesByShopId(shopId: string) {
    return this.prisma.quiz.findMany({ where: { shopId } });
  }

  async updateQuiz(id: string, data: any) {
    return this.prisma.quiz.update({ where: { id }, data });
  }

  async deleteQuiz(id: string) {
    return this.prisma.quiz.delete({ where: { id } });
  }

  // Question operations
  async createQuestion(data: any) {
    return this.prisma.question.create({ data });
  }

  async findQuestionsByQuizId(quizId: string) {
    return this.prisma.question.findMany({ 
      where: { quizId },
      orderBy: { order: 'asc' }
    });
  }

  // Submission operations
  async createSubmission(data: any) {
    return this.prisma.submission.create({ data });
  }

  async findSubmissionById(id: string) {
    return this.prisma.submission.findUnique({ where: { id } });
  }

  // Analytics operations
  async createAnalyticsEvent(data: any) {
    return this.prisma.analyticsEvent.create({ data });
  }

  // Health check
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', database: 'connected' };
    } catch (error) {
      return { status: 'unhealthy', database: 'disconnected', error: error.message };
    }
  }

  // Get raw Prisma client for advanced operations
  get prismaClient() {
    return this.prisma;
  }
}
