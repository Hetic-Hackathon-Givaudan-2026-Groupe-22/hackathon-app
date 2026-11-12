import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { idSchema } from '../analyses/analyses.controller.js';
import { SessionGuard } from '../auth/session.guard.js';
import { PlanService } from './plan.service.js';

@Controller('analyses/:id/plan')
@UseGuards(SessionGuard)
export class PlanController {
  constructor(private readonly plan: PlanService) {}

  // GET /api/analyses/:id/plan : 409 tant que le verdict n'est pas validé (US-27)
  @Get()
  obtenir(@Param('id', { schema: idSchema }) id: number) {
    return this.plan.obtenir(id);
  }
}
