import { Controller, Get } from '@nestjs/common';
import { TendancesService } from './tendances.service.js';

@Controller('tendances')
export class TendancesController {
  constructor(private readonly tendances: TendancesService) {}

  // GET /api/tendances
  @Get()
  lister() {
    return this.tendances.lister();
  }
}
