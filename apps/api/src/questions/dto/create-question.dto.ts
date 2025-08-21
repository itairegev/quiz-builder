import { IsString, IsEnum, IsInt, IsBoolean, IsOptional, IsObject, Min, Max } from 'class-validator';
import { QuestionType } from './question-query.dto';

export class CreateQuestionDto {
  @IsString()
  quizId: string;

  @IsInt()
  @Min(1)
  order: number;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  required: boolean = false;

  @IsOptional()
  @IsObject()
  options?: any;

  @IsOptional()
  @IsObject()
  settings?: any;
}
