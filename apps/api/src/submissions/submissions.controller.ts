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
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto, UpdateSubmissionDto, SubmissionQueryDto } from './dto';

@Controller('api/v1/submissions')
@UseGuards(ShopifyAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  async create(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @CurrentShopId() shopId: string,
  ) {
    try {
      return await this.submissionsService.create(createSubmissionDto, shopId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create submission',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@CurrentShopId() shopId: string) {
    try {
      return await this.submissionsService.findAll(shopId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch submissions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  async find(
    @CurrentShopId() shopId: string,
    @Query() query: SubmissionQueryDto,
  ) {
    try {
      return await this.submissionsService.find(shopId, query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch submissions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentShopId() shopId: string) {
    try {
      const submission = await this.submissionsService.findOne(id, shopId);
      if (!submission) {
        throw new HttpException('Submission not found', HttpStatus.NOT_FOUND);
      }
      return submission;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to fetch submission',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @CurrentShopId() shopId: string,
  ) {
    try {
      const submission = await this.submissionsService.update(id, updateSubmissionDto, shopId);
      if (!submission) {
        throw new HttpException('Submission not found', HttpStatus.NOT_FOUND);
      }
      return submission;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update submission',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentShopId() shopId: string) {
    try {
      const result = await this.submissionsService.remove(id, shopId);
      if (!result) {
        throw new HttpException('Submission not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Submission deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to delete submission',
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
      return await this.submissionsService.findByQuizId(quizId, shopId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch submissions for quiz',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('session/:sessionId')
  async findBySessionId(
    @Param('sessionId') sessionId: string,
    @CurrentShopId() shopId: string,
  ) {
    try {
      return await this.submissionsService.findBySessionId(sessionId, shopId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch submissions for session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('quiz/:quizId/analytics')
  async getQuizAnalytics(
    @Param('quizId') quizId: string,
    @CurrentShopId() shopId: string,
  ) {
    try {
      return await this.submissionsService.getQuizAnalytics(quizId, shopId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch quiz analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
