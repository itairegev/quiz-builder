import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType, LogicRuleType } from '@prisma/client';

class QuestionOptionDto {
  @ApiProperty({ description: 'Option text' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ description: 'Option value' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ description: 'Option image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Option score for scoring logic' })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

class QuestionValidationDto {
  @ApiPropertyOptional({ description: 'Whether the question is required' })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ description: 'Validation pattern (regex)' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ description: 'Validation error message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Minimum number of selections' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSelections?: number;

  @ApiPropertyOptional({ description: 'Maximum number of selections' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSelections?: number;
}

class QuestionSettingsDto {
  @ApiPropertyOptional({ description: 'Input placeholder text' })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional({ description: 'Minimum text length' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minLength?: number;

  @ApiPropertyOptional({ description: 'Maximum text length' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLength?: number;

  @ApiPropertyOptional({ description: 'Minimum numeric value' })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum numeric value' })
  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Numeric step value' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  step?: number;

  @ApiPropertyOptional({ description: 'Allow multiple selections' })
  @IsOptional()
  @IsBoolean()
  allowMultiple?: boolean;

  @ApiPropertyOptional({ description: 'Randomize option order' })
  @IsOptional()
  @IsBoolean()
  randomizeOptions?: boolean;

  @ApiPropertyOptional({ description: 'Show "Other" option' })
  @IsOptional()
  @IsBoolean()
  showOther?: boolean;

  @ApiPropertyOptional({ description: 'Label for "Other" option' })
  @IsOptional()
  @IsString()
  otherLabel?: string;
}

class QuestionBuilderDto {
  @ApiPropertyOptional({ description: 'Question ID (for updates)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Question order in the quiz' })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({ description: 'Question type', enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @ApiPropertyOptional({ description: 'Question description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Whether the question is required' })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({ description: 'Question options', type: [QuestionOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @ApiPropertyOptional({ description: 'Question settings', type: QuestionSettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuestionSettingsDto)
  settings?: QuestionSettingsDto;

  @ApiPropertyOptional({ description: 'Question validation rules', type: QuestionValidationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuestionValidationDto)
  validation?: QuestionValidationDto;
}

class LogicConditionDto {
  @ApiProperty({ description: 'Target question ID' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'Comparison operator',
    enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in'],
  })
  @IsEnum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in'])
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';

  @ApiProperty({ description: 'Comparison value' })
  value: any;

  @ApiPropertyOptional({
    description: 'Logical operator for combining conditions',
    enum: ['AND', 'OR'],
  })
  @IsOptional()
  @IsEnum(['AND', 'OR'])
  logicalOperator?: 'AND' | 'OR';
}

class LogicActionDto {
  @ApiProperty({
    description: 'Action type',
    enum: ['show_question', 'hide_question', 'jump_to_question', 'set_value', 'send_email', 'add_to_cart', 'show_message'],
  })
  @IsEnum(['show_question', 'hide_question', 'jump_to_question', 'set_value', 'send_email', 'add_to_cart', 'show_message'])
  type: 'show_question' | 'hide_question' | 'jump_to_question' | 'set_value' | 'send_email' | 'add_to_cart' | 'show_message';

  @ApiPropertyOptional({ description: 'Target ID for the action' })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({ description: 'Action value' })
  @IsOptional()
  value?: any;

  @ApiPropertyOptional({ description: 'Action message' })
  @IsOptional()
  @IsString()
  message?: string;
}

class LogicRuleBuilderDto {
  @ApiPropertyOptional({ description: 'Logic rule ID (for updates)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Logic rule type', enum: LogicRuleType })
  @IsEnum(LogicRuleType)
  type: LogicRuleType;

  @ApiProperty({ description: 'Rule priority (lower numbers execute first)' })
  @IsNumber()
  @Min(0)
  priority: number;

  @ApiProperty({ description: 'Rule conditions', type: [LogicConditionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogicConditionDto)
  conditions: LogicConditionDto[];

  @ApiProperty({ description: 'Rule actions', type: [LogicActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogicActionDto)
  actions: LogicActionDto[];

  @ApiProperty({ description: 'Whether the rule is active' })
  @IsBoolean()
  isActive: boolean;
}

class QuizBuilderSettingsDto {
  @ApiPropertyOptional({ description: 'Show progress bar' })
  @IsOptional()
  @IsBoolean()
  showProgress?: boolean;

  @ApiPropertyOptional({ description: 'Allow users to go back to previous questions' })
  @IsOptional()
  @IsBoolean()
  allowBacktracking?: boolean;

  @ApiPropertyOptional({ description: 'Show question numbers' })
  @IsOptional()
  @IsBoolean()
  showQuestionNumbers?: boolean;

  @ApiPropertyOptional({ description: 'Require all questions to be answered' })
  @IsOptional()
  @IsBoolean()
  requireAllQuestions?: boolean;

  @ApiPropertyOptional({ description: 'Time limit in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLimit?: number;

  @ApiPropertyOptional({ description: 'Maximum number of attempts' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({ description: 'Show results to user' })
  @IsOptional()
  @IsBoolean()
  showResults?: boolean;

  @ApiPropertyOptional({ description: 'Collect user email address' })
  @IsOptional()
  @IsBoolean()
  collectEmail?: boolean;

  @ApiPropertyOptional({ description: 'Redirect URL after completion' })
  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @ApiPropertyOptional({ description: 'Thank you message' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thankYouMessage?: string;
}

class QuizBuilderThemeDto {
  @ApiPropertyOptional({ description: 'Primary color (hex)' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Secondary color (hex)' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Background color (hex)' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional({ description: 'Text color (hex)' })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional({ description: 'Font family' })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({ description: 'Font size (CSS value)' })
  @IsOptional()
  @IsString()
  fontSize?: string;

  @ApiPropertyOptional({ description: 'Border radius (CSS value)' })
  @IsOptional()
  @IsString()
  borderRadius?: string;

  @ApiPropertyOptional({
    description: 'Button style',
    enum: ['rounded', 'square', 'pill'],
  })
  @IsOptional()
  @IsEnum(['rounded', 'square', 'pill'])
  buttonStyle?: 'rounded' | 'square' | 'pill';

  @ApiPropertyOptional({
    description: 'Layout style',
    enum: ['single-column', 'two-column', 'card'],
  })
  @IsOptional()
  @IsEnum(['single-column', 'two-column', 'card'])
  layout?: 'single-column' | 'two-column' | 'card';

  @ApiPropertyOptional({
    description: 'Animation style',
    enum: ['none', 'fade', 'slide'],
  })
  @IsOptional()
  @IsEnum(['none', 'fade', 'slide'])
  animation?: 'none' | 'fade' | 'slide';
}

export class QuizBuilderCreateDto {
  @ApiProperty({
    description: 'Quiz title',
    example: 'Find Your Perfect Product',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Quiz description',
    example: 'Answer a few questions to get personalized recommendations',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Quiz settings',
    type: QuizBuilderSettingsDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuizBuilderSettingsDto)
  settings?: QuizBuilderSettingsDto;

  @ApiPropertyOptional({
    description: 'Quiz theme settings',
    type: QuizBuilderThemeDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuizBuilderThemeDto)
  theme?: QuizBuilderThemeDto;

  @ApiProperty({
    description: 'Quiz questions',
    type: [QuestionBuilderDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionBuilderDto)
  questions: QuestionBuilderDto[];

  @ApiPropertyOptional({
    description: 'Quiz logic rules',
    type: [LogicRuleBuilderDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogicRuleBuilderDto)
  logicRules?: LogicRuleBuilderDto[];
}
