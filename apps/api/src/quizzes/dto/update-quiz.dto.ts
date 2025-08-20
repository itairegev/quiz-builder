import { PartialType } from '@nestjs/swagger';
import { CreateQuizDto } from './create-quiz.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  @ApiPropertyOptional({
    description: 'Quiz status',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'],
    example: 'PUBLISHED',
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
}
