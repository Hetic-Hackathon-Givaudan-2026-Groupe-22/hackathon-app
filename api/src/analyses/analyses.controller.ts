import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { UtilisateurPublic } from '../auth/auth.service.js';
import { SessionGuard, Utilisateur } from '../auth/session.guard.js';
import { z } from 'zod';
import { slugSchema } from '../tendances/tendances.controller.js';
import { AnalysesService } from './analyses.service.js';

// Corps de POST /api/analyses, validé par Zod (ADR 0008)
export const lancementSchema = z.object({ tendance: slugSchema });

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
    return this.analyses.lancer(body.tendance);
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
