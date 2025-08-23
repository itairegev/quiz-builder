import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Response } from 'express';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get application status' })
  @ApiResponse({ status: 200, description: 'Application is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint for Swagger' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  getTest(): { message: string; timestamp: string } {
    return {
      message: 'Test endpoint working!',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api-json')
  @ApiOperation({ summary: 'Get OpenAPI specification' })
  @ApiResponse({ status: 200, description: 'OpenAPI spec retrieved' })
  getApiSpec(@Res() res: Response) {
    // This will be handled by SwaggerModule
    res.redirect('/api/docs-json');
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application health status' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Get application information' })
  @ApiResponse({ status: 200, description: 'Application information' })
  getInfo() {
    return {
      name: 'Shopify Quiz Builder API',
      description: 'API for the Shopify Quiz Builder application',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      documentation: '/api/docs',
      repository: 'https://github.com/itairegev/shopify-quiz-builder',
    };
  }
}
