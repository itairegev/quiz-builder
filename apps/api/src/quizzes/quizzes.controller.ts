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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto, QuizQueryDto, QuizResponseDto } from './dto';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard';
import { CurrentShopId } from '../auth/decorators/current-shop.decorator';

@ApiTags('quizzes')
@Controller('quizzes')
@UseGuards(ShopifyAuthGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({
    status: 201,
    description: 'Quiz created successfully',
    type: QuizResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createQuiz(
    @CurrentShopId() shopId: string,
    @Body() createQuizDto: CreateQuizDto,
  ): Promise<QuizResponseDto> {
    return this.quizzesService.createQuiz(shopId, createQuizDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quizzes for a shop' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Quizzes retrieved successfully',
    type: [QuizResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllQuizzes(
    @CurrentShopId() shopId: string,
    @Query() query: QuizQueryDto,
  ): Promise<QuizResponseDto[]> {
    return this.quizzesService.findAllQuizzes(shopId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quiz by ID' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz retrieved successfully',
    type: QuizResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findQuizById(
    @CurrentShopId() shopId: string,
    @Param('id') id: string,
  ): Promise<QuizResponseDto> {
    return this.quizzesService.findQuizById(shopId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz updated successfully',
    type: QuizResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateQuiz(
    @CurrentShopId() shopId: string,
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Promise<QuizResponseDto> {
    return this.quizzesService.updateQuiz(shopId, id, updateQuizDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({ status: 204, description: 'Quiz deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteQuiz(
    @CurrentShopId() shopId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.quizzesService.deleteQuiz(shopId, id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a quiz' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz published successfully',
    type: QuizResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 400, description: 'Quiz cannot be published' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async publishQuiz(
    @CurrentShopId() shopId: string,
    @Param('id') id: string,
  ): Promise<QuizResponseDto> {
    return this.quizzesService.publishQuiz(shopId, id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a quiz' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz archived successfully',
    type: QuizResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async archiveQuiz(
    @CurrentShopId() shopId: string,
    @Param('id') id: string,
  ): Promise<QuizResponseDto> {
    return this.quizzesService.archiveQuiz(shopId, id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get quiz analytics' })
  @ApiParam({ name: 'id', description: 'Quiz ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz analytics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getQuizAnalytics(
    @CurrentShopId() shopId: string,
    @Param('id') id: string,
  ) {
    return this.quizzesService.getQuizAnalytics(shopId, id);
  }
}
