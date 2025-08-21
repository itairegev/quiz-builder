import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export enum SubmissionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export class SubmissionQueryDto {
  @IsOptional()
  @IsString()
  quizId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
