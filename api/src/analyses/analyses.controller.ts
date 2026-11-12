import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { slugSchema } from '../tendances/tendances.controller.js';
import { AnalysesService } from './analyses.service.js';

// Corps de POST /api/analyses, validé par Zod (ADR 0008)
export const lancementSchema = z.object({ tendance: slugSchema });

export const idSchema = z.coerce.number().int().positive();

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
  valider(@Param('id', { schema: idSchema }) id: number) {
    return this.analyses.valider(id);
  }
}
