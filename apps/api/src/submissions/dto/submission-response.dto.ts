import { SubmissionStatus } from './submission-query.dto';

export class SubmissionResponseDto {
  id: string;
  quizId: string;
  sessionId: string;
  status: SubmissionStatus;
  metadata?: any;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
