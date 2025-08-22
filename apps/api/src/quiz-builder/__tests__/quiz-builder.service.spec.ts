import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizBuilderService, QuizBuilderData } from '../quiz-builder.service';
import { PrismaService } from '@shopify-quiz-builder/database';
import { QuestionType, QuizStatus, LogicRuleType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

describe('QuizBuilderService', () => {
  let service: QuizBuilderService;
  let mockPrisma: any;
  let mockConfigService: jest.Mocked<ConfigService>;

  const mockQuizBuilderData: QuizBuilderData = {
    title: 'Test Quiz',
    description: 'Test Description',
    settings: {
      showProgress: true,
      allowBacktracking: true,
      showQuestionNumbers: false,
      requireAllQuestions: true,
    },
    theme: {
      primaryColor: '#6366f1',
      secondaryColor: '#f3f4f6',
      fontFamily: 'Inter',
      borderRadius: '8px',
    },
    questions: [
      {
        id: 'q1',
        order: 1,
        type: QuestionType.SINGLE_CHOICE,
        text: 'What is your preference?',
        required: true,
        options: [
          { text: 'Option A', value: 'a' },
          { text: 'Option B', value: 'b' },
        ],
      },
      {
        id: 'q2',
        order: 2,
        type: QuestionType.TEXT,
        text: 'Please provide details',
        required: false,
        settings: {
          placeholder: 'Enter details...',
          maxLength: 500,
        },
      },
    ],
    logicRules: [
      {
        type: LogicRuleType.JUMP_TO_QUESTION,
        priority: 1,
        isActive: true,
        conditions: [
          {
            questionId: 'q1',
            operator: 'equals',
            value: 'a',
          },
        ],
        actions: [
          {
            type: 'jump_to_question',
            targetId: 'q2',
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    mockPrisma = {
      quiz: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      question: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      logicRule: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizBuilderService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QuizBuilderService>(QuizBuilderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuizFromBuilder', () => {
    it('should create a quiz with questions and logic rules', async () => {
      const mockCreatedQuiz = {
        id: 'quiz-1',
        shopId: 'shop-1',
        title: 'Test Quiz',
        description: 'Test Description',
        status: QuizStatus.DRAFT,
        settings: mockQuizBuilderData.settings,
        theme: mockQuizBuilderData.theme,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCreatedQuestion = {
        id: 'question-1',
        quizId: 'quiz-1',
        order: 1,
        type: QuestionType.SINGLE_CHOICE,
        text: 'What is your preference?',
        required: true,
        options: mockQuizBuilderData.questions[0].options,
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCreatedLogicRule = {
        id: 'rule-1',
        quizId: 'quiz-1',
        type: LogicRuleType.JUMP_TO_QUESTION,
        priority: 1,
        conditions: mockQuizBuilderData.logicRules[0].conditions,
        actions: mockQuizBuilderData.logicRules[0].actions,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          quiz: {
            create: jest.fn().mockResolvedValue(mockCreatedQuiz),
          },
          question: {
            create: jest.fn()
              .mockResolvedValueOnce(mockCreatedQuestion)
              .mockResolvedValueOnce({ ...mockCreatedQuestion, id: 'question-2', order: 2 }),
          },
          logicRule: {
            create: jest.fn().mockResolvedValue(mockCreatedLogicRule),
          },
        });
      });

      const result = await service.createQuizFromBuilder('shop-1', mockQuizBuilderData);

      expect(result).toBeDefined();
      expect(result.id).toBe('quiz-1');
      expect(result.title).toBe('Test Quiz');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createQuizFromBuilder('shop-1', mockQuizBuilderData),
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateQuizFromBuilder', () => {
    it('should update an existing quiz', async () => {
      const existingQuiz = {
        id: 'quiz-1',
        shopId: 'shop-1',
        title: 'Old Title',
        questions: [],
        logicRules: [],
      };

      const updatedQuiz = {
        ...existingQuiz,
        title: 'Test Quiz',
        description: 'Test Description',
      };

      mockPrisma.quiz.findFirst.mockResolvedValue(existingQuiz);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          quiz: {
            update: jest.fn().mockResolvedValue(updatedQuiz),
          },
          question: {
            deleteMany: jest.fn(),
            create: jest.fn().mockResolvedValue({}),
          },
          logicRule: {
            deleteMany: jest.fn(),
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await service.updateQuizFromBuilder('shop-1', 'quiz-1', mockQuizBuilderData);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Quiz');
      expect(mockPrisma.quiz.findFirst).toHaveBeenCalledWith({
        where: { id: 'quiz-1', shopId: 'shop-1' },
        include: { questions: true, logicRules: true },
      });
    });

    it('should throw NotFoundException for non-existent quiz', async () => {
      mockPrisma.quiz.findFirst.mockResolvedValue(null);

      await expect(
        service.updateQuizFromBuilder('shop-1', 'non-existent', mockQuizBuilderData),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getQuizForBuilder', () => {
    it('should return quiz data in builder format', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        title: 'Test Quiz',
        description: 'Test Description',
        settings: mockQuizBuilderData.settings,
        theme: mockQuizBuilderData.theme,
        questions: [
          {
            id: 'question-1',
            order: 1,
            type: QuestionType.SINGLE_CHOICE,
            text: 'What is your preference?',
            description: null,
            required: true,
            options: { options: mockQuizBuilderData.questions[0].options },
            settings: { settings: {}, validation: {} },
          },
        ],
        logicRules: [
          {
            id: 'rule-1',
            type: LogicRuleType.JUMP_TO_QUESTION,
            priority: 1,
            conditions: mockQuizBuilderData.logicRules[0].conditions,
            actions: mockQuizBuilderData.logicRules[0].actions,
            isActive: true,
          },
        ],
      };

      mockPrisma.quiz.findFirst.mockResolvedValue(mockQuiz);

      const result = await service.getQuizForBuilder('shop-1', 'quiz-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('quiz-1');
      expect(result.title).toBe('Test Quiz');
      expect(result.questions).toHaveLength(1);
      expect(result.logicRules).toHaveLength(1);
    });

    it('should throw NotFoundException for non-existent quiz', async () => {
      mockPrisma.quiz.findFirst.mockResolvedValue(null);

      await expect(
        service.getQuizForBuilder('shop-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('duplicateQuiz', () => {
    it('should duplicate a quiz with new title', async () => {
      const originalQuiz = mockQuizBuilderData;
      
      jest.spyOn(service, 'getQuizForBuilder').mockResolvedValue(originalQuiz);
      jest.spyOn(service, 'createQuizFromBuilder').mockResolvedValue({
        id: 'new-quiz-1',
        title: 'Test Quiz (Copy)',
      } as any);

      const result = await service.duplicateQuiz('shop-1', 'quiz-1', 'Test Quiz (Copy)');

      expect(result).toBeDefined();
      expect(result.id).toBe('new-quiz-1');
      expect(result.title).toBe('Test Quiz (Copy)');
    });
  });

  describe('validateBuilderData', () => {
    it('should return valid for correct data', () => {
      const result = service.validateBuilderData(mockQuizBuilderData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for missing title', () => {
      const invalidData = { ...mockQuizBuilderData, title: '' };

      const result = service.validateBuilderData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Quiz title is required');
    });

    it('should return invalid for no questions', () => {
      const invalidData = { ...mockQuizBuilderData, questions: [] };

      const result = service.validateBuilderData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Quiz must have at least one question');
    });

    it('should validate choice questions have options', () => {
      const invalidData = {
        ...mockQuizBuilderData,
        questions: [
          {
            order: 1,
            type: QuestionType.SINGLE_CHOICE,
            text: 'Test question',
            required: true,
            options: [], // No options
          },
        ],
      };

      const result = service.validateBuilderData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Question 1 must have at least 2 options');
    });

    it('should validate rating questions have valid range', () => {
      const invalidData = {
        ...mockQuizBuilderData,
        questions: [
          {
            order: 1,
            type: QuestionType.RATING,
            text: 'Rate this',
            required: true,
            settings: {
              minValue: 5,
              maxValue: 3, // Invalid: min > max
            },
          },
        ],
      };

      const result = service.validateBuilderData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Question 1 min value must be less than max value');
    });
  });

  describe('getBuilderStatistics', () => {
    it('should return builder statistics', async () => {
      mockPrisma.quiz.count
        .mockResolvedValueOnce(10) // totalQuizzes
        .mockResolvedValueOnce(6)  // draftQuizzes
        .mockResolvedValueOnce(4); // publishedQuizzes
      
      mockPrisma.question.count.mockResolvedValue(50); // totalQuestions

      const result = await service.getBuilderStatistics('shop-1');

      expect(result).toEqual({
        totalQuizzes: 10,
        draftQuizzes: 6,
        publishedQuizzes: 4,
        totalQuestions: 50,
        avgQuestionsPerQuiz: 5,
        completionRate: 40,
      });
    });

    it('should handle zero quizzes', async () => {
      mockPrisma.quiz.count.mockResolvedValue(0);
      mockPrisma.question.count.mockResolvedValue(0);

      const result = await service.getBuilderStatistics('shop-1');

      expect(result.totalQuizzes).toBe(0);
      expect(result.avgQuestionsPerQuiz).toBe(0);
      expect(result.completionRate).toBe(0);
    });
  });

  describe('bulkCreateQuestions', () => {
    it('should create multiple questions', async () => {
      const questions = mockQuizBuilderData.questions;
      
      mockPrisma.quiz.findFirst.mockResolvedValue({ id: 'quiz-1', shopId: 'shop-1' });
      mockPrisma.question.create.mockResolvedValue({ id: 'question-1' });

      const result = await service.bulkCreateQuestions('shop-1', 'quiz-1', questions);

      expect(result).toHaveLength(2);
      expect(mockPrisma.question.create).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException for invalid quiz', async () => {
      mockPrisma.quiz.findFirst.mockResolvedValue(null);

      await expect(
        service.bulkCreateQuestions('shop-1', 'invalid-quiz', []),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorderQuestions', () => {
    it('should reorder questions', async () => {
      const questionOrders = [
        { questionId: 'q1', order: 2 },
        { questionId: 'q2', order: 1 },
      ];

      mockPrisma.quiz.findFirst.mockResolvedValue({ id: 'quiz-1', shopId: 'shop-1' });
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          question: {
            update: jest.fn(),
          },
        });
      });

      await service.reorderQuestions('shop-1', 'quiz-1', questionOrders);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid quiz', async () => {
      mockPrisma.quiz.findFirst.mockResolvedValue(null);

      await expect(
        service.reorderQuestions('shop-1', 'invalid-quiz', []),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
