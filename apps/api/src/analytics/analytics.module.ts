import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DatabaseModule } from '../database/database.module';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [DatabaseModule, ShopifyModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
