import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  quizId: string;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
