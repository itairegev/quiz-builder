import { IsString, IsDateString, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
}

export class ExportAnalyticsDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsBoolean()
  includeRevenue?: boolean;

  @IsOptional()
  @IsString()
  groupBy?: string;
}
