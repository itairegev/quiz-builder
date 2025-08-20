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

// Basic type definitions without extending Prisma types
export interface QuizWithRelations {
  id: string;
  shopId: string;
  title: string;
  description?: string;
  status: string;
  settings?: any;
  theme?: any;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  shop?: any;
  questions?: any[];
  logicRules?: any[];
  submissions?: any[];
}

export interface QuestionWithRelations {
  id: string;
  quizId: string;
  order: number;
  type: string;
  text: string;
  description?: string;
  required: boolean;
  options?: any;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
  quiz?: any;
  logicRules?: any[];
  answers?: any[];
}

export interface SubmissionWithRelations {
  id: string;
  quizId: string;
  sessionId: string;
  status: string;
  metadata?: any;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  quiz?: any;
  answers?: any[];
}

export interface AnswerWithRelations {
  id: string;
  submissionId: string;
  questionId: string;
  value: any;
  metadata?: any;
  createdAt: Date;
  submission?: any;
  question?: any;
}

// Quiz creation and update types
export interface CreateQuizData {
  shopId: string;
  title: string;
  description?: string;
  status?: string;
  settings?: Record<string, any>;
  theme?: Record<string, any>;
}

export interface UpdateQuizData {
  title?: string;
  description?: string;
  status?: string;
  settings?: Record<string, any>;
  theme?: Record<string, any>;
}

// Question creation and update types
export interface CreateQuestionData {
  quizId: string;
  order: number;
  type: string;
  text: string;
  description?: string;
  required?: boolean;
  options?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface UpdateQuestionData {
  order?: number;
  type?: string;
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
  type: string;
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

// Filter types
export interface QuizFilters {
  shopId?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface QuestionFilters {
  quizId?: string;
  type?: string;
  required?: boolean;
}

export interface SubmissionFilters {
  quizId?: string;
  status?: string;
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
