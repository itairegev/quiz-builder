import { IsOptional, IsString, IsDateString, IsBoolean, IsArray, IsEnum } from 'class-validator';

export enum AnalyticsGroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum AnalyticsMetrics {
  SUBMISSIONS = 'submissions',
  CONVERSIONS = 'conversions',
  REVENUE = 'revenue',
  ENGAGEMENT = 'engagement',
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  includeRevenue?: boolean;

  @IsOptional()
  @IsBoolean()
  includeTrends?: boolean;

  @IsOptional()
  @IsEnum(AnalyticsGroupBy)
  groupBy?: AnalyticsGroupBy;

  @IsOptional()
  @IsArray()
  @IsEnum(AnalyticsMetrics, { each: true })
  metrics?: AnalyticsMetrics[];
}
