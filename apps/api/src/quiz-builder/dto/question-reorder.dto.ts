import { IsArray, ValidateNested, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class QuestionOrderDto {
  @ApiProperty({
    description: 'Question ID',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  questionId: string;

  @ApiProperty({
    description: 'New order position',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;
}

export class QuestionReorderDto {
  @ApiProperty({
    description: 'Array of question orders',
    type: [QuestionOrderDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOrderDto)
  questionOrders: QuestionOrderDto[];
}
