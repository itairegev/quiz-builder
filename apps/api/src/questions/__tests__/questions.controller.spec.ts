import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from '../questions.controller';
import { QuestionsService } from '../questions.service';
import { ShopifyAuthGuard } from '../../auth/guards/shopify-auth.guard';
import { CreateQuestionDto, UpdateQuestionDto, QuestionType } from '../dto';
import { Question } from '@shopify-quiz-builder/database';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let service: QuestionsService;
  let mockShopifyAuthGuard: jest.Mocked<ShopifyAuthGuard>;

  const mockQuestion: Question = {
    id: 'q1',
    quizId: 'quiz1',
    type: QuestionType.MULTIPLE_CHOICE,
    text: 'What is your favorite color?',
    description: 'Choose your favorite color',
    options: ['Red', 'Blue', 'Green'],
    settings: {},
    order: 1,
    required: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateQuestionDto: CreateQuestionDto = {
    quizId: 'quiz1',
    type: QuestionType.MULTIPLE_CHOICE,
    text: 'What is your favorite color?',
    description: 'Choose your favorite color',
    options: ['Red', 'Blue', 'Green'],
    settings: {},
    order: 1,
    required: true,
  };

  const mockUpdateQuestionDto: UpdateQuestionDto = {
    text: 'What is your preferred color?',
    description: 'Updated description',
  };

  beforeEach(async () => {
    const mockQuestionsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByQuizId: jest.fn(),
    };

    const mockShopifyAuthGuardInstance = {
      canActivate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: mockQuestionsService,
        },
      ],
    })
      .overrideGuard(ShopifyAuthGuard)
      .useValue(mockShopifyAuthGuardInstance)
      .compile();

    controller = module.get<QuestionsController>(QuestionsController);
    service = module.get<QuestionsService>(QuestionsService);
    mockShopifyAuthGuard = module.get(ShopifyAuthGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new question', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockQuestion);

      const result = await controller.create(mockCreateQuestionDto, 'shop1');

      expect(service.create).toHaveBeenCalledWith(mockCreateQuestionDto, 'shop1');
      expect(result).toEqual(mockQuestion);
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(controller.create(mockCreateQuestionDto, 'shop1')).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    it('should return all questions for a shop', async () => {
      const mockQuestions = [mockQuestion];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockQuestions);

      const result = await controller.findAll('shop1', {});

      expect(service.findAll).toHaveBeenCalledWith('shop1', {});
      expect(result).toEqual(mockQuestions);
    });

    it('should return empty array when no questions exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll('shop1', {});

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single question by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockQuestion);

      const result = await controller.findOne('q1', 'shop1');

      expect(service.findOne).toHaveBeenCalledWith('q1', 'shop1');
      expect(result).toEqual(mockQuestion);
    });

    it('should throw error when question not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne('nonexistent', 'shop1')).rejects.toThrow('Question not found');
    });
  });

  describe('update', () => {
    it('should update an existing question', async () => {
      const updatedQuestion = { ...mockQuestion, ...mockUpdateQuestionDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedQuestion);

      const result = await controller.update('q1', mockUpdateQuestionDto, 'shop1');

      expect(service.update).toHaveBeenCalledWith('q1', mockUpdateQuestionDto, 'shop1');
      expect(result).toEqual(updatedQuestion);
    });

    it('should handle update errors gracefully', async () => {
      const error = new Error('Update failed');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      await expect(controller.update('q1', mockUpdateQuestionDto, 'shop1')).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('should remove a question', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(true);

      const result = await controller.remove('q1', 'shop1');

      expect(service.remove).toHaveBeenCalledWith('q1', 'shop1');
      expect(result).toEqual({ message: 'Question deleted successfully' });
    });

    it('should handle question not found', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(false);

      await expect(controller.remove('nonexistent', 'shop1')).rejects.toThrow('Question not found');
    });

    it('should handle removal errors gracefully', async () => {
      const error = new Error('Removal failed');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      await expect(controller.remove('q1', 'shop1')).rejects.toThrow('Removal failed');
    });
  });

  describe('findByQuizId', () => {
    it('should return questions for a specific quiz', async () => {
      const mockQuestions = [mockQuestion];
      jest.spyOn(service, 'findByQuizId').mockResolvedValue(mockQuestions);

      const result = await controller.findByQuizId('quiz1', 'shop1');

      expect(service.findByQuizId).toHaveBeenCalledWith('quiz1', 'shop1');
      expect(result).toEqual(mockQuestions);
    });

    it('should return empty array when quiz has no questions', async () => {
      jest.spyOn(service, 'findByQuizId').mockResolvedValue([]);

      const result = await controller.findByQuizId('quiz1', 'shop1');

      expect(result).toEqual([]);
    });
  });
});
