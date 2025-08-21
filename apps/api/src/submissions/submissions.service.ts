import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shopify-quiz-builder/database';
import { CreateSubmissionDto, UpdateSubmissionDto, SubmissionQueryDto, SubmissionStatus } from './dto';
import { Submission } from '@shopify-quiz-builder/database';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubmissionDto: CreateSubmissionDto, shopId: string): Promise<Submission> {
    // Verify the quiz belongs to the shop
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: createSubmissionDto.quizId,
        shopId: shopId,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found or does not belong to this shop');
    }

    return this.prisma.submission.create({
      data: {
        ...createSubmissionDto,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            shopId: true,
          },
        },
      },
    });
  }

  async findAll(shopId: string): Promise<Submission[]> {
    return this.prisma.submission.findMany({
      where: {
        quiz: {
          shopId: shopId,
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            shopId: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async find(shopId: string, query: SubmissionQueryDto = {}): Promise<Submission[]> {
    const where: any = {
      quiz: {
        shopId: shopId,
      },
    };

    if (query.quizId) {
      where.quizId = query.quizId;
    }

    if (query.sessionId) {
      where.sessionId = query.sessionId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    return this.prisma.submission.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            shopId: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, shopId: string): Promise<Submission | null> {
    return this.prisma.submission.findFirst({
      where: {
        id: id,
        quiz: {
          shopId: shopId,
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            shopId: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
              },
            },
          },
        },
      },
    });
  }

  async update(
    id: string,
    updateSubmissionDto: UpdateSubmissionDto,
    shopId: string,
  ): Promise<Submission | null> {
    // Verify the submission belongs to the shop
    const existingSubmission = await this.findOne(id, shopId);
    if (!existingSubmission) {
      return null;
    }

    return this.prisma.submission.update({
      where: { id },
      data: updateSubmissionDto,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            shopId: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, shopId: string): Promise<boolean> {
    // Verify the submission belongs to the shop
    const existingSubmission = await this.findOne(id, shopId);
    if (!existingSubmission) {
      return false;
    }

    await this.prisma.submission.delete({
      where: { id },
    });

    return true;
  }

  async findByQuizId(quizId: string, shopId: string): Promise<Submission[]> {
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

    return this.prisma.submission.findMany({
      where: {
        quizId: quizId,
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBySessionId(sessionId: string, shopId: string): Promise<Submission[]> {
    return this.prisma.submission.findMany({
      where: {
        sessionId: sessionId,
        quiz: {
          shopId: shopId,
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            shopId: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getQuizAnalytics(quizId: string, shopId: string) {
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

    const submissions = await this.findByQuizId(quizId, shopId);
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

    return {
      quizId,
      totalSubmissions,
      completedSubmissions,
      completionRate,
      averageTimeSpent,
      submissionsByStatus: {
        IN_PROGRESS: submissions.filter(s => s.status === 'IN_PROGRESS').length,
        COMPLETED: completedSubmissions,
        ABANDONED: submissions.filter(s => s.status === 'ABANDONED').length,
      },
    };
  }

  async countByQuizId(quizId: string, shopId: string): Promise<number> {
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

    return this.prisma.submission.count({
      where: {
        quizId: quizId,
      },
    });
  }

  async markAsCompleted(id: string, shopId: string): Promise<Submission | null> {
    // Verify the submission belongs to the shop
    const existingSubmission = await this.findOne(id, shopId);
    if (!existingSubmission) {
      return null;
    }

    return this.prisma.submission.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            shopId: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
              },
            },
          },
        },
      },
    });
  }
}
