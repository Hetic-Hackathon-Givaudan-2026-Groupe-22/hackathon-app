import { Module } from '@nestjs/common';
import { AnalysesModule } from '../analyses/analyses.module.js';
import { PlanController } from './plan.controller.js';
import { PlanService } from './plan.service.js';

@Module({
  imports: [AnalysesModule],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
