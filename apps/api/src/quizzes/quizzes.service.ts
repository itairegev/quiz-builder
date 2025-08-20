import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shopify-quiz-builder/database';
import { CreateQuizDto, UpdateQuizDto, QuizQueryDto } from './dto';
import { Quiz, QuizStatus } from '@prisma/client';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  async createQuiz(shopId: string, createQuizDto: CreateQuizDto): Promise<Quiz> {
    const { title, description, settings, theme } = createQuizDto;

    return this.prisma.quiz.create({
      data: {
        shopId,
        title,
        description,
        settings: settings || {},
        theme: theme || {},
        status: QuizStatus.DRAFT,
      },
      include: {
        shop: true,
        questions: {
          orderBy: { order: 'asc' },
        },
        logicRules: true,
      },
    });
  }

  async findAllQuizzes(shopId: string, query: QuizQueryDto): Promise<Quiz[]> {
    const { status, limit = 50, offset = 0 } = query;

    const where: any = { shopId };
    if (status) {
      where.status = status;
    }

    return this.prisma.quiz.findMany({
      where,
      include: {
        shop: true,
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            questions: true,
            submissions: true,
            analyticsEvents: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findQuizById(shopId: string, quizId: string): Promise<Quiz> {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: quizId,
        shopId,
      },
      include: {
        shop: true,
        questions: {
          orderBy: { order: 'asc' },
        },
        logicRules: {
          orderBy: { priority: 'asc' },
        },
        _count: {
          select: {
            submissions: true,
            analyticsEvents: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    return quiz;
  }

  async updateQuiz(
    shopId: string,
    quizId: string,
    updateQuizDto: UpdateQuizDto,
  ): Promise<Quiz> {
    // Verify quiz exists and belongs to shop
    await this.findQuizById(shopId, quizId);

    const { title, description, settings, theme, status } = updateQuizDto;

    return this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        title,
        description,
        settings,
        theme,
        status,
        ...(status === QuizStatus.PUBLISHED && { publishedAt: new Date() }),
      },
      include: {
        shop: true,
        questions: {
          orderBy: { order: 'asc' },
        },
        logicRules: true,
      },
    });
  }

  async deleteQuiz(shopId: string, quizId: string): Promise<void> {
    // Verify quiz exists and belongs to shop
    await this.findQuizById(shopId, quizId);

    await this.prisma.quiz.delete({
      where: { id: quizId },
    });
  }

  async publishQuiz(shopId: string, quizId: string): Promise<Quiz> {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: quizId,
        shopId,
      },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Validate quiz can be published
    if (!quiz.questions || quiz.questions.length === 0) {
      throw new BadRequestException('Quiz must have at least one question to be published');
    }

    return this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        status: QuizStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        shop: true,
        questions: {
          orderBy: { order: 'asc' },
        },
        logicRules: true,
      },
    });
  }

  async archiveQuiz(shopId: string, quizId: string): Promise<Quiz> {
    await this.findQuizById(shopId, quizId);

    return this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        status: QuizStatus.ARCHIVED,
      },
      include: {
        shop: true,
        questions: {
          orderBy: { order: 'asc' },
        },
        logicRules: true,
      },
    });
  }

  async getQuizAnalytics(shopId: string, quizId: string) {
    const quiz = await this.findQuizById(shopId, quizId);

    const [submissions, analytics] = await Promise.all([
      this.prisma.submission.findMany({
        where: { quizId },
        select: {
          id: true,
          status: true,
          startedAt: true,
          completedAt: true,
          _count: {
            select: { answers: true },
          },
        },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where: { quizId },
        _count: true,
      }),
    ]);

    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(s => s.status === 'COMPLETED').length;
    const completionRate = totalSubmissions > 0 ? (completedSubmissions / totalSubmissions) * 100 : 0;

    return {
      quizId: quiz.id,
      title: quiz.title,
      totalSubmissions,
      completedSubmissions,
      completionRate: Math.round(completionRate * 100) / 100,
      analytics,
      lastUpdated: quiz.updatedAt,
    };
  }
}
