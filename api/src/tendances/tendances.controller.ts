import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { AuthService } from '../auth/auth.service.js';
import { COOKIE_SESSION, lireCookie } from '../auth/cookie.js';
import { TendancesService } from './tendances.service.js';

// Paramètres de GET /api/tendances, validés par Zod (ADR 0008)
export const rechercheSchema = z.object({
  q: z.string().trim().max(60).optional(),
});

// Identifiant d'une tendance dans l'URL : « pistache », « fleur-oranger »
export const slugSchema = z.string().regex(/^[a-z0-9-]{1,60}$/);

@Controller('tendances')
export class TendancesController {
  constructor(
    private readonly tendances: TendancesService,
    private readonly auth: AuthService,
  ) {}

  // La personne connectée, si elle l'est : ses tendances suivies passent en tête (US-06)
  private async idConnecte(req?: Request): Promise<number | undefined> {
    if (!req) return undefined;
    const u = await this.auth.utilisateurDeSession(
      lireCookie(req.headers.cookie, COOKIE_SESSION),
    );
    return u?.id;
  }

  // GET /api/tendances?q=mot-clé
  @Get()
  async lister(
    @Query({ schema: rechercheSchema }) query: z.infer<typeof rechercheSchema>,
    @Req() req?: Request,
  ) {
    return this.tendances.lister(
      query.q || undefined,
      await this.idConnecte(req),
    );
  }

  // GET /api/tendances/:slug : la fiche (US-13)
  @Get(':slug')
  async fiche(
    @Param('slug', { schema: slugSchema }) slug: string,
    @Req() req?: Request,
  ) {
    const tendance = await this.tendances.trouver(
      slug,
      await this.idConnecte(req),
    );
    if (!tendance) throw new NotFoundException('Tendance introuvable');
    return tendance;
  }
}
