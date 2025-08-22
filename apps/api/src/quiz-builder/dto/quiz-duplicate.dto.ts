import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QuizDuplicateDto {
  @ApiPropertyOptional({
    description: 'Custom title for the duplicated quiz',
    example: 'My Skincare Quiz (Copy)',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}
