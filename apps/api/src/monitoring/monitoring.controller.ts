import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MonitoringService } from '@shopify-quiz-builder/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get comprehensive health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  getHealth() {
    return this.monitoringService.getOverallHealth();
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMetrics() {
    return this.monitoringService.exportMetrics();
  }

  @Get('metrics/:name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific metric data' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of metrics returned' })
  @ApiResponse({ status: 200, description: 'Metric data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Metric not found' })
  getMetricByName(@Param('name') name: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const metrics = this.monitoringService.getMetrics(name, limitNum);
    const summary = this.monitoringService.getMetricSummary(name);
    
    return {
      name,
      metrics,
      summary,
    };
  }

  @Get('analytics/aggregated')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get aggregated metrics for a time window' })
  @ApiQuery({ name: 'name', required: true, description: 'Metric name' })
  @ApiQuery({ name: 'timeWindow', required: false, description: 'Time window in minutes (default: 60)' })
  @ApiResponse({ status: 200, description: 'Aggregated metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAggregatedMetrics(
    @Query('name') name: string,
    @Query('timeWindow') timeWindow?: string
  ) {
    const timeWindowMinutes = timeWindow ? parseInt(timeWindow, 10) : 60;
    return {
      name,
      timeWindowMinutes,
      data: this.monitoringService.getAggregatedMetrics(name, timeWindowMinutes)
    };
  }

  @Get('analytics/performance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get performance insights' })
  @ApiQuery({ name: 'timeWindow', required: false, description: 'Time window in minutes (default: 60)' })
  @ApiResponse({ status: 200, description: 'Performance insights retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getPerformanceInsights(@Query('timeWindow') timeWindow?: string) {
    const timeWindowMinutes = timeWindow ? parseInt(timeWindow, 10) : 60;
    return {
      timeWindowMinutes,
      data: this.monitoringService.getPerformanceInsights(timeWindowMinutes)
    };
  }

  @Get('analytics/error-rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get error rate for specific endpoint' })
  @ApiQuery({ name: 'endpoint', required: true, description: 'Endpoint path' })
  @ApiQuery({ name: 'timeWindow', required: false, description: 'Time window in minutes (default: 60)' })
  @ApiResponse({ status: 200, description: 'Error rate retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getErrorRate(
    @Query('endpoint') endpoint: string,
    @Query('timeWindow') timeWindow?: string
  ) {
    const timeWindowMinutes = timeWindow ? parseInt(timeWindow, 10) : 60;
    return {
      endpoint,
      errorRate: this.monitoringService.getErrorRate(endpoint, timeWindowMinutes),
      timeWindowMinutes
    };
  }

  @Get('analytics/conversion-rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get conversion rate for specific quiz' })
  @ApiQuery({ name: 'quizId', required: true, description: 'Quiz ID' })
  @ApiQuery({ name: 'timeWindow', required: false, description: 'Time window in minutes (default: 60)' })
  @ApiResponse({ status: 200, description: 'Conversion rate retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getConversionRate(
    @Query('quizId') quizId: string,
    @Query('timeWindow') timeWindow?: string
  ) {
    const timeWindowMinutes = timeWindow ? parseInt(timeWindow, 10) : 60;
    return {
      quizId,
      conversionRate: this.monitoringService.getConversionRate(quizId, timeWindowMinutes),
      timeWindowMinutes
    };
  }

  @Get('alerts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current system alerts' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAlerts() {
    return {
      alerts: this.monitoringService.checkAlerts(),
      timestamp: new Date().toISOString()
    };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comprehensive monitoring dashboard data' })
  @ApiQuery({ name: 'timeWindow', required: false, description: 'Time window in minutes (default: 60)' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDashboard(@Query('timeWindow') timeWindow?: string) {
    const timeWindowMinutes = timeWindow ? parseInt(timeWindow, 10) : 60;
    
    return {
      health: this.monitoringService.getOverallHealth(),
      performance: this.monitoringService.getPerformanceInsights(timeWindowMinutes),
      alerts: this.monitoringService.checkAlerts(),
      systemMetrics: {
        memory: this.monitoringService.getMetricSummary('memory_heap_used'),
        responseTime: this.monitoringService.getMetricSummary('response_time'),
        requestCount: this.monitoringService.getMetricSummary('request_count'),
        errorCount: this.monitoringService.getMetricSummary('api_error')
      },
      businessMetrics: {
        quizCompletions: this.monitoringService.getMetricSummary('quiz_completion'),
        conversions: this.monitoringService.getMetricSummary('conversion_event'),
        questionInteractions: this.monitoringService.getMetricSummary('question_interaction')
      },
      timeWindow: timeWindowMinutes,
      timestamp: new Date().toISOString()
    };
  }
}

