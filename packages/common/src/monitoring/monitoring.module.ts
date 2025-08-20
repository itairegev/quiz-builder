import { Global, Module } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { MonitoringService } from './monitoring.service';

@Global()
@Module({
  providers: [LoggerService, MonitoringService],
  exports: [LoggerService, MonitoringService],
})
export class MonitoringModule {}

