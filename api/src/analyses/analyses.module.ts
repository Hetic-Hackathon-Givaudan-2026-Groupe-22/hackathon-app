import { Module } from '@nestjs/common';
import { ANALYSE_PROVIDER } from './analyse-provider.js';
import { AnalyseSimulee } from './analyse-simulee.js';
import { AnalysesController } from './analyses.controller.js';
import { AnalysesService } from './analyses.service.js';

@Module({
  controllers: [AnalysesController],
  providers: [
    AnalysesService,
    // Le simulateur tant que le service Data n'est pas prêt (ADR 0005)
    { provide: ANALYSE_PROVIDER, useClass: AnalyseSimulee },
  ],
})
export class AnalysesModule {}
