import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shopify-quiz-builder/database';
import { MonitoringService } from '@shopify-quiz-builder/common';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: any;
  lastChecked: Date;
  responseTime?: number;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test basic database connectivity
      await this.prismaService.$queryRaw`SELECT 1`;
      
      // Test database performance
      const responseTime = Date.now() - startTime;
      
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      let message = 'Database connection is healthy';
      
      if (responseTime > 1000) {
        status = 'degraded';
        message = `Database response is slow (${responseTime}ms)`;
      } else if (responseTime > 500) {
        status = 'degraded';
        message = `Database response is slightly slow (${responseTime}ms)`;
      }

      this.monitoringService.updateHealthCheck('database', status, message, {
        responseTime,
        timestamp: new Date(),
      });

      return {
        status,
        message,
        responseTime,
        lastChecked: new Date(),
        details: {
          responseTime,
          connectionPool: await this.getDatabasePoolStatus(),
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = `Database connection failed: ${error.message}`;
      
      this.logger.error('Database health check failed', error.stack);
      this.monitoringService.updateHealthCheck('database', 'unhealthy', errorMessage, {
        error: error.message,
        responseTime,
        timestamp: new Date(),
      });

      return {
        status: 'unhealthy',
        message: errorMessage,
        responseTime,
        lastChecked: new Date(),
        details: {
          error: error.message,
          responseTime,
        },
      };
    }
  }

  async checkMemoryUsage(): Promise<HealthCheckResult> {
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      // Record memory metrics
      this.monitoringService.recordMemoryUsage(memoryUsage);

      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      let message = `Memory usage is normal (${heapUsedMB}MB / ${heapTotalMB}MB)`;

      if (heapUsagePercent > 90) {
        status = 'unhealthy';
        message = `Critical memory usage: ${heapUsagePercent.toFixed(1)}% (${heapUsedMB}MB / ${heapTotalMB}MB)`;
      } else if (heapUsagePercent > 75) {
        status = 'degraded';
        message = `High memory usage: ${heapUsagePercent.toFixed(1)}% (${heapUsedMB}MB / ${heapTotalMB}MB)`;
      }

      this.monitoringService.updateHealthCheck('memory', status, message, {
        heapUsedMB,
        heapTotalMB,
        heapUsagePercent,
        memoryUsage,
      });

      return {
        status,
        message,
        lastChecked: new Date(),
        details: {
          heapUsedMB,
          heapTotalMB,
          heapUsagePercent: Math.round(heapUsagePercent * 100) / 100,
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
        },
      };
    } catch (error) {
      const errorMessage = `Memory check failed: ${error.message}`;
      this.logger.error('Memory health check failed', error.stack);
      
      this.monitoringService.updateHealthCheck('memory', 'unhealthy', errorMessage, {
        error: error.message,
      });

      return {
        status: 'unhealthy',
        message: errorMessage,
        lastChecked: new Date(),
        details: {
          error: error.message,
        },
      };
    }
  }

  async checkExternalServices(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check if we can reach external services (simulated for now)
      // In a real implementation, you would check Shopify API, payment providers, etc.
      
      const services = [
        { name: 'shopify_api', url: 'https://shopify.dev' },
        // Add more external services as needed
      ];

      const results = await Promise.allSettled(
        services.map(service => this.pingService(service.name, service.url))
      );

      const failedServices = results.filter((result, index) => 
        result.status === 'rejected'
      ).map((_, index) => services[index].name);

      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      let message = 'All external services are accessible';

      if (failedServices.length > 0) {
        if (failedServices.length === services.length) {
          status = 'unhealthy';
          message = `All external services are unreachable: ${failedServices.join(', ')}`;
        } else {
          status = 'degraded';
          message = `Some external services are unreachable: ${failedServices.join(', ')}`;
        }
      }

      this.monitoringService.updateHealthCheck('external_services', status, message, {
        responseTime,
        failedServices,
        totalServices: services.length,
      });

      return {
        status,
        message,
        responseTime,
        lastChecked: new Date(),
        details: {
          responseTime,
          failedServices,
          totalServices: services.length,
          checkedServices: services.map(s => s.name),
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = `External services check failed: ${error.message}`;
      
      this.logger.error('External services health check failed', error.stack);
      this.monitoringService.updateHealthCheck('external_services', 'unhealthy', errorMessage, {
        error: error.message,
        responseTime,
      });

      return {
        status: 'unhealthy',
        message: errorMessage,
        responseTime,
        lastChecked: new Date(),
        details: {
          error: error.message,
          responseTime,
        },
      };
    }
  }

  async checkSystemHealth(): Promise<{
    overall: HealthCheckResult;
    checks: Record<string, HealthCheckResult>;
  }> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemoryUsage(),
      this.checkExternalServices(),
    ]);

    const healthResults: Record<string, HealthCheckResult> = {
      database: checks[0].status === 'fulfilled' ? checks[0].value : {
        status: 'unhealthy',
        message: 'Database check failed',
        lastChecked: new Date(),
      },
      memory: checks[1].status === 'fulfilled' ? checks[1].value : {
        status: 'unhealthy',
        message: 'Memory check failed',
        lastChecked: new Date(),
      },
      external_services: checks[2].status === 'fulfilled' ? checks[2].value : {
        status: 'unhealthy',
        message: 'External services check failed',
        lastChecked: new Date(),
      },
    };

    // Determine overall health status
    const statuses = Object.values(healthResults).map(result => result.status);
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (statuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    const overallResult: HealthCheckResult = {
      status: overallStatus,
      message: this.getOverallMessage(overallStatus, healthResults),
      lastChecked: new Date(),
      details: {
        checksPerformed: Object.keys(healthResults).length,
        healthyChecks: statuses.filter(s => s === 'healthy').length,
        degradedChecks: statuses.filter(s => s === 'degraded').length,
        unhealthyChecks: statuses.filter(s => s === 'unhealthy').length,
      },
    };

    return {
      overall: overallResult,
      checks: healthResults,
    };
  }

  private async pingService(serviceName: string, url: string): Promise<void> {
    // Simplified ping - in real implementation, you would make actual HTTP requests
    // For now, we'll simulate a successful ping
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve();
        } else {
          reject(new Error(`Service ${serviceName} is unreachable`));
        }
      }, 100);
    });
  }

  private async getDatabasePoolStatus(): Promise<any> {
    try {
      // Get database connection pool status
      // This is a simplified version - Prisma doesn't expose detailed pool stats
      return {
        status: 'active',
        // In a real implementation, you might get actual pool statistics
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  private getOverallMessage(
    status: 'healthy' | 'unhealthy' | 'degraded',
    checks: Record<string, HealthCheckResult>
  ): string {
    const totalChecks = Object.keys(checks).length;
    const healthyChecks = Object.values(checks).filter(c => c.status === 'healthy').length;
    const degradedChecks = Object.values(checks).filter(c => c.status === 'degraded').length;
    const unhealthyChecks = Object.values(checks).filter(c => c.status === 'unhealthy').length;

    if (status === 'healthy') {
      return `All ${totalChecks} health checks are passing`;
    } else if (status === 'degraded') {
      return `${healthyChecks}/${totalChecks} checks healthy, ${degradedChecks} degraded, ${unhealthyChecks} unhealthy`;
    } else {
      return `System unhealthy: ${unhealthyChecks}/${totalChecks} checks failing`;
    }
  }
}
