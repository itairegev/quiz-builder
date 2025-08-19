// Re-export Prisma types
export type {
  Shop,
  Quiz,
  Question,
  LogicRule,
  Submission,
  Answer,
  AnalyticsEvent,
  QuestionType,
  QuizStatus,
  SubmissionStatus,
  LogicRuleType,
} from '@prisma/client';

// Custom types for the application
export interface QuizWithRelations extends Quiz {
  shop: Shop;
  questions: Question[];
  logicRules: LogicRule[];
  submissions: Submission[];
}

export interface QuestionWithRelations extends Question {
  quiz: Quiz;
  logicRules: LogicRule[];
  answers: Answer[];
}

export interface SubmissionWithRelations extends Submission {
  quiz: Quiz;
  answers: Answer[];
}

export interface AnswerWithRelations extends Answer {
  submission: Submission;
  question: Question;
}

// Quiz creation and update types
export interface CreateQuizData {
  shopId: string;
  title: string;
  description?: string;
  status?: QuizStatus;
  settings?: Record<string, any>;
  theme?: Record<string, any>;
}

export interface UpdateQuizData {
  title?: string;
  description?: string;
  status?: QuizStatus;
  settings?: Record<string, any>;
  theme?: Record<string, any>;
}

// Question creation and update types
export interface CreateQuestionData {
  quizId: string;
  order: number;
  type: QuestionType;
  text: string;
  description?: string;
  required?: boolean;
  options?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface UpdateQuestionData {
  order?: number;
  type?: QuestionType;
  text?: string;
  description?: string;
  required?: boolean;
  options?: Record<string, any>;
  settings?: Record<string, any>;
}

// Logic rule types
export interface CreateLogicRuleData {
  quizId?: string;
  questionId?: string;
  type: LogicRuleType;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority?: number;
  isActive?: boolean;
}

// Submission types
export interface CreateSubmissionData {
  quizId: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface CreateAnswerData {
  submissionId: string;
  questionId: string;
  value: any;
  metadata?: Record<string, any>;
}

// Analytics types
export interface CreateAnalyticsEventData {
  quizId?: string;
  submissionId?: string;
  eventType: string;
  eventData?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Database query types
export interface QuizFilters {
  shopId?: string;
  status?: QuizStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface QuestionFilters {
  quizId?: string;
  type?: QuestionType;
  required?: boolean;
}

export interface SubmissionFilters {
  quizId?: string;
  status?: SubmissionStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
