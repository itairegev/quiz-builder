import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from '../submissions.controller';
import { SubmissionsService } from '../submissions.service';
import { ShopifyAuthGuard } from '../../auth/guards/shopify-auth.guard';
import { CreateSubmissionDto, UpdateSubmissionDto, SubmissionStatus } from '../dto';
import { Submission } from '@shopify-quiz-builder/database';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let service: SubmissionsService;
  let mockShopifyAuthGuard: jest.Mocked<ShopifyAuthGuard>;

  const mockSubmission: Submission = {
    id: 'sub1',
    quizId: 'quiz1',
    sessionId: 'session1',
    status: SubmissionStatus.COMPLETED,
    metadata: { browser: 'Chrome', device: 'Desktop' },
    startedAt: new Date(),
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateSubmissionDto: CreateSubmissionDto = {
    quizId: 'quiz1',
    sessionId: 'session1',
    metadata: { browser: 'Chrome', device: 'Desktop' },
  };

  const mockUpdateSubmissionDto: UpdateSubmissionDto = {
    status: SubmissionStatus.COMPLETED,
    completedAt: new Date(),
    metadata: { updated: true },
  };

  beforeEach(async () => {
    const mockSubmissionsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByQuizId: jest.fn(),
      findBySessionId: jest.fn(),
      getQuizAnalytics: jest.fn(),
    };

    const mockShopifyAuthGuardInstance = {
      canActivate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        {
          provide: SubmissionsService,
          useValue: mockSubmissionsService,
        },
      ],
    })
      .overrideGuard(ShopifyAuthGuard)
      .useValue(mockShopifyAuthGuardInstance)
      .compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
    service = module.get<SubmissionsService>(SubmissionsService);
    mockShopifyAuthGuard = module.get(ShopifyAuthGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new submission', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockSubmission);

      const result = await controller.create(mockCreateSubmissionDto, 'shop1');

      expect(service.create).toHaveBeenCalledWith(mockCreateSubmissionDto, 'shop1');
      expect(result).toEqual(mockSubmission);
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(controller.create(mockCreateSubmissionDto, 'shop1')).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    it('should return all submissions for a shop', async () => {
      const mockSubmissions = [mockSubmission];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockSubmissions);

      const result = await controller.findAll('shop1');

      expect(service.findAll).toHaveBeenCalledWith('shop1');
      expect(result).toEqual(mockSubmissions);
    });

    it('should return empty array when no submissions exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll('shop1');

      expect(result).toEqual([]);
    });
  });

  describe('find', () => {
    it('should return filtered submissions for a shop', async () => {
      const mockSubmissions = [mockSubmission];
      jest.spyOn(service, 'find').mockResolvedValue(mockSubmissions);

      const result = await controller.find('shop1', { quizId: 'quiz1' });

      expect(service.find).toHaveBeenCalledWith('shop1', { quizId: 'quiz1' });
      expect(result).toEqual(mockSubmissions);
    });

    it('should return empty array when no filtered submissions exist', async () => {
      jest.spyOn(service, 'find').mockResolvedValue([]);

      const result = await controller.find('shop1', { status: SubmissionStatus.COMPLETED });

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single submission by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSubmission);

      const result = await controller.findOne('sub1', 'shop1');

      expect(service.findOne).toHaveBeenCalledWith('sub1', 'shop1');
      expect(result).toEqual(mockSubmission);
    });

    it('should throw error when submission not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne('nonexistent', 'shop1')).rejects.toThrow('Submission not found');
    });
  });

  describe('update', () => {
    it('should update an existing submission', async () => {
      const updatedSubmission = { ...mockSubmission, ...mockUpdateSubmissionDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedSubmission);

      const result = await controller.update('sub1', mockUpdateSubmissionDto, 'shop1');

      expect(service.update).toHaveBeenCalledWith('sub1', mockUpdateSubmissionDto, 'shop1');
      expect(result).toEqual(updatedSubmission);
    });

    it('should handle update errors gracefully', async () => {
      const error = new Error('Update failed');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      await expect(controller.update('sub1', mockUpdateSubmissionDto, 'shop1')).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('should remove a submission', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(true);

      const result = await controller.remove('sub1', 'shop1');

      expect(service.remove).toHaveBeenCalledWith('sub1', 'shop1');
      expect(result).toEqual({ message: 'Submission deleted successfully' });
    });

    it('should handle submission not found', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(false);

      await expect(controller.remove('nonexistent', 'shop1')).rejects.toThrow('Submission not found');
    });

    it('should handle removal errors gracefully', async () => {
      const error = new Error('Removal failed');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      await expect(controller.remove('sub1', 'shop1')).rejects.toThrow('Removal failed');
    });
  });

  describe('findByQuizId', () => {
    it('should return submissions for a specific quiz', async () => {
      const mockSubmissions = [mockSubmission];
      jest.spyOn(service, 'findByQuizId').mockResolvedValue(mockSubmissions);

      const result = await controller.findByQuizId('quiz1', 'shop1');

      expect(service.findByQuizId).toHaveBeenCalledWith('quiz1', 'shop1');
      expect(result).toEqual(mockSubmissions);
    });

    it('should return empty array when quiz has no submissions', async () => {
      jest.spyOn(service, 'findByQuizId').mockResolvedValue([]);

      const result = await controller.findByQuizId('quiz1', 'shop1');

      expect(result).toEqual([]);
    });
  });

  describe('findBySessionId', () => {
    it('should return submissions for a specific session', async () => {
      const mockSubmissions = [mockSubmission];
      jest.spyOn(service, 'findBySessionId').mockResolvedValue(mockSubmissions);

      const result = await controller.findBySessionId('session1', 'shop1');

      expect(service.findBySessionId).toHaveBeenCalledWith('session1', 'shop1');
      expect(result).toEqual(mockSubmissions);
    });

    it('should return empty array when session has no submissions', async () => {
      jest.spyOn(service, 'findBySessionId').mockResolvedValue([]);

      const result = await controller.findBySessionId('session1', 'shop1');

      expect(result).toEqual([]);
    });
  });

  describe('getQuizAnalytics', () => {
    it('should return analytics for a specific quiz', async () => {
      const mockAnalytics = {
        quizId: 'quiz1',
        totalSubmissions: 10,
        completedSubmissions: 8,
        completionRate: 0.8,
        averageTimeSpent: 150,
        submissionsByStatus: {
          IN_PROGRESS: 1,
          COMPLETED: 8,
          ABANDONED: 1,
        },
      };
      jest.spyOn(service, 'getQuizAnalytics').mockResolvedValue(mockAnalytics);

      const result = await controller.getQuizAnalytics('quiz1', 'shop1');

      expect(service.getQuizAnalytics).toHaveBeenCalledWith('quiz1', 'shop1');
      expect(result).toEqual(mockAnalytics);
    });

    it('should handle analytics errors gracefully', async () => {
      const error = new Error('Analytics failed');
      jest.spyOn(service, 'getQuizAnalytics').mockRejectedValue(error);

      await expect(controller.getQuizAnalytics('quiz1', 'shop1')).rejects.toThrow('Analytics failed');
    });
  });
});
