import { ApiProperty } from '@nestjs/swagger';
import { Quiz, QuizStatus } from '@prisma/client';

export class QuizResponseDto implements Partial<Quiz> {
  @ApiProperty({
    description: 'Unique quiz identifier',
    example: 'clx1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Shop ID that owns this quiz',
    example: 'clx1234567890abcdef',
  })
  shopId: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Skin Care Quiz',
  })
  title: string;

  @ApiProperty({
    description: 'Quiz description',
    example: 'Find your perfect skin care routine',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Quiz status',
    enum: QuizStatus,
    example: QuizStatus.DRAFT,
  })
  status: QuizStatus;

  @ApiProperty({
    description: 'Quiz configuration settings',
    example: {
      showProgress: true,
      allowSkipping: false,
      timeLimit: null,
      maxAttempts: 1,
    },
    nullable: true,
  })
  settings: any;

  @ApiProperty({
    description: 'Quiz UI theme settings',
    example: {
      primaryColor: '#6366f1',
      secondaryColor: '#f3f4f6',
      fontFamily: 'Inter',
      borderRadius: '8px',
    },
    nullable: true,
  })
  theme: any;

  @ApiProperty({
    description: 'When the quiz was published',
    example: '2024-08-20T10:00:00Z',
    nullable: true,
  })
  publishedAt: Date | null;

  @ApiProperty({
    description: 'When the quiz was scheduled',
    example: '2024-08-20T10:00:00Z',
    nullable: true,
  })
  scheduledAt: Date | null;

  @ApiProperty({
    description: 'When the quiz was created',
    example: '2024-08-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the quiz was last updated',
    example: '2024-08-20T10:00:00Z',
  })
  updatedAt: Date;
}
