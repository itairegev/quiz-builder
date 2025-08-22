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

  // Business metrics
  recordQuizMetrics(quizId: string, event: string, count: number = 1, additionalData?: Record<string, any>) {
    this.recordMetric('quiz_events', count, 'count', { 
      quiz_id: quizId, 
      event,
      ...additionalData 
    });
  }

  recordQuizCompletion(quizId: string, shopId: string, completionTime: number, userId?: string) {
    this.recordMetric('quiz_completion', 1, 'count', { 
      quiz_id: quizId, 
      shop_id: shopId,
      user_id: userId,
      completion_time: completionTime.toString()
    });
    
    this.recordMetric('quiz_completion_time', completionTime, 'ms', { 
      quiz_id: quizId, 
      shop_id: shopId 
    });
  }

  recordQuestionInteraction(questionId: string, quizId: string, interactionType: string, responseTime: number) {
    this.recordMetric('question_interaction', 1, 'count', {
      question_id: questionId,
      quiz_id: quizId,
      interaction_type: interactionType,
      response_time: responseTime.toString()
    });
  }

  recordConversionEvent(quizId: string, shopId: string, conversionType: 'product_click' | 'add_to_cart' | 'purchase', value?: number) {
    this.recordMetric('conversion_event', 1, 'count', {
      quiz_id: quizId,
      shop_id: shopId,
      conversion_type: conversionType,
      value: (value || 0).toString()
    });

    if (value) {
      this.recordMetric('conversion_value', value, 'currency', {
        quiz_id: quizId,
        shop_id: shopId,
        conversion_type: conversionType
      });
    }
  }

  recordShopifyMetrics(shopId: string, event: string, count: number = 1, additionalData?: Record<string, any>) {
    this.recordMetric('shopify_events', count, 'count', { 
      shop_id: shopId, 
      event,
      ...additionalData 
    });
  }

  recordApiCallMetrics(endpoint: string, method: string, responseTime: number, statusCode: number, shopId?: string) {
    this.recordMetric('api_call', 1, 'count', {
      endpoint,
      method,
      status_code: statusCode.toString(),
      shop_id: shopId
    });

    this.recordMetric('api_response_time', responseTime, 'ms', {
      endpoint,
      method,
      shop_id: shopId
    });

    // Track error rates
    if (statusCode >= 400) {
      this.recordMetric('api_error', 1, 'count', {
        endpoint,
        method,
        status_code: statusCode.toString(),
        shop_id: shopId
      });
    }
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

  // Advanced analytics methods
  getAggregatedMetrics(name: string, timeWindowMinutes: number = 60): {
    count: number;
    sum: number;
    average: number;
    min: number;
    max: number;
    latest: number;
  } {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const metrics = this.getMetrics(name).filter(m => 
      m.timestamp && m.timestamp > cutoffTime
    );

    if (metrics.length === 0) {
      return { count: 0, sum: 0, average: 0, min: 0, max: 0, latest: 0 };
    }

    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      count: metrics.length,
      sum,
      average: sum / metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: metrics[metrics.length - 1].value
    };
  }

  // Get error rate for a specific endpoint
  getErrorRate(endpoint: string, timeWindowMinutes: number = 60): number {
    const totalRequests = this.getAggregatedMetrics(`api_call`, timeWindowMinutes);
    const errorRequests = this.getAggregatedMetrics(`api_error`, timeWindowMinutes);
    
    if (totalRequests.count === 0) return 0;
    return (errorRequests.count / totalRequests.count) * 100;
  }

  // Get conversion rate for a specific quiz
  getConversionRate(quizId: string, timeWindowMinutes: number = 60): number {
    const completions = this.getAggregatedMetrics(`quiz_completion`, timeWindowMinutes);
    const conversions = this.getAggregatedMetrics(`conversion_event`, timeWindowMinutes);
    
    if (completions.count === 0) return 0;
    return (conversions.count / completions.count) * 100;
  }

  // Get performance insights
  getPerformanceInsights(timeWindowMinutes: number = 60): {
    averageResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    slowestEndpoints: Array<{ endpoint: string; averageTime: number }>;
    errorEndpoints: Array<{ endpoint: string; errorCount: number }>;
  } {
    const responseTime = this.getAggregatedMetrics('api_response_time', timeWindowMinutes);
    const totalRequests = this.getAggregatedMetrics('api_call', timeWindowMinutes);
    const totalErrors = this.getAggregatedMetrics('api_error', timeWindowMinutes);

    // Calculate requests per minute
    const requestsPerMinute = totalRequests.count / timeWindowMinutes;
    
    // Calculate error rate
    const errorRate = totalRequests.count > 0 ? (totalErrors.count / totalRequests.count) * 100 : 0;

    return {
      averageResponseTime: responseTime.average || 0,
      errorRate,
      requestsPerMinute,
      slowestEndpoints: this.getSlowEndpoints(timeWindowMinutes),
      errorEndpoints: this.getErrorEndpoints(timeWindowMinutes)
    };
  }

  private getSlowEndpoints(timeWindowMinutes: number): Array<{ endpoint: string; averageTime: number }> {
    const endpointTimes = new Map<string, number[]>();
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    const responseTimeMetrics = this.getMetrics('api_response_time').filter(m => 
      m.timestamp && m.timestamp > cutoffTime
    );

    responseTimeMetrics.forEach(metric => {
      if (metric.tags?.endpoint) {
        if (!endpointTimes.has(metric.tags.endpoint)) {
          endpointTimes.set(metric.tags.endpoint, []);
        }
        endpointTimes.get(metric.tags.endpoint)!.push(metric.value);
      }
    });

    return Array.from(endpointTimes.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        averageTime: times.reduce((a, b) => a + b, 0) / times.length
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);
  }

  private getErrorEndpoints(timeWindowMinutes: number): Array<{ endpoint: string; errorCount: number }> {
    const endpointErrors = new Map<string, number>();
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    const errorMetrics = this.getMetrics('api_error').filter(m => 
      m.timestamp && m.timestamp > cutoffTime
    );

    errorMetrics.forEach(metric => {
      if (metric.tags?.endpoint) {
        const current = endpointErrors.get(metric.tags.endpoint) || 0;
        endpointErrors.set(metric.tags.endpoint, current + 1);
      }
    });

    return Array.from(endpointErrors.entries())
      .map(([endpoint, errorCount]) => ({ endpoint, errorCount }))
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 5);
  }

  // Alert system
  checkAlerts(): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> {
    const alerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> = [];
    const insights = this.getPerformanceInsights(15); // Check last 15 minutes

    // High error rate alert
    if (insights.errorRate > 10) {
      alerts.push({
        type: 'high_error_rate',
        message: `Error rate is ${insights.errorRate.toFixed(2)}% (threshold: 10%)`,
        severity: insights.errorRate > 25 ? 'high' : 'medium'
      });
    }

    // Slow response time alert
    if (insights.averageResponseTime > 2000) {
      alerts.push({
        type: 'slow_response_time',
        message: `Average response time is ${insights.averageResponseTime.toFixed(0)}ms (threshold: 2000ms)`,
        severity: insights.averageResponseTime > 5000 ? 'high' : 'medium'
      });
    }

    // Low request volume alert (might indicate service issues)
    if (insights.requestsPerMinute < 0.1) {
      alerts.push({
        type: 'low_request_volume',
        message: `Very low request volume: ${insights.requestsPerMinute.toFixed(2)} requests/minute`,
        severity: 'medium'
      });
    }

    // Health check alerts
    for (const [name, healthCheck] of this.healthChecks.entries()) {
      if (healthCheck.status === 'unhealthy') {
        alerts.push({
          type: 'health_check_failed',
          message: `Health check '${name}' is unhealthy: ${healthCheck.message}`,
          severity: 'high'
        });
      } else if (healthCheck.status === 'degraded') {
        alerts.push({
          type: 'health_check_degraded',
          message: `Health check '${name}' is degraded: ${healthCheck.message}`,
          severity: 'medium'
        });
      }
    }

    return alerts;
  }
}

