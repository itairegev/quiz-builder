import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ShopifyAuthGuard } from '../auth/guards/shopify-auth.guard';
import { CurrentShopId } from '../auth/decorators/current-shop.decorator';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, QuestionQueryDto } from './dto';

@Controller('api/v1/questions')
@UseGuards(ShopifyAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentShopId() shopId: string,
  ) {
    try {
      return await this.questionsService.create(createQuestionDto, shopId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(
    @CurrentShopId() shopId: string,
    @Query() query: QuestionQueryDto,
  ) {
    try {
      return await this.questionsService.findAll(shopId, query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch questions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentShopId() shopId: string) {
    try {
      const question = await this.questionsService.findOne(id, shopId);
      if (!question) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }
      return question;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to fetch question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @CurrentShopId() shopId: string,
  ) {
    try {
      const question = await this.questionsService.update(id, updateQuestionDto, shopId);
      if (!question) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }
      return question;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentShopId() shopId: string) {
    try {
      const result = await this.questionsService.remove(id, shopId);
      if (!result) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Question deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to delete question',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('quiz/:quizId')
  async findByQuizId(
    @Param('quizId') quizId: string,
    @CurrentShopId() shopId: string,
  ) {
    try {
      return await this.questionsService.findByQuizId(quizId, shopId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch questions for quiz',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
