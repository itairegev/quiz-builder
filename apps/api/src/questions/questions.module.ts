import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { DatabaseModule } from '../database/database.module';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [DatabaseModule, ShopifyModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
