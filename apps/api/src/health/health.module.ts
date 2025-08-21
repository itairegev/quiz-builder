import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthCheckService } from '../common/health/health-check.service';
import { DatabaseModule } from '../database/database.module';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [DatabaseModule, MonitoringModule],
  controllers: [HealthController],
  providers: [HealthService, HealthCheckService],
  exports: [HealthService, HealthCheckService],
})
export class HealthModule {}
