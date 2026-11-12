import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { UtilisateurPublic } from '../auth/auth.service.js';
import { SessionGuard, Utilisateur } from '../auth/session.guard.js';
import { CompteService, METIERS } from './compte.service.js';

// Corps de PATCH /api/moi (US-05), validé par Zod (ADR 0008)
export const profilSchema = z.object({
  metier: z.enum(METIERS),
});

// Le compte de la personne connectée
@Controller('moi')
@UseGuards(SessionGuard)
export class CompteController {
  constructor(private readonly compte: CompteService) {}

  // PATCH /api/moi : modifier son métier (US-05)
  @Patch()
  modifier(
    @Utilisateur() u: UtilisateurPublic,
    @Body({ schema: profilSchema }) body: z.infer<typeof profilSchema>,
  ) {
    return this.compte.modifierProfil(u.id, body);
  }
}
