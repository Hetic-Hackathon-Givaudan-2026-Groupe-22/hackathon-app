import { Module } from '@nestjs/common';
import { AnalysesModule } from './analyses/analyses.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PlanModule } from './plan/plan.module.js';
import { CompteModule } from './compte/compte.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthController } from './health/health.controller.js';
import { TendancesModule } from './tendances/tendances.module.js';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CompteModule,
    TendancesModule,
    AnalysesModule,
    PlanModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
