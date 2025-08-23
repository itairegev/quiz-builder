import { ApiProperty } from '@nestjs/swagger';

export class PreviewQuestionDto {
  @ApiProperty({
    description: 'Question ID',
    example: 'q1',
  })
  id: string;

  @ApiProperty({
    description: 'Question order in quiz',
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Question type',
    example: 'SINGLE_CHOICE',
    enum: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'RATING', 'IMAGE_CHOICE', 'BOOLEAN'],
  })
  type: string;

  @ApiProperty({
    description: 'Question text',
    example: 'What is your preference?',
  })
  text: string;

  @ApiProperty({
    description: 'Question description',
    example: 'Please select your preferred option',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Whether the question is required',
    example: true,
  })
  required: boolean;

  @ApiProperty({
    description: 'Question options (for choice questions)',
    type: 'array',
    items: { type: 'object' },
    nullable: true,
  })
  options?: any[];

  @ApiProperty({
    description: 'Question settings',
    type: 'object',
    nullable: true,
  })
  settings?: any;

  @ApiProperty({
    description: 'Question validation rules',
    type: 'object',
    nullable: true,
  })
  validation?: any;
}

export class PreviewLogicRuleDto {
  @ApiProperty({
    description: 'Logic rule ID',
    example: 'rule-1',
  })
  id: string;

  @ApiProperty({
    description: 'Logic rule type',
    example: 'JUMP_TO_QUESTION',
    enum: ['JUMP_TO_QUESTION', 'SHOW_QUESTION', 'HIDE_QUESTION', 'SET_VALUE', 'SEND_EMAIL', 'ADD_TO_CART', 'SHOW_MESSAGE'],
  })
  type: string;

  @ApiProperty({
    description: 'Rule priority (lower numbers have higher priority)',
    example: 1,
  })
  priority: number;

  @ApiProperty({
    description: 'Rule conditions',
    type: 'array',
    items: { type: 'object' },
  })
  conditions: any[];

  @ApiProperty({
    description: 'Rule actions',
    type: 'array',
    items: { type: 'object' },
  })
  actions: any[];

  @ApiProperty({
    description: 'Whether the rule is active',
    example: true,
  })
  isActive: boolean;
}

export class ValidationErrorDto {
  @ApiProperty({
    description: 'Error type',
    example: 'critical',
    enum: ['critical', 'error', 'warning'],
  })
  type: 'critical' | 'error' | 'warning';

  @ApiProperty({
    description: 'Field that has the error',
    example: 'title',
  })
  field: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Quiz title is required',
  })
  message: string;

  @ApiProperty({
    description: 'Question ID if error is related to a question',
    example: 'q1',
    nullable: true,
  })
  questionId?: string;

  @ApiProperty({
    description: 'Rule ID if error is related to a logic rule',
    example: 'rule-1',
    nullable: true,
  })
  ruleId?: string;
}

export class ValidationWarningDto {
  @ApiProperty({
    description: 'Field that has the warning',
    example: 'theme',
  })
  field: string;

  @ApiProperty({
    description: 'Warning message',
    example: 'Consider adding more theme customization',
  })
  message: string;

  @ApiProperty({
    description: 'Suggestion to fix the warning',
    example: 'Add custom colors and fonts',
  })
  suggestion: string;

  @ApiProperty({
    description: 'Question ID if warning is related to a question',
    example: 'q1',
    nullable: true,
  })
  questionId?: string;

  @ApiProperty({
    description: 'Rule ID if warning is related to a logic rule',
    example: 'rule-1',
    nullable: true,
  })
  ruleId?: string;
}

export class PreviewValidationResultDto {
  @ApiProperty({
    description: 'Whether the quiz configuration is valid',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Validation errors',
    type: 'array',
    items: { $ref: '#/components/schemas/ValidationErrorDto' },
  })
  errors: ValidationErrorDto[];

  @ApiProperty({
    description: 'Validation warnings',
    type: 'array',
    items: { $ref: '#/components/schemas/ValidationWarningDto' },
  })
  warnings: ValidationWarningDto[];

