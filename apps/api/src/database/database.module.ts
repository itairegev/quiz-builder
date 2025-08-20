import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { PrismaService } from '@shopify-quiz-builder/database';

@Module({
  providers: [DatabaseService, PrismaService],
  exports: [DatabaseService, PrismaService],
})
export class DatabaseModule {}
