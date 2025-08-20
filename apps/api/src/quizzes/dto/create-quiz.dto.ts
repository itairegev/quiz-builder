import { IsString, IsOptional, IsObject, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({
    description: 'Quiz title',
    example: 'Skin Care Quiz',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Quiz description',
    example: 'Find your perfect skin care routine',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Quiz configuration settings',
    example: {
      showProgress: true,
      allowSkipping: false,
      timeLimit: null,
      maxAttempts: 1,
    },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Quiz UI theme settings',
    example: {
      primaryColor: '#6366f1',
      secondaryColor: '#f3f4f6',
      fontFamily: 'Inter',
      borderRadius: '8px',
    },
  })
  @IsOptional()
  @IsObject()
  theme?: Record<string, any>;
}
