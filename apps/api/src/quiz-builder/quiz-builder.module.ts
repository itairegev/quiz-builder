import { Module } from '@nestjs/common';
import { QuizBuilderService } from './quiz-builder.service';
import { QuizTemplateService } from './quiz-template.service';
import { QuizBuilderController } from './quiz-builder.controller';
import { QuizPreviewController } from './quiz-preview.controller';
import { QuizPreviewService } from './quiz-preview.service';
import { DatabaseModule } from '../database/database.module';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [DatabaseModule, ShopifyModule],
  controllers: [QuizBuilderController, QuizPreviewController],
  providers: [QuizBuilderService, QuizTemplateService, QuizPreviewService],
  exports: [QuizBuilderService, QuizTemplateService, QuizPreviewService],
})
export class QuizBuilderModule {}
