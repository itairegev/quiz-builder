export class QuizAnalyticsDto {
  quizId: string;
  totalSubmissions: number;
  averageScore?: number;
  completionRate: number;
  averageTimeSpent?: number;
  conversionRate?: number;
  topPerformers?: string[];
  questionPerformance?: Array<{
    questionId: string;
    correctAnswers: number;
    totalAttempts: number;
    successRate: number;
    averageTime?: number;
  }>;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export class ShopAnalyticsDto {
  shopId: string;
  totalQuizzes: number;
  totalSubmissions: number;
  averageQuizCompletion: number;
  totalRevenue?: number;
  customerEngagement: {
    activeCustomers: number;
    newCustomers: number;
    returningCustomers: number;
  };
  topPerformingQuizzes: Array<{
    quizId: string;
    title: string;
    submissions: number;
    conversionRate: number;
    revenue?: number;
  }>;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export class CustomerAnalyticsDto {
  customerId: string;
  totalQuizzesTaken: number;
  averageScore?: number;
  totalTimeSpent?: number;
  conversionRate?: number;
  totalSpent?: number;
  quizHistory: Array<{
    quizId: string;
    score?: number;
    completedAt: Date;
    converted: boolean;
    amount?: number;
  }>;
  preferences: {
    favoriteCategories?: string[];
    averageTimePerQuiz?: number;
    completionRate: number;
  };
}
