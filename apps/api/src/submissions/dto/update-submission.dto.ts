import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './create-submission.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { SubmissionStatus } from './submission-query.dto';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @IsOptional()
  completedAt?: Date;
}
