import { ApiProperty } from '@nestjs/swagger';
import { QuizStatus } from '@prisma/client';

export class QuizBuilderResponseDto {
  @ApiProperty({
    description: 'Quiz ID',
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
    example: 'Find Your Perfect Product',
  })
  title: string;

  @ApiProperty({
    description: 'Quiz description',
    example: 'Answer a few questions to get personalized recommendations',
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
    description: 'Quiz settings',
    example: {
      showProgress: true,
      allowBacktracking: true,
      showQuestionNumbers: false,
      requireAllQuestions: true,
      showResults: true,
      collectEmail: true,
    },
    nullable: true,
  })
  settings: any;

  @ApiProperty({
    description: 'Quiz theme',
    example: {
      primaryColor: '#6366f1',
      secondaryColor: '#f3f4f6',
      fontFamily: 'Inter',
      borderRadius: '8px',
      buttonStyle: 'rounded',
      layout: 'single-column',
    },
    nullable: true,
  })
  theme: any;

  @ApiProperty({
    description: 'Quiz questions',
    type: 'array',
    items: { type: 'object' },
  })
  questions: any[];

  @ApiProperty({
    description: 'Quiz logic rules',
    type: 'array',
    items: { type: 'object' },
  })
  logicRules: any[];

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
