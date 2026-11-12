import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService, type UtilisateurPublic } from './auth.service.js';
import { COOKIE_SESSION, lireCookie, optionsCookie } from './cookie.js';
import { SessionGuard, Utilisateur } from './session.guard.js';

// Corps de POST /api/auth/inscription (US-02), validé par Zod (ADR 0008)
export const inscriptionSchema = z.object({
  nom: z.string().trim().min(1).max(80),
  email: z.email().max(200),
  motDePasse: z.string().min(8).max(200),
});

// Corps de POST /api/auth/connexion (US-03) : pas de règle de forme, pour ne rien révéler
export const connexionSchema = z.object({
  email: z.string().trim().max(200),
  motDePasse: z.string().max(200),
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

  // POST /api/auth/connexion : 401 avec un message unique si l'un des deux est faux
  @Post('connexion')
  @HttpCode(200)
  async connecter(
    @Body({ schema: connexionSchema }) body: z.infer<typeof connexionSchema>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const utilisateur = await this.auth.authentifier(
      body.email,
      body.motDePasse,
    );
    const jeton = await this.auth.ouvrirSession(utilisateur.id);
    res.cookie(COOKIE_SESSION, jeton, optionsCookie);
    return utilisateur;
  }

  // POST /api/auth/deconnexion : la session est supprimée en base
  @Post('deconnexion')
  @HttpCode(204)
  async deconnecter(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.fermerSession(
      lireCookie(req.headers.cookie, COOKIE_SESSION),
    );
    res.clearCookie(COOKIE_SESSION, { path: '/' });
  }

  // GET /api/auth/moi : la personne connectée, ou 401
  @Get('moi')
  @UseGuards(SessionGuard)
  moi(@Utilisateur() utilisateur: UtilisateurPublic) {
    return utilisateur;
  }
}
