import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TemplateQueryDto {
  @ApiPropertyOptional({
    description: 'Filter templates by category',
    example: 'product-recommendation',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Search templates by name or description',
    example: 'skincare',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
