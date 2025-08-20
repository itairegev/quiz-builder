import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringModule as CommonMonitoringModule } from '@shopify-quiz-builder/common';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CommonMonitoringModule, AuthModule],
  controllers: [MonitoringController],
})
export class MonitoringModule {}

