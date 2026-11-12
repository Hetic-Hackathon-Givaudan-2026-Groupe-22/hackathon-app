import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import { TendancesService } from './tendances.service.js';

// Paramètres de GET /api/tendances, validés par Zod (ADR 0008)
export const rechercheSchema = z.object({
  q: z.string().trim().max(60).optional(),
});

// Identifiant d'une tendance dans l'URL : « pistache », « fleur-oranger »
export const slugSchema = z.string().regex(/^[a-z0-9-]{1,60}$/);

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

  // GET /api/tendances/:slug : la fiche (US-13)
  @Get(':slug')
  async fiche(@Param('slug', { schema: slugSchema }) slug: string) {
    const tendance = await this.tendances.trouver(slug);
    if (!tendance) throw new NotFoundException('Tendance introuvable');
    return tendance;
  }
}
