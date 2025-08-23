import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { QuizPreviewService } from './quiz-preview.service';
import {
  PreviewValidationResultDto,
  EmbedCodeDataDto,
  QuizPreviewSummaryDto,
} from './dto';

@ApiTags('quiz-preview')
@Controller('quiz-preview')
export class QuizPreviewController {
  private readonly logger = new Logger(QuizPreviewController.name);

  constructor(private readonly quizPreviewService: QuizPreviewService) {}

  /**
   * Health check for preview service
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview service health check' })
  @ApiResponse({
    status: 200,
    description: 'Preview service is healthy',
    type: 'object',
    schema: {
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        service: { type: 'string' },
      },
    },
  })
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'quiz-preview',
    };
  }

  /**
   * Get quiz preview data
   */
  @Get('quizzes/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get quiz preview data' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Preview data retrieved successfully',
    type: 'object',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizPreview(
    @Param('id') quizId: string,
  ): Promise<any> {
    this.logger.log(`Getting preview for quiz ${quizId}`);
    
    // For testing, return mock data
    return {
      id: quizId,
      title: 'Test Quiz Preview',
      message: 'Preview system is working!',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate quiz configuration
   */
  @Post('quizzes/:id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate quiz configuration' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz validation completed',
    type: PreviewValidationResultDto,
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async validateQuiz(
    @Param('id') quizId: string,
  ): Promise<PreviewValidationResultDto> {
    this.logger.log(`Validating quiz ${quizId}`);
    
    // For testing, return mock validation data
    return {
      isValid: true,
      errors: [],
      warnings: [
        {
          field: 'theme',
          message: 'Consider adding more theme customization',
          suggestion: 'Add custom colors and fonts',
        },
      ],
      suggestions: [
        'Add custom theme to match your brand',
        'Enable progress bar to improve user experience',
      ],
    };
  }

  /**
   * Get embed codes for quiz
   */
  @Get('quizzes/:id/embed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get embed codes for quiz' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Embed codes retrieved successfully',
    type: EmbedCodeDataDto,
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getEmbedCodes(
    @Param('id') quizId: string,
  ): Promise<EmbedCodeDataDto> {
    this.logger.log(`Getting embed codes for quiz ${quizId}`);
    
    // For testing, return mock embed code data
    return {
      iframeCode: `<iframe src="http://localhost:3000/quiz-preview/${quizId}" width="100%" height="600px" frameborder="0"></iframe>`,
      scriptCode: `<script src="http://localhost:3000/quiz-embed.js" data-quiz-id="${quizId}"></script>`,
      cssCode: `<link rel="stylesheet" href="http://localhost:3000/quiz-styles.css">`,
      customizationOptions: [
        'Customize width and height',
        'Add custom CSS classes',
        'Modify border and shadow',
        'Change background color',
      ],
    };
  }

  /**
   * Get quiz summary
   */
  @Get('quizzes/:id/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get quiz summary' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz summary retrieved successfully',
    type: QuizPreviewSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizSummary(
    @Param('id') quizId: string,
  ): Promise<QuizPreviewSummaryDto> {
    this.logger.log(`Getting summary for quiz ${quizId}`);
    
    // For testing, return mock summary data
    return {
      id: quizId,
      title: 'Test Quiz',
      totalQuestions: 5,
      requiredQuestions: 3,
      estimatedTime: 3,
      previewUrl: `http://localhost:3000/quiz-preview/${quizId}`,
      hasLogicRules: true,
      hasCustomTheme: false,
    };
  }
}
