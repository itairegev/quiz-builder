import { QuestionType } from '@shopify-quiz-builder/database';

export class QuestionResponseDto {
  id: string;
  quizId: string;
  order: number;
  type: QuestionType;
  text: string;
  description?: string;
  required: boolean;
  options?: any;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
}
