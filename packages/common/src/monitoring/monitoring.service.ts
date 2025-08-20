import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp?: Date;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: Record<string, HealthCheck>;
  timestamp: Date;
  uptime: number;
  version: string;
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: any;
  lastChecked: Date;
}

@Injectable()
export class MonitoringService {
  private metrics: Map<string, MetricData[]> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();
  private startTime: Date = new Date();

  constructor(private readonly logger: LoggerService) {
    this.initializeHealthChecks();
  }

  private initializeHealthChecks() {
    // Database health check
    this.healthChecks.set('database', {
      status: 'healthy',
      message: 'Database connection is healthy',
      lastChecked: new Date(),
    });

    // Redis health check
    this.healthChecks.set('redis', {
      status: 'healthy',
      message: 'Redis connection is healthy',
      lastChecked: new Date(),
    });

    // External services health checks
    this.healthChecks.set('shopify_api', {
      status: 'healthy',
      message: 'Shopify API is accessible',
      lastChecked: new Date(),
    });

    this.healthChecks.set('third_party_services', {
      status: 'healthy',
      message: 'Third-party services are accessible',
      lastChecked: new Date(),
    });
  }

  // Metric collection
  recordMetric(name: string, value: number, unit?: string, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      unit,
      tags,
      timestamp: new Date(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(metric);

    // Keep only last 1000 metrics per name to prevent memory issues
    const metrics = this.metrics.get(name)!;
    if (metrics.length > 1000) {
      this.metrics.set(name, metrics.slice(-1000));
    }

    this.logger.logPerformanceMetric(name, value, { tags });
  }

  // Performance metrics
  recordResponseTime(endpoint: string, responseTime: number) {
    this.recordMetric('response_time', responseTime, 'ms', { endpoint });
  }

  recordRequestCount(endpoint: string, method: string, statusCode: number) {
    this.recordMetric('request_count', 1, 'count', { endpoint, method, status_code: statusCode.toString() });
  }

  recordDatabaseQueryTime(query: string, executionTime: number) {
    this.recordMetric('database_query_time', executionTime, 'ms', { query: query.substring(0, 50) });
  }

  recordMemoryUsage(memoryUsage: NodeJS.MemoryUsage) {
    this.recordMetric('memory_heap_used', memoryUsage.heapUsed, 'bytes', { type: 'heap_used' });
    this.recordMetric('memory_heap_total', memoryUsage.heapTotal, 'bytes', { type: 'heap_total' });
    this.recordMetric('memory_external', memoryUsage.external, 'bytes', { type: 'external' });
    this.recordMetric('memory_rss', memoryUsage.rss, 'bytes', { type: 'rss' });
  }

  recordQuizMetrics(quizId: string, event: string, count: number = 1) {
    this.recordMetric('quiz_events', count, 'count', { quiz_id: quizId, event });
  }

  recordShopifyMetrics(shopId: string, event: string, count: number = 1) {
    this.recordMetric('shopify_events', count, 'count', { shop_id: shopId, event });
  }

  // Health check management
  updateHealthCheck(name: string, status: 'healthy' | 'unhealthy' | 'degraded', message?: string, details?: any) {
    const healthCheck: HealthCheck = {
      status,
      message,
      details,
      lastChecked: new Date(),
    };

    this.healthChecks.set(name, healthCheck);

    if (status === 'unhealthy') {
      this.logger.warn(`Health check failed: ${name}`, { healthCheck: name, message, details });
    }
  }

  getHealthCheck(name: string): HealthCheck | undefined {
    return this.healthChecks.get(name);
  }

  // Get overall health status
  getOverallHealth(): HealthCheckResult {
    const checks = Object.fromEntries(this.healthChecks);
    const statuses = Object.values(checks).map(check => check.status);
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (statuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  // Metric retrieval
  getMetrics(name: string, limit: number = 100): MetricData[] {
    const metrics = this.metrics.get(name);
    if (!metrics) return [];
    
    return metrics.slice(-limit);
  }

  getMetricSummary(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    latest: number;
  } | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    const count = values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / count;
    const latest = metrics[metrics.length - 1].value;

    return { count, min, max, avg, latest };
  }

  // Cleanup old metrics
  cleanupOldMetrics(maxAgeHours: number = 24) {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp! > cutoff);
      this.metrics.set(name, filtered);
    }
  }

  // Export metrics for external monitoring systems
  exportMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      const summary = this.getMetricSummary(name);
      if (summary) {
        result[name] = {
          ...summary,
          lastUpdated: metrics[metrics.length - 1]?.timestamp,
        };
      }
    }

    return result;
  }
}

