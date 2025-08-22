import { ApiProperty } from '@nestjs/swagger';

export class QuizBuilderStatsDto {
  @ApiProperty({
    description: 'Total number of quizzes',
    example: 15,
  })
  totalQuizzes: number;

  @ApiProperty({
    description: 'Number of draft quizzes',
    example: 8,
  })
  draftQuizzes: number;

  @ApiProperty({
    description: 'Number of published quizzes',
    example: 7,
  })
  publishedQuizzes: number;

  @ApiProperty({
    description: 'Total number of questions across all quizzes',
    example: 75,
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Average number of questions per quiz',
    example: 5,
  })
  avgQuestionsPerQuiz: number;

  @ApiProperty({
    description: 'Completion rate (published/total)',
    example: 46.7,
  })
  completionRate: number;
}
