import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';
import { AuthService, type UtilisateurPublic } from './auth.service.js';
import { COOKIE_SESSION, optionsCookie } from './cookie.js';
import { SessionGuard, Utilisateur } from './session.guard.js';

// Corps de POST /api/auth/inscription (US-02), validé par Zod (ADR 0008)
export const inscriptionSchema = z.object({
  nom: z.string().trim().min(1).max(80),
  email: z.email().max(200),
  motDePasse: z.string().min(8).max(200),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // POST /api/auth/inscription : crée le compte et ouvre la session
  @Post('inscription')
  async inscrire(
    @Body({ schema: inscriptionSchema })
    body: z.infer<typeof inscriptionSchema>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const utilisateur = await this.auth.inscrire(body);
    const jeton = await this.auth.ouvrirSession(utilisateur.id);
    res.cookie(COOKIE_SESSION, jeton, optionsCookie);
    return utilisateur;
  }

  // GET /api/auth/moi : la personne connectée, ou 401
  @Get('moi')
  @UseGuards(SessionGuard)
  moi(@Utilisateur() utilisateur: UtilisateurPublic) {
    return utilisateur;
  }
}
