import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  TEXT = 'TEXT',
  RATING = 'RATING',
  IMAGE_CHOICE = 'IMAGE_CHOICE',
  BOOLEAN = 'BOOLEAN',
}

export class QuestionQueryDto {
  @IsOptional()
  @IsString()
  quizId?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}
