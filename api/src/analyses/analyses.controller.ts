import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { UtilisateurPublic } from '../auth/auth.service.js';
import { SessionGuard, Utilisateur } from '../auth/session.guard.js';
import { z } from 'zod';
import { slugSchema } from '../tendances/tendances.controller.js';
import { AnalysesService } from './analyses.service.js';

// Corps de POST /api/analyses, validé par Zod (ADR 0008)
export const lancementSchema = z.object({
  tendance: slugSchema,
  // Rejeu (US-22) : 6, 12 ou 24 mois, et jusqu'à 2 tendances à comparer
  periodeMois: z.union([z.literal(6), z.literal(12), z.literal(24)]).optional(),
  comparer: z.array(slugSchema).max(2).optional(),
});

// Paramètres de GET /api/analyses (historique) et GET /api/analyses/courbes
export const historiqueSchema = z.object({ tendance: slugSchema });
export const courbesSchema = z.object({
  tendances: z
    .string()
    .transform((v) => v.split(',').filter(Boolean))
    .pipe(z.array(slugSchema).min(1).max(3)),
  mois: z.coerce
    .number()
    .pipe(z.union([z.literal(6), z.literal(12), z.literal(24)])),
});

export const idSchema = z.coerce.number().int().positive();

// Corps de POST /api/analyses/:id/verdict/modification (US-26)
export const modificationSchema = z.object({
  verdict: z.enum(['buzz', 'durable']),
  justification: z.string().trim().min(10).max(500),
});

@Controller('analyses')
export class AnalysesController {
  constructor(private readonly analyses: AnalysesService) {}

  // POST /api/analyses { tendance: "pistache" } (US-14)
  @Post()
  lancer(
    @Body({ schema: lancementSchema }) body: z.infer<typeof lancementSchema>,
  ) {
    return this.analyses.lancer(body.tendance, body);
  }

  // GET /api/analyses?tendance=pistache : les analyses déjà faites (US-22)
  @Get()
  historique(
    @Query({ schema: historiqueSchema }) q: z.infer<typeof historiqueSchema>,
  ) {
    return this.analyses.historique(q.tendance);
  }

  // GET /api/analyses/courbes?tendances=pistache,dalgona&mois=12 (US-22)
  @Get('courbes')
  courbes(@Query({ schema: courbesSchema }) q: z.infer<typeof courbesSchema>) {
    return this.analyses.courbes(q.tendances, q.mois);
  }

  // GET /api/analyses/:id : interrogé chaque seconde par le front (ADR 0007)
  @Get(':id')
  obtenir(@Param('id', { schema: idSchema }) id: number) {
    return this.analyses.obtenir(id);
  }

  // POST /api/analyses/:id/verdict/validation (US-25)
  @Post(':id/verdict/validation')
  @HttpCode(200)
  @UseGuards(SessionGuard)
  valider(
    @Param('id', { schema: idSchema }) id: number,
    @Utilisateur() utilisateur: UtilisateurPublic,
  ) {
    return this.analyses.valider(id, utilisateur.nom);
  }

  // POST /api/analyses/:id/verdict/modification (US-26)
  @Post(':id/verdict/modification')
  @HttpCode(200)
  @UseGuards(SessionGuard)
  modifier(
    @Param('id', { schema: idSchema }) id: number,
    @Body({ schema: modificationSchema })
    body: z.infer<typeof modificationSchema>,
    @Utilisateur() utilisateur: UtilisateurPublic,
  ) {
    return this.analyses.modifier(id, body, utilisateur.nom);
  }
}
