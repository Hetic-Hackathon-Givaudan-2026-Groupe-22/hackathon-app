import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type UtilisateurPublic } from './auth.service.js';
import { COOKIE_SESSION, lireCookie } from './cookie.js';

type RequeteAuth = Request & { utilisateur?: UtilisateurPublic };

// Protège une route : 401 sans session valide (ADR 0012)
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<RequeteAuth>();
    const jeton = lireCookie(req.headers.cookie, COOKIE_SESSION);
    const utilisateur = await this.auth.utilisateurDeSession(jeton);
    if (!utilisateur) throw new UnauthorizedException('Connexion requise');
    req.utilisateur = utilisateur;
    return true;
  }
}

// @Utilisateur() : la personne connectée, posée par SessionGuard
export const Utilisateur = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<RequeteAuth>().utilisateur,
);
