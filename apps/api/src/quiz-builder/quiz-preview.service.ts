import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QuizPreviewService {
  private readonly logger = new Logger(QuizPreviewService.name);

  constructor() {}

  /**
   * Generate preview data for a quiz
   */
  async generatePreview(
    shopId: string,
    quizId: string,
  ): Promise<any> {
    this.logger.log(`Generating preview for quiz ${quizId} in shop ${shopId}`);
    
    return {
      id: quizId,
      title: 'Test Quiz',
      message: 'Preview service is working!',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate quiz configuration
   */
  async validateQuizConfiguration(
    shopId: string,
    quizId: string,
  ): Promise<any> {
    this.logger.log(`Validating quiz ${quizId}`);
    
    return {
      isValid: true,
      message: 'Validation service is working!',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate embed code data
   */
  async generateEmbedCodeData(
    shopId: string,
    quizId: string,
  ): Promise<any> {
    this.logger.log(`Generating embed code for quiz ${quizId}`);
    
    return {
      iframeCode: `<iframe src="http://localhost:3000/quiz-preview/${quizId}"></iframe>`,
      message: 'Embed code service is working!',
      timestamp: new Date().toISOString(),
    };
  }
}
