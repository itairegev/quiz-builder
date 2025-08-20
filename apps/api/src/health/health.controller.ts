import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Health check passed' })
  @ApiResponse({ status: 503, description: 'Health check failed' })
  async check() {
    return this.healthService.checkHealth();
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint' })
  @ApiResponse({ status: 200, description: 'Pong response' })
  ping() {
    return this.healthService.ping();
  }

  @Get('database')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unhealthy' })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }

  @Get('memory')
  @ApiOperation({ summary: 'Memory usage check' })
  @ApiResponse({ status: 200, description: 'Memory usage information' })
  async checkMemory() {
    return this.healthService.checkMemory();
  }

  @Get('disk')
  @ApiOperation({ summary: 'Disk usage check' })
  @ApiResponse({ status: 200, description: 'Disk usage information' })
  async checkDisk() {
    return this.healthService.checkDisk();
  }
}
