import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringModule as CommonMonitoringModule } from '@shopify-quiz-builder/common';

@Module({
  imports: [CommonMonitoringModule],
  controllers: [MonitoringController],
})
export class MonitoringModule {}