  @ApiProperty({
    description: 'Improvement suggestions',
    type: 'array',
    items: { type: 'string' },
    example: ['Add custom theme to match your brand', 'Enable progress bar to improve user experience'],
  })
  suggestions: string[];
}

export class EmbedCodeDataDto {
  @ApiProperty({
    description: 'Iframe embed code',
    example: '<iframe src="http://localhost:3000/quiz-preview/quiz-1"></iframe>',
  })
  iframeCode: string;

  @ApiProperty({
    description: 'JavaScript embed code',
    example: '<script src="http://localhost:3000/quiz-embed.js"></script>',
  })
  scriptCode: string;

  @ApiProperty({
    description: 'CSS embed code',
    example: '<link rel="stylesheet" href="http://localhost:3000/quiz-styles.css">',
  })
  cssCode: string;

  @ApiProperty({
    description: 'Customization options',
    type: 'array',
    items: { type: 'string' },
    example: ['Customize width and height', 'Add custom CSS classes'],
  })
  customizationOptions: string[];
}

export class QuizPreviewDataDto {
  @ApiProperty({
    description: 'Quiz ID',
    example: 'quiz-1',
  })
  id: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Test Quiz',
  })
  title: string;

  @ApiProperty({
    description: 'Quiz description',
    example: 'Test Description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Quiz settings',
    type: 'object',
    example: {
      showProgress: true,
      allowBacktracking: true,
      showQuestionNumbers: false,
      requireAllQuestions: true,
    },
  })
  settings: any;

  @ApiProperty({
    description: 'Quiz theme',
    type: 'object',
    example: {
      primaryColor: '#6366f1',
      secondaryColor: '#f3f4f6',
      fontFamily: 'Inter',
      borderRadius: '8px',
    },
  })
  theme: any;

  @ApiProperty({
    description: 'Quiz questions',
    type: 'array',
    items: { $ref: '#/components/schemas/PreviewQuestionDto' },
  })
  questions: PreviewQuestionDto[];

  @ApiProperty({
    description: 'Quiz logic rules',
    type: 'array',
    items: { $ref: '#/components/schemas/PreviewLogicRuleDto' },
  })
  logicRules: PreviewLogicRuleDto[];

  @ApiProperty({
    description: 'Preview URL',
    example: 'http://localhost:3000/quiz-preview/quiz-1',
  })
  previewUrl: string;

  @ApiProperty({
    description: 'Embed code',
    example: '<iframe src="http://localhost:3000/quiz-preview/quiz-1"></iframe>',
  })
  embedCode: string;

  @ApiProperty({
    description: 'Estimated completion time in minutes',
    example: 3,
  })
  estimatedTime: number;

  @ApiProperty({
    description: 'Total number of questions',
    example: 5,
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Number of required questions',
    example: 3,
  })
  requiredQuestions: number;
}

export class QuizPreviewSummaryDto {
  @ApiProperty({
    description: 'Quiz ID',
    example: 'quiz-1',
  })
  id: string;

  @ApiProperty({
    description: 'Quiz title',
    example: 'Test Quiz',
  })
  title: string;

  @ApiProperty({
    description: 'Total number of questions',
    example: 5,
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Number of required questions',
    example: 3,
  })
  requiredQuestions: number;

  @ApiProperty({
    description: 'Estimated completion time in minutes',
    example: 3,
  })
  estimatedTime: number;

  @ApiProperty({
    description: 'Preview URL',
    example: 'http://localhost:3000/quiz-preview/quiz-1',
  })
  previewUrl: string;

  @ApiProperty({
    description: 'Whether the quiz has logic rules',
    example: true,
  })
  hasLogicRules: boolean;

  @ApiProperty({
    description: 'Whether the quiz has custom theme',
    example: true,
  })
  hasCustomTheme: boolean;
}

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Service status',
    example: 'healthy',
  })
  status: string;

  @ApiProperty({
    description: 'Current timestamp',
    example: '2024-08-22T19:20:24.123Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Service name',
    example: 'quiz-preview',
  })
  service: string;
}
