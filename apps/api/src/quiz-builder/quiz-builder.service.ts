import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shopify-quiz-builder/database';
import { QuizStatus, QuestionType, LogicRuleType } from '@prisma/client';
import { LoggerService, MonitoringService } from '@shopify-quiz-builder/common';

export interface QuizBuilderData {
  id?: string;
  title: string;
  description?: string;
  settings?: QuizBuilderSettings;
  theme?: QuizBuilderTheme;
  questions: QuestionBuilderData[];
  logicRules: LogicRuleBuilderData[];
}

export interface QuizBuilderSettings {
  showProgress?: boolean;
  allowBacktracking?: boolean;
  showQuestionNumbers?: boolean;
  requireAllQuestions?: boolean;
  timeLimit?: number; // in seconds
  maxAttempts?: number;
  showResults?: boolean;
  collectEmail?: boolean;
  redirectUrl?: string;
  thankYouMessage?: string;
}

export interface QuizBuilderTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  borderRadius?: string;
  buttonStyle?: 'rounded' | 'square' | 'pill';
  layout?: 'single-column' | 'two-column' | 'card';
  animation?: 'none' | 'fade' | 'slide';
}

export interface QuestionBuilderData {
  id?: string;
  order: number;
  type: QuestionType;
  text: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  settings?: QuestionBuilderSettings;
  validation?: QuestionValidation;
}

export interface QuestionOption {
  id?: string;
  text: string;
  value: string;
  image?: string;
  score?: number;
  tags?: string[];
}

export interface QuestionBuilderSettings {
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  allowMultiple?: boolean;
  randomizeOptions?: boolean;
  showOther?: boolean;
  otherLabel?: string;
}

export interface QuestionValidation {
  required?: boolean;
  pattern?: string;
  message?: string;
  minSelections?: number;
  maxSelections?: number;
}

export interface LogicRuleBuilderData {
  id?: string;
  type: LogicRuleType;
  priority: number;
  conditions: LogicCondition[];
  actions: LogicAction[];
  isActive: boolean;
}

export interface LogicCondition {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface LogicAction {
  type: 'show_question' | 'hide_question' | 'jump_to_question' | 'set_value' | 'send_email' | 'add_to_cart' | 'show_message';
  targetId?: string;
  value?: any;
  message?: string;
}

export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  template: QuizBuilderData;
  previewImage?: string;
}

@Injectable()
export class QuizBuilderService {
  private readonly logger = new Logger(QuizBuilderService.name);
  private readonly loggerService = new LoggerService();
  private readonly monitoringService = new MonitoringService(this.loggerService);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new quiz with builder data
   */
  async createQuizFromBuilder(
    shopId: string,
    builderData: QuizBuilderData,
  ): Promise<any> {
    try {
      this.logger.log(`Creating quiz from builder data for shop: ${shopId}`);

      const quiz = await this.prisma.$transaction(async (tx) => {
        // Create the quiz
        const createdQuiz = await tx.quiz.create({
          data: {
            shopId,
            title: builderData.title,
            description: builderData.description,
            status: QuizStatus.DRAFT,
            settings: (builderData.settings || {}) as any,
            theme: (builderData.theme || {}) as any,
          },
        });

        // Create questions
        const questions = [];
        for (const questionData of builderData.questions) {
          const question = await tx.question.create({
            data: {
              quizId: createdQuiz.id,
              order: questionData.order,
              type: questionData.type,
              text: questionData.text,
              description: questionData.description,
              required: questionData.required,
              options: (questionData.options || []) as any,
              settings: ({
                ...questionData.settings,
                validation: questionData.validation,
              }) as any,
            },
          });
          questions.push(question);
        }

        // Create logic rules
        const logicRules = [];
        for (const ruleData of builderData.logicRules) {
          const rule = await tx.logicRule.create({
            data: {
              quizId: createdQuiz.id,
              type: ruleData.type,
              priority: ruleData.priority,
              conditions: ruleData.conditions as any,
              actions: ruleData.actions as any,
              isActive: ruleData.isActive,
            },
          });
          logicRules.push(rule);
        }

        return {
          ...createdQuiz,
          questions,
          logicRules,
        };
      });

      this.monitoringService.recordMetric('quiz_created', 1, 'builder');

      this.logger.log(`Quiz created successfully: ${quiz.id}`);
      return quiz;
    } catch (error) {
      this.logger.error(`Error creating quiz from builder data:`, error);
      throw error;
    }
  }

