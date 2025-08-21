import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard';
import { CurrentShopId } from '../auth/decorators/current-shop.decorator';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto, ExportAnalyticsDto } from './dto';

@Controller('api/v1/analytics')
@UseGuards(ShopifyAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('quiz/:quizId')
  async getQuizAnalytics(
    @Param('quizId') quizId: string,
    @CurrentShopId() shopId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      return await this.analyticsService.getQuizAnalytics(quizId, shopId, query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch quiz analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('shop')
  async getShopAnalytics(
    @CurrentShopId() shopId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      return await this.analyticsService.getShopAnalytics(shopId, query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch shop analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('customer/:customerId')
  async getCustomerAnalytics(
    @Param('customerId') customerId: string,
    @CurrentShopId() shopId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      const analytics = await this.analyticsService.getCustomerAnalytics(customerId, shopId, query);
      if (!analytics) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return analytics;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to fetch customer analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('revenue')
  async getRevenueAnalytics(
    @CurrentShopId() shopId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      return await this.analyticsService.getRevenueAnalytics(shopId, query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch revenue analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('conversion')
  async getConversionAnalytics(
    @CurrentShopId() shopId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      return await this.analyticsService.getConversionAnalytics(shopId, query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch conversion analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('trends')
  async getTrendAnalytics(
    @CurrentShopId() shopId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    try {
      return await this.analyticsService.getTrendAnalytics(shopId, query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch trend analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('export')
  async exportAnalytics(
    @Body() exportRequest: ExportAnalyticsDto,
    @CurrentShopId() shopId: string,
  ) {
    try {
      return await this.analyticsService.exportAnalytics(shopId, exportRequest);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to export analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
