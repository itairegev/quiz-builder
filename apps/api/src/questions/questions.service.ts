import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shopify-quiz-builder/database';
import { CreateQuestionDto, UpdateQuestionDto, QuestionQueryDto } from './dto';
import { Question } from '@shopify-quiz-builder/database';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto, shopId: string): Promise<Question> {
    // Verify the quiz belongs to the shop
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: createQuestionDto.quizId,
        shopId: shopId,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found or does not belong to this shop');
    }

    return this.prisma.question.create({
      data: {
        ...createQuestionDto,
      },
    });
  }

  async findAll(shopId: string, query: QuestionQueryDto = {}): Promise<Question[]> {
    const where: any = {
      quiz: {
        shopId: shopId,
      },
    };

    if (query.quizId) {
      where.quizId = query.quizId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.required !== undefined) {
      where.required = query.required;
    }

    return this.prisma.question.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            shopId: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string, shopId: string): Promise<Question | null> {
    return this.prisma.question.findFirst({
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
      },
    });
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
    shopId: string,
  ): Promise<Question | null> {
    // Verify the question belongs to the shop
    const existingQuestion = await this.findOne(id, shopId);
    if (!existingQuestion) {
      return null;
    }

    return this.prisma.question.update({
      where: { id },
      data: updateQuestionDto,
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

  async remove(id: string, shopId: string): Promise<boolean> {
    // Verify the question belongs to the shop
    const existingQuestion = await this.findOne(id, shopId);
    if (!existingQuestion) {
      return false;
    }

    await this.prisma.question.delete({
      where: { id },
    });

    return true;
  }

  async findByQuizId(quizId: string, shopId: string): Promise<Question[]> {
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

    return this.prisma.question.findMany({
      where: {
        quizId: quizId,
      },
      orderBy: {
        order: 'asc',
      },
    });
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

    return this.prisma.question.count({
      where: {
        quizId: quizId,
      },
    });
  }

  async reorderQuestions(quizId: string, shopId: string, questionIds: string[]): Promise<Question[]> {
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

    // Update the order of questions
    const updates = questionIds.map((questionId, index) => ({
      where: { id: questionId },
      data: { order: index + 1 },
    }));

    await this.prisma.$transaction(
      updates.map(update => this.prisma.question.update(update))
    );

    return this.findByQuizId(quizId, shopId);
  }
}
