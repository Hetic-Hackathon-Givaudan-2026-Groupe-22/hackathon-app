import { Module } from '@nestjs/common';
import { TendancesController } from './tendances.controller.js';
import { TendancesService } from './tendances.service.js';

@Module({
  controllers: [TendancesController],
  providers: [TendancesService],
})
export class TendancesModule {}
