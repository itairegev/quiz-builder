import { PartialType } from '@nestjs/swagger';
import { QuizBuilderCreateDto } from './quiz-builder-create.dto';

export class QuizBuilderUpdateDto extends PartialType(QuizBuilderCreateDto) {}
