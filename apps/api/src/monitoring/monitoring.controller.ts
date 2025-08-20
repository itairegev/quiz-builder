import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiResponse({ status: 200, description: 'Metric data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Metric not found' })
  getMetricByName(name: string) {
    const metrics = this.monitoringService.getMetrics(name);
    const summary = this.monitoringService.getMetricSummary(name);
    
    return {
      name,
      metrics,
      summary,
    };
  }
}

