import { Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import { TendancesService } from './tendances.service.js';

// Paramètres de GET /api/tendances, validés par Zod (ADR 0008)
export const rechercheSchema = z.object({
  q: z.string().trim().max(60).optional(),
});

@Controller('tendances')
export class TendancesController {
  constructor(private readonly tendances: TendancesService) {}

  // GET /api/tendances?q=mot-clé
  @Get()
  lister(
    @Query({ schema: rechercheSchema }) query: z.infer<typeof rechercheSchema>,
  ) {
    return this.tendances.lister(query.q || undefined);
  }
}
