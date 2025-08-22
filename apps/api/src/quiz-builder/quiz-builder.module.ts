import { Module } from '@nestjs/common';
import { QuizBuilderService } from './quiz-builder.service';
import { QuizTemplateService } from './quiz-template.service';
import { QuizBuilderController } from './quiz-builder.controller';
import { DatabaseModule } from '../database/database.module';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [DatabaseModule, ShopifyModule],
  controllers: [QuizBuilderController],
  providers: [QuizBuilderService, QuizTemplateService],
  exports: [QuizBuilderService, QuizTemplateService],
})
export class QuizBuilderModule {}
