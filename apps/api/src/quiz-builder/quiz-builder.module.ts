import { Module } from '@nestjs/common';
import { QuizBuilderService } from './quiz-builder.service';
import { QuizTemplateService } from './quiz-template.service';
import { QuizBuilderController } from './quiz-builder.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [QuizBuilderController],
  providers: [QuizBuilderService, QuizTemplateService],
  exports: [QuizBuilderService, QuizTemplateService],
})
export class QuizBuilderModule {}