  /**
   * Update quiz with builder data
   */
  async updateQuizFromBuilder(
    shopId: string,
    quizId: string,
    builderData: QuizBuilderData,
  ): Promise<any> {
    try {
      this.logger.log(`Updating quiz ${quizId} from builder data for shop: ${shopId}`);

      // Verify quiz ownership
      const existingQuiz = await this.prisma.quiz.findFirst({
        where: { id: quizId, shopId },
        include: { questions: true, logicRules: true },
      });

      if (!existingQuiz) {
        throw new NotFoundException(`Quiz ${quizId} not found`);
      }

      const updatedQuiz = await this.prisma.$transaction(async (tx) => {
        // Update the quiz
        const quiz = await tx.quiz.update({
          where: { id: quizId },
          data: {
            title: builderData.title,
            description: builderData.description,
            settings: (builderData.settings || {}) as any,
            theme: (builderData.theme || {}) as any,
            updatedAt: new Date(),
          },
        });

        // Delete existing questions and logic rules
        await tx.question.deleteMany({ where: { quizId } });
        await tx.logicRule.deleteMany({ where: { quizId } });

        // Create new questions
        const questions = [];
        for (const questionData of builderData.questions) {
          const question = await tx.question.create({
            data: {
              quizId,
              order: questionData.order,
              type: questionData.type,
              text: questionData.text,
              description: questionData.description,
              required: questionData.required,
              options: (questionData.options || []) as any,
              settings: ({
                ...questionData.settings,
                validation: questionData.validation,
              }) as any,
            },
          });
          questions.push(question);
        }

        // Create new logic rules
        const logicRules = [];
        for (const ruleData of builderData.logicRules) {
          const rule = await tx.logicRule.create({
            data: {
              quizId,
              type: ruleData.type,
              priority: ruleData.priority,
              conditions: ruleData.conditions as any,
              actions: ruleData.actions as any,
              isActive: ruleData.isActive,
            },
          });
          logicRules.push(rule);
        }

        return {
          ...quiz,
          questions,
          logicRules,
        };
      });

      this.monitoringService.recordMetric('quiz_updated', 1, 'builder');

      this.logger.log(`Quiz updated successfully: ${quizId}`);
      return updatedQuiz;
    } catch (error) {
      this.logger.error(`Error updating quiz ${quizId} from builder data:`, error);
      throw error;
    }
  }

