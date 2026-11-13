import { Module } from '@nestjs/common';
import { AnalysesModule } from '../analyses/analyses.module.js';
import { CompteController } from './compte.controller.js';
import { CompteService } from './compte.service.js';

@Module({
  imports: [AnalysesModule],
  controllers: [CompteController],
  providers: [CompteService],
})
export class CompteModule {}
