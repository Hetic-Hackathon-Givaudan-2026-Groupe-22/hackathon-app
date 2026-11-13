import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { idSchema } from '../analyses/analyses.controller.js';
import type { UtilisateurPublic } from '../auth/auth.service.js';
import { SessionGuard, Utilisateur } from '../auth/session.guard.js';
import { PlanService } from './plan.service.js';

// Corps de POST /api/analyses/:id/plan/equipes (US-28)
export const ajoutEquipeSchema = z.object({
  equipe: z.string().regex(/^[a-z]{2,30}$/),
});

// Corps de POST /api/analyses/:id/plan/alertes (US-29)
export const alerteSchema = z
  .object({
    canal: z.enum(['email', 'teams', 'slack']),
    destinataires: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
    lien: z.url().max(300),
  })
  .refine(
    (a) =>
      a.canal !== 'email' ||
      a.destinataires.every((d) => z.email().safeParse(d).success),
    { message: 'Adresse e-mail mal formée', path: ['destinataires'] },
  );

@Controller('analyses/:id/plan')
@UseGuards(SessionGuard)
export class PlanController {
  constructor(private readonly plan: PlanService) {}

  // GET /api/analyses/:id/plan : 409 tant que le verdict n'est pas validé (US-27)
  @Get()
  obtenir(@Param('id', { schema: idSchema }) id: number) {
    return this.plan.obtenir(id);
  }

  // POST /api/analyses/:id/plan/equipes { equipe } (US-28) : 409 si elle y est déjà
  @Post('equipes')
  ajouter(
    @Param('id', { schema: idSchema }) id: number,
    @Body({ schema: ajoutEquipeSchema })
    body: z.infer<typeof ajoutEquipeSchema>,
  ) {
    return this.plan.ajouterEquipe(id, body.equipe);
  }

  // POST /api/analyses/:id/plan/alertes (US-29) : envoi simulé, enregistré
  @Post('alertes')
  envoyer(
    @Param('id', { schema: idSchema }) id: number,
    @Body({ schema: alerteSchema }) body: z.infer<typeof alerteSchema>,
    @Utilisateur() u: UtilisateurPublic,
  ) {
    return this.plan.envoyerAlerte(id, body, u.nom);
  }
}
