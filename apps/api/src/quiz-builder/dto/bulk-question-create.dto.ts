import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Import the question DTO from the create DTO
class QuestionBuilderDto {
  order: number;
  type: string;
  text: string;
  description?: string;
  required: boolean;
  options?: any[];
  settings?: any;
  validation?: any;
}

export class BulkQuestionCreateDto {
  @ApiProperty({
    description: 'Array of questions to create',
    type: [QuestionBuilderDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionBuilderDto)
  questions: QuestionBuilderDto[];
}
