import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { QuizBuilderService, QuizBuilderData } from './quiz-builder.service';
import { QuizTemplateService } from './quiz-template.service';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard';
import { CurrentShopId } from '../auth/decorators/current-shop.decorator';
import {
  QuizBuilderCreateDto,
  QuizBuilderUpdateDto,
  QuizBuilderResponseDto,
  BulkQuestionCreateDto,
  QuestionReorderDto,
  TemplateQueryDto,
  QuizBuilderStatsDto,
  QuizDuplicateDto,
} from './dto';

@ApiTags('quiz-builder')
@Controller('quiz-builder')
@UseGuards(ShopifyAuthGuard)
@ApiBearerAuth()
export class QuizBuilderController {
  constructor(
    private readonly quizBuilderService: QuizBuilderService,
    private readonly quizTemplateService: QuizTemplateService,
  ) {}

  // ==================== Quiz Builder Operations ====================

  @Post('quizzes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new quiz using the builder interface' })
  @ApiBody({ type: QuizBuilderCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Quiz created successfully',
    type: QuizBuilderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid quiz data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createQuiz(
    @CurrentShopId() shopId: string,
    @Body() createDto: QuizBuilderCreateDto,
  ): Promise<QuizBuilderResponseDto> {
    // Validate builder data
    const validation = this.quizBuilderService.validateBuilderData(createDto);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Invalid quiz data',
        errors: validation.errors,
      });
    }

    const quiz = await this.quizBuilderService.createQuizFromBuilder(shopId, createDto);
    return quiz;
  }

  @Get('quizzes/:id')
  @ApiOperation({ summary: 'Get quiz data for the builder interface' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz data retrieved successfully',
    type: QuizBuilderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getQuizForBuilder(
    @CurrentShopId() shopId: string,
    @Param('id') quizId: string,
  ): Promise<QuizBuilderData> {
    return this.quizBuilderService.getQuizForBuilder(shopId, quizId);
  }

  @Patch('quizzes/:id')
  @ApiOperation({ summary: 'Update quiz using the builder interface' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiBody({ type: QuizBuilderUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Quiz updated successfully',
    type: QuizBuilderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid quiz data' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateQuiz(
    @CurrentShopId() shopId: string,
    @Param('id') quizId: string,
    @Body() updateDto: QuizBuilderUpdateDto,
  ): Promise<QuizBuilderResponseDto> {
    // Validate builder data
    const validation = this.quizBuilderService.validateBuilderData(updateDto);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Invalid quiz data',
        errors: validation.errors,
      });
    }

    const quiz = await this.quizBuilderService.updateQuizFromBuilder(shopId, quizId, updateDto);
    return quiz;
  }

  @Post('quizzes/:id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Duplicate an existing quiz' })
  @ApiParam({ name: 'id', description: 'Quiz ID to duplicate' })
  @ApiBody({ type: QuizDuplicateDto })
  @ApiResponse({
    status: 201,
    description: 'Quiz duplicated successfully',
    type: QuizBuilderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async duplicateQuiz(
    @CurrentShopId() shopId: string,
    @Param('id') quizId: string,
    @Body() duplicateDto: QuizDuplicateDto,
  ): Promise<QuizBuilderResponseDto> {
    const quiz = await this.quizBuilderService.duplicateQuiz(
      shopId,
      quizId,
      duplicateDto.title,
    );
    return quiz;
  }

  @Post('quizzes/:id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate quiz builder data' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiBody({ type: QuizBuilderUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async validateQuiz(
    @Body() quizData: QuizBuilderData,
  ): Promise<{ valid: boolean; errors: string[] }> {
    return this.quizBuilderService.validateBuilderData(quizData);
  }

  // ==================== Question Operations ====================

  @Post('quizzes/:id/questions/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple questions at once' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiBody({ type: BulkQuestionCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Questions created successfully',
    schema: {
      type: 'array',
      items: { type: 'object' },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid question data' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkCreateQuestions(
    @CurrentShopId() shopId: string,
    @Param('id') quizId: string,
    @Body() bulkCreateDto: BulkQuestionCreateDto,
  ): Promise<any[]> {
    return this.quizBuilderService.bulkCreateQuestions(
      shopId,
      quizId,
      bulkCreateDto.questions,
    );
  }

  @Patch('quizzes/:id/questions/reorder')
  @ApiOperation({ summary: 'Reorder questions in a quiz' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiBody({ type: QuestionReorderDto })
  @ApiResponse({
    status: 200,
    description: 'Questions reordered successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid reorder data' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reorderQuestions(
    @CurrentShopId() shopId: string,
    @Param('id') quizId: string,
    @Body() reorderDto: QuestionReorderDto,
  ): Promise<{ message: string }> {
    await this.quizBuilderService.reorderQuestions(
      shopId,
      quizId,
      reorderDto.questionOrders,
    );
    return { message: 'Questions reordered successfully' };
  }

  // ==================== Template Operations ====================

  @Get('templates')
  @ApiOperation({ summary: 'Get all quiz templates' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'search', required: false, description: 'Search templates' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'object' },
    },
  })
  async getTemplates(@Query() query: TemplateQueryDto) {
    if (query.search) {
      return this.quizTemplateService.searchTemplates(query.search);
    }
    
    if (query.category) {
      return this.quizTemplateService.getTemplatesByCategory(query.category);
    }

    return this.quizTemplateService.getAllTemplates();
  }

  @Get('templates/categories')
  @ApiOperation({ summary: 'Get all template categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'object' },
    },
  })
  async getTemplateCategories() {
    return this.quizTemplateService.getCategories();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
    schema: { type: 'object' },
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplate(@Param('id') templateId: string) {
    return this.quizTemplateService.getTemplateById(templateId);
  }

  @Post('templates/:id/use')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create quiz from template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Custom title for the quiz' },
        description: { type: 'string', description: 'Custom description for the quiz' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Quiz created from template successfully',
    type: QuizBuilderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createQuizFromTemplate(
    @CurrentShopId() shopId: string,
    @Param('id') templateId: string,
    @Body() customData: { title?: string; description?: string },
  ): Promise<QuizBuilderResponseDto> {
    const template = this.quizTemplateService.getTemplateById(templateId);
    
    const quizData = {
      ...template.template,
      title: customData.title || template.template.title,
      description: customData.description || template.template.description,
    };

    const quiz = await this.quizBuilderService.createQuizFromBuilder(shopId, quizData);
    return quiz;
  }

  // ==================== Question Templates ====================

  @Get('question-templates/:type')
  @ApiOperation({ summary: 'Get question templates by type' })
  @ApiParam({ name: 'type', description: 'Question type' })
  @ApiResponse({
    status: 200,
    description: 'Question templates retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'object' },
    },
  })
  async getQuestionTemplates(@Param('type') type: string) {
    return this.quizTemplateService.getQuestionTemplates(type as any);
  }

  @Get('logic-rule-templates')
  @ApiOperation({ summary: 'Get logic rule templates' })
  @ApiResponse({
    status: 200,
    description: 'Logic rule templates retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'object' },
    },
  })
  async getLogicRuleTemplates() {
    return this.quizTemplateService.getLogicRuleTemplates();
  }

  // ==================== Statistics ====================

  @Get('statistics')
  @ApiOperation({ summary: 'Get quiz builder statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: QuizBuilderStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBuilderStatistics(
    @CurrentShopId() shopId: string,
  ): Promise<QuizBuilderStatsDto> {
    const stats = await this.quizBuilderService.getBuilderStatistics(shopId);
    return stats;
  }

  // ==================== Preview Operations ====================

  @Post('quizzes/:id/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate quiz preview data' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Preview data generated successfully',
    schema: {
      type: 'object',
      properties: {
        quiz: { type: 'object' },
        previewUrl: { type: 'string' },
        embedCode: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generatePreview(
    @CurrentShopId() shopId: string,
    @Param('id') quizId: string,
  ): Promise<{
    quiz: QuizBuilderData;
    previewUrl: string;
    embedCode: string;
  }> {
    const quiz = await this.quizBuilderService.getQuizForBuilder(shopId, quizId);
    
    // Generate preview URL (this would typically be a frontend route)
    const previewUrl = `${process.env.FRONTEND_URL}/quiz-preview/${quizId}`;
    
    // Generate embed code
    const embedCode = `<iframe src="${previewUrl}" width="100%" height="600" frameborder="0"></iframe>`;

    return {
      quiz,
      previewUrl,
      embedCode,
    };
  }

  // ==================== Import/Export Operations ====================

  @Get('quizzes/:id/export')
  @ApiOperation({ summary: 'Export quiz as JSON template' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz exported successfully',
    schema: {
      type: 'object',
      properties: {
        template: { type: 'object' },
        exportedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportQuiz(
    @CurrentShopId() shopId: string,
    @Param('id') quizId: string,
  ): Promise<{
    template: QuizBuilderData;
    exportedAt: string;
  }> {
    const quiz = await this.quizBuilderService.getQuizForBuilder(shopId, quizId);
    
    // Remove IDs to make it a clean template
    const template = {
      ...quiz,
      id: undefined,
      questions: quiz.questions.map(q => ({ ...q, id: undefined })),
      logicRules: quiz.logicRules.map(r => ({ ...r, id: undefined })),
    };

    return {
      template,
      exportedAt: new Date().toISOString(),
    };
  }

  @Post('quizzes/import')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Import quiz from JSON template' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        template: { type: 'object' },
        title: { type: 'string', description: 'Optional custom title' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Quiz imported successfully',
    type: QuizBuilderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid template data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async importQuiz(
    @CurrentShopId() shopId: string,
    @Body() importData: { template: QuizBuilderData; title?: string },
  ): Promise<QuizBuilderResponseDto> {
    const quizData = {
      ...importData.template,
      title: importData.title || importData.template.title,
    };

    // Validate imported data
    const validation = this.quizBuilderService.validateBuilderData(quizData);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Invalid template data',
        errors: validation.errors,
      });
    }

    const quiz = await this.quizBuilderService.createQuizFromBuilder(shopId, quizData);
    return quiz;
  }
}
