import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@shopify-quiz-builder/database';
import * as os from 'os';
import * as fs from 'fs';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'shopify-quiz-builder-api',
    };
  }

  async checkHealth() {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();
    
    try {
      const checks = await Promise.allSettled([
        this.checkDatabase(),
        this.checkMemory(),
        this.checkDisk(),
      ]);

      const results = {
        status: 'healthy',
        timestamp,
        uptime: Math.floor(uptime),
        service: 'shopify-quiz-builder-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
          database: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'unhealthy', error: checks[0].reason },
          memory: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'unhealthy', error: checks[1].reason },
          disk: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'unhealthy', error: checks[2].reason },
        },
      };

      // Determine overall status
      const hasUnhealthyCheck = Object.values(results.checks).some(
        (check: any) => check.status === 'unhealthy'
      );

      if (hasUnhealthyCheck) {
        results.status = 'unhealthy';
        throw new HttpException(results, HttpStatus.SERVICE_UNAVAILABLE);
      }

      return results;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          status: 'unhealthy',
          timestamp,
          service: 'shopify-quiz-builder-api',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async checkDatabase() {
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        connection: 'active',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connection: 'failed',
      };
    }
  }

  async checkMemory() {
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      // Convert bytes to MB
      const formatMB = (bytes: number) => Math.round(bytes / 1024 / 1024);

      const memoryInfo = {
        status: 'healthy',
        process: {
          rss: formatMB(memoryUsage.rss),
          heapUsed: formatMB(memoryUsage.heapUsed),
          heapTotal: formatMB(memoryUsage.heapTotal),
          external: formatMB(memoryUsage.external),
        },
        system: {
          total: formatMB(totalMemory),
          free: formatMB(freeMemory),
          used: formatMB(usedMemory),
          usagePercent: Math.round((usedMemory / totalMemory) * 100),
        },
        unit: 'MB',
      };

      // Mark as unhealthy if system memory usage is above 90%
      if (memoryInfo.system.usagePercent > 90) {
        memoryInfo.status = 'unhealthy';
      }

      return memoryInfo;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  async checkDisk() {
    try {
      const stats = fs.statSync('/');
      const diskInfo = {
        status: 'healthy',
        path: '/',
        accessible: true,
      };

      // Additional disk space check could be added here
      // For now, just verify the root path is accessible

      return diskInfo;
    } catch (error) {
      return {
        status: 'unhealthy',
        path: '/',
        accessible: false,
        error: error.message,
      };
    }
  }
}
