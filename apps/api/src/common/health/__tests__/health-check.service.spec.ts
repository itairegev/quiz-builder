import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '../health-check.service';
import { PrismaService } from '@shopify-quiz-builder/database';
import { MonitoringService } from '@shopify-quiz-builder/common';

// Mock the PrismaService
const mockPrismaService = {
  $queryRaw: jest.fn(),
};

// Mock the MonitoringService
const mockMonitoringService = {
  updateHealthCheck: jest.fn(),
  recordMemoryUsage: jest.fn(),
};

describe('HealthCheckService', () => {
  let service: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MonitoringService,
          useValue: mockMonitoringService,
        },
      ],
    }).compile();

    service = module.get<HealthCheckService>(HealthCheckService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDatabase', () => {
    it('should return healthy status when database is accessible', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '1': 1 }]);

      const result = await service.checkDatabase();

      expect(result.status).toBe('healthy');
      expect(result.message).toBe('Database connection is healthy');
      expect(result.responseTime).toBeDefined();
      expect(result.lastChecked).toBeInstanceOf(Date);
      expect(mockMonitoringService.updateHealthCheck).toHaveBeenCalledWith(
        'database',
        'healthy',
        'Database connection is healthy',
        expect.any(Object)
      );
    });

    it('should return degraded status when database is slow', async () => {
      // Mock a slow database response
      mockPrismaService.$queryRaw.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([{ '1': 1 }]), 600))
      );

      const result = await service.checkDatabase();

      expect(result.status).toBe('degraded');
      expect(result.message).toContain('Database response is slightly slow');
      expect(result.responseTime).toBeGreaterThan(500);
    });

    it('should return unhealthy status when database is unreachable', async () => {
      const error = new Error('Connection refused');
      mockPrismaService.$queryRaw.mockRejectedValue(error);

      const result = await service.checkDatabase();

      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('Database connection failed');
      expect(result.details.error).toBe('Connection refused');
      expect(mockMonitoringService.updateHealthCheck).toHaveBeenCalledWith(
        'database',
        'unhealthy',
        expect.stringContaining('Database connection failed'),
        expect.any(Object)
      );
    });
  });

  describe('checkMemoryUsage', () => {
    it('should return healthy status with normal memory usage', async () => {
      // Mock process.memoryUsage to return normal values
      const originalMemoryUsage = process.memoryUsage;
      const mockMemoryUsage = jest.fn().mockReturnValue({
        heapUsed: 50 * 1024 * 1024, // 50MB
        heapTotal: 100 * 1024 * 1024, // 100MB
        rss: 120 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      });
      Object.defineProperty(process, 'memoryUsage', {
        value: mockMemoryUsage,
        writable: true,
        configurable: true,
      });

      const result = await service.checkMemoryUsage();

      expect(result.status).toBe('healthy');
      expect(result.message).toContain('Memory usage is normal');
      expect(result.details.heapUsedMB).toBe(50);
      expect(result.details.heapTotalMB).toBe(100);
      expect(result.details.heapUsagePercent).toBe(50);
      expect(mockMonitoringService.recordMemoryUsage).toHaveBeenCalled();

      // Restore original function
      Object.defineProperty(process, 'memoryUsage', {
        value: originalMemoryUsage,
        writable: true,
        configurable: true,
      });
    });

    it('should return degraded status with high memory usage', async () => {
      const originalMemoryUsage = process.memoryUsage;
      const mockMemoryUsage = jest.fn().mockReturnValue({
        heapUsed: 80 * 1024 * 1024, // 80MB
        heapTotal: 100 * 1024 * 1024, // 100MB (80% usage)
        rss: 120 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      });
      Object.defineProperty(process, 'memoryUsage', {
        value: mockMemoryUsage,
        writable: true,
        configurable: true,
      });

      const result = await service.checkMemoryUsage();

      expect(result.status).toBe('degraded');
      expect(result.message).toContain('High memory usage');
      expect(mockMonitoringService.updateHealthCheck).toHaveBeenCalledWith(
        'memory',
        'degraded',
        expect.stringContaining('High memory usage'),
        expect.any(Object)
      );

      Object.defineProperty(process, 'memoryUsage', {
        value: originalMemoryUsage,
        writable: true,
        configurable: true,
      });
    });

    it('should return unhealthy status with critical memory usage', async () => {
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 95 * 1024 * 1024, // 95MB
        heapTotal: 100 * 1024 * 1024, // 100MB (95% usage)
        rss: 120 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      });

      const result = await service.checkMemoryUsage();

      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('Critical memory usage');

      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('checkExternalServices', () => {
    it('should return healthy status when all services are accessible', async () => {
      // Mock successful ping responses
      const originalMathRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // Always return > 0.05 for success

      const result = await service.checkExternalServices();

      expect(result.status).toBe('healthy');
      expect(result.message).toBe('All external services are accessible');
      expect(result.responseTime).toBeDefined();
      expect(result.details.failedServices).toEqual([]);

      Math.random = originalMathRandom;
    });

    it('should return degraded status when some services fail', async () => {
      // Mock mixed responses (some success, some failure)
      const originalMathRandom = Math.random;
      let callCount = 0;
      Math.random = jest.fn().mockImplementation(() => {
        // First call succeeds (0.5 > 0.05), second fails (0.01 < 0.05)
        return callCount++ === 0 ? 0.5 : 0.01;
      });

      const result = await service.checkExternalServices();

      expect(result.status).toBe('degraded');
      expect(result.message).toContain('Some external services are unreachable');

      Math.random = originalMathRandom;
    });
  });

  describe('checkSystemHealth', () => {
    it('should return comprehensive system health status', async () => {
      // Mock all checks to return healthy
      mockPrismaService.$queryRaw.mockResolvedValue([{ '1': 1 }]);
      
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 50 * 1024 * 1024,
        heapTotal: 100 * 1024 * 1024,
        rss: 120 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      });

      const originalMathRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5);

      const result = await service.checkSystemHealth();

      expect(result.overall.status).toBe('healthy');
      expect(result.overall.message).toContain('All 3 health checks are passing');
      expect(result.checks).toHaveProperty('database');
      expect(result.checks).toHaveProperty('memory');
      expect(result.checks).toHaveProperty('external_services');
      expect(result.checks.database.status).toBe('healthy');
      expect(result.checks.memory.status).toBe('healthy');
      expect(result.checks.external_services.status).toBe('healthy');

      // Restore mocks
      process.memoryUsage = originalMemoryUsage;
      Math.random = originalMathRandom;
    });

    it('should return unhealthy overall status when any check fails', async () => {
      // Mock database to fail
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Database error'));
      
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 50 * 1024 * 1024,
        heapTotal: 100 * 1024 * 1024,
        rss: 120 * 1024 * 1024,
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      });

      const result = await service.checkSystemHealth();

      expect(result.overall.status).toBe('unhealthy');
      expect(result.overall.message).toContain('System unhealthy');
      expect(result.checks.database.status).toBe('unhealthy');

      process.memoryUsage = originalMemoryUsage;
    });
  });
});
