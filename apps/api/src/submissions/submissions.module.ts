import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { DatabaseModule } from '../database/database.module';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [DatabaseModule, ShopifyModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
