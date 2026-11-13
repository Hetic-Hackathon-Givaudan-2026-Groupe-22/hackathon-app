import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { idSchema } from '../analyses/analyses.controller.js';
import { SessionGuard } from '../auth/session.guard.js';
import { PlanService } from './plan.service.js';

// Corps de POST /api/analyses/:id/plan/equipes (US-28)
export const ajoutEquipeSchema = z.object({
  equipe: z.string().regex(/^[a-z]{2,30}$/),
});

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
}
