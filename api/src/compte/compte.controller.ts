import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { slugSchema } from '../tendances/tendances.controller.js';
import { z } from 'zod';
import type { UtilisateurPublic } from '../auth/auth.service.js';
import { SessionGuard, Utilisateur } from '../auth/session.guard.js';
import { AnalysesService } from '../analyses/analyses.service.js';
import { CompteService, METIERS } from './compte.service.js';

// Corps de PATCH /api/moi (US-05), validé par Zod (ADR 0008)
export const profilSchema = z
  .object({
    metier: z.enum(METIERS).optional(),
    // US-07 : langue de l'interface, gardée à la reconnexion
    langue: z.enum(['fr', 'en']).optional(),
  })
  .refine((p) => p.metier !== undefined || p.langue !== undefined, {
    message: 'Rien à modifier',
  });

// Corps de PUT /api/moi/suivis (US-06)
export const suivisSchema = z.object({
  tendances: z.array(slugSchema).max(50),
});

// Corps de PUT /api/moi/mot-de-passe (US-04)
export const motDePasseSchema = z.object({
  ancien: z.string().min(1).max(200),
  nouveau: z.string().min(8).max(200),
  confirmation: z.string().max(200),
});

// Le compte de la personne connectée
@Controller('moi')
@UseGuards(SessionGuard)
export class CompteController {
  constructor(
    private readonly compte: CompteService,
    private readonly analyses: AnalysesService,
  ) {}

  // PATCH /api/moi : modifier son métier (US-05)
  @Patch()
  modifier(
    @Utilisateur() u: UtilisateurPublic,
    @Body({ schema: profilSchema }) body: z.infer<typeof profilSchema>,
  ) {
    return this.compte.modifierProfil(u.id, body);
  }

  // GET /api/moi/suivis : les tendances suivies (US-06)
  @Get('suivis')
  suivis(@Utilisateur() u: UtilisateurPublic) {
    return this.compte.suivis(u.id);
  }

  // PUT /api/moi/suivis { tendances: [...] } : remplace le choix (US-06)
  @Put('suivis')
  remplacerSuivis(
    @Utilisateur() u: UtilisateurPublic,
    @Body({ schema: suivisSchema }) body: z.infer<typeof suivisSchema>,
  ) {
    return this.compte.remplacerSuivis(u.id, body.tendances);
  }

  // PUT /api/moi/mot-de-passe (US-04) : 204 si le changement a réussi
  @Put('mot-de-passe')
  @HttpCode(204)
  async changerMotDePasse(
    @Utilisateur() u: UtilisateurPublic,
    @Body({ schema: motDePasseSchema }) body: z.infer<typeof motDePasseSchema>,
  ) {
    await this.compte.changerMotDePasse(u.id, body);
  }

  // GET /api/moi/decisions : mes décisions, la plus récente d'abord (US-30)
  @Get('decisions')
  decisions(@Utilisateur() u: UtilisateurPublic) {
    return this.analyses.decisions(u.id);
  }
}