  /**
   * Get quiz data in builder format
   */
  async getQuizForBuilder(shopId: string, quizId: string): Promise<QuizBuilderData> {
    try {
      const quiz = await this.prisma.quiz.findFirst({
        where: { id: quizId, shopId },
        include: {
          questions: { orderBy: { order: 'asc' } },
          logicRules: { orderBy: { priority: 'asc' } },
        },
      });

      if (!quiz) {
        throw new NotFoundException(`Quiz ${quizId} not found`);
      }

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        settings: quiz.settings as QuizBuilderSettings,
        theme: quiz.theme as QuizBuilderTheme,
        questions: quiz.questions.map(q => ({
          id: q.id,
          order: q.order,
          type: q.type,
          text: q.text,
          description: q.description,
          required: q.required,
          options: (q.options as any)?.options || [],
          settings: (q.settings as any)?.settings || {},
          validation: (q.settings as any)?.validation || {},
        })),
        logicRules: quiz.logicRules.map(r => ({
          id: r.id,
          type: r.type,
          priority: r.priority,
          conditions: r.conditions as unknown as LogicCondition[],
          actions: r.actions as unknown as LogicAction[],
          isActive: r.isActive,
        })),
      };
    } catch (error) {
      this.logger.error(`Error getting quiz ${quizId} for builder:`, error);
      throw error;
    }
  }

  /**
   * Duplicate a quiz
   */
  async duplicateQuiz(
    shopId: string,
    quizId: string,
    newTitle?: string,
  ): Promise<any> {
    try {
      this.logger.log(`Duplicating quiz ${quizId} for shop: ${shopId}`);

      const originalQuiz = await this.getQuizForBuilder(shopId, quizId);
      
      const duplicatedQuiz = {
        ...originalQuiz,
        id: undefined, // Remove ID to create new quiz
        title: newTitle || `${originalQuiz.title} (Copy)`,
        questions: originalQuiz.questions.map(q => ({ ...q, id: undefined })),
        logicRules: originalQuiz.logicRules.map(r => ({ ...r, id: undefined })),
      };

      const result = await this.createQuizFromBuilder(shopId, duplicatedQuiz);

      this.monitoringService.recordMetric('quiz_duplicated', 1, 'duplicated');

      this.logger.log(`Quiz duplicated successfully: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error duplicating quiz ${quizId}:`, error);
      throw error;
    }
  }

  /**
   * Validate quiz builder data
   */
  validateBuilderData(builderData: QuizBuilderData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!builderData.title || builderData.title.trim().length === 0) {
      errors.push('Quiz title is required');
    }

    if (builderData.title && builderData.title.length > 255) {
      errors.push('Quiz title must be less than 255 characters');
    }

    if (builderData.description && builderData.description.length > 1000) {
      errors.push('Quiz description must be less than 1000 characters');
    }

    // Question validation
    if (!builderData.questions || builderData.questions.length === 0) {
      errors.push('Quiz must have at least one question');
    }

    if (builderData.questions) {
      const orders = new Set();
      builderData.questions.forEach((question, index) => {
        if (!question.text || question.text.trim().length === 0) {
          errors.push(`Question ${index + 1} text is required`);
        }

        if (orders.has(question.order)) {
          errors.push(`Duplicate question order: ${question.order}`);
        }
        orders.add(question.order);

        // Validate question type specific requirements
        if (question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.SINGLE_CHOICE) {
          if (!question.options || question.options.length < 2) {
            errors.push(`Question ${index + 1} must have at least 2 options`);
          }
        }

        if (question.type === QuestionType.RATING) {
          const minValue = question.settings?.minValue || 1;
          const maxValue = question.settings?.maxValue || 5;
          if (minValue >= maxValue) {
            errors.push(`Question ${index + 1} min value must be less than max value`);
          }
        }
      });
    }

    // Logic rule validation
    if (builderData.logicRules) {
      builderData.logicRules.forEach((rule, index) => {
        if (!rule.conditions || rule.conditions.length === 0) {
          errors.push(`Logic rule ${index + 1} must have at least one condition`);
        }

        if (!rule.actions || rule.actions.length === 0) {
          errors.push(`Logic rule ${index + 1} must have at least one action`);
        }

        rule.conditions.forEach((condition, condIndex) => {
          const questionExists = builderData.questions.some(q => q.id === condition.questionId);
          if (!questionExists) {
            errors.push(`Logic rule ${index + 1}, condition ${condIndex + 1} references non-existent question`);
          }
        });
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get quiz builder statistics
   */
  async getBuilderStatistics(shopId: string): Promise<any> {
    try {
      const [totalQuizzes, draftQuizzes, publishedQuizzes, totalQuestions] = await Promise.all([
        this.prisma.quiz.count({ where: { shopId } }),
        this.prisma.quiz.count({ where: { shopId, status: QuizStatus.DRAFT } }),
        this.prisma.quiz.count({ where: { shopId, status: QuizStatus.PUBLISHED } }),
        this.prisma.question.count({
          where: { quiz: { shopId } },
        }),
      ]);

      const avgQuestionsPerQuiz = totalQuizzes > 0 ? Math.round(totalQuestions / totalQuizzes) : 0;

      return {
        totalQuizzes,
        draftQuizzes,
        publishedQuizzes,
        totalQuestions,
        avgQuestionsPerQuiz,
        completionRate: totalQuizzes > 0 ? (publishedQuizzes / totalQuizzes) * 100 : 0,
      };
    } catch (error) {
      this.logger.error(`Error getting builder statistics for shop ${shopId}:`, error);
      throw error;
    }
  }

  /**
   * Bulk create questions
   */
  async bulkCreateQuestions(
    shopId: string,
    quizId: string,
    questions: QuestionBuilderData[],
  ): Promise<any[]> {
    try {
      // Verify quiz ownership
      const quiz = await this.prisma.quiz.findFirst({
        where: { id: quizId, shopId },
      });

      if (!quiz) {
        throw new NotFoundException(`Quiz ${quizId} not found`);
      }

      const createdQuestions = [];
      for (const questionData of questions) {
        const question = await this.prisma.question.create({
          data: {
            quizId,
            order: questionData.order,
            type: questionData.type,
            text: questionData.text,
            description: questionData.description,
            required: questionData.required,
            options: (questionData.options || []) as any,
            settings: ({
              ...questionData.settings,
              validation: questionData.validation,
            }) as any,
          },
        });
        createdQuestions.push(question);
      }

      this.monitoringService.recordMetric('questions_bulk_created', questions.length, 'bulk_created');

      return createdQuestions;
    } catch (error) {
      this.logger.error(`Error bulk creating questions for quiz ${quizId}:`, error);
      throw error;
    }
  }

  /**
   * Reorder questions
   */
  async reorderQuestions(
    shopId: string,
    quizId: string,
    questionOrders: { questionId: string; order: number }[],
  ): Promise<void> {
    try {
      // Verify quiz ownership
      const quiz = await this.prisma.quiz.findFirst({
        where: { id: quizId, shopId },
      });

      if (!quiz) {
        throw new NotFoundException(`Quiz ${quizId} not found`);
      }

      await this.prisma.$transaction(async (tx) => {
        for (const { questionId, order } of questionOrders) {
          await tx.question.update({
            where: { id: questionId },
            data: { order },
          });
        }
      });

      this.logger.log(`Questions reordered for quiz ${quizId}`);
    } catch (error) {
      this.logger.error(`Error reordering questions for quiz ${quizId}:`, error);
      throw error;
    }
  }
}
