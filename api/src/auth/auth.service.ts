import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.module.js';
import { sessions, utilisateurs } from '../db/schema.js';
import { DUREE_SESSION_MS } from './cookie.js';
import { hacher, verifier } from './mot-de-passe.js';

export type UtilisateurPublic = {
  id: number;
  email: string;
  nom: string;
  metier: string | null;
  langue: string;
};

// Empreinte factice : sans compte, on vérifie quand même, pour un temps de réponse égal
let empreinteFactice: Promise<string> | undefined;

const empreinte = (jeton: string) =>
  createHash('sha256').update(jeton).digest('hex');

export function publier(
  u: typeof utilisateurs.$inferSelect,
): UtilisateurPublic {
  return {
    id: u.id,
    email: u.email,
    nom: u.nom,
    metier: u.metier,
    langue: u.langue,
  };
}

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  // US-02 : créer un compte ; un e-mail ne sert qu'une fois
  async inscrire(donnees: {
    nom: string;
    email: string;
    motDePasse: string;
  }): Promise<UtilisateurPublic> {
    const email = donnees.email.toLowerCase();
    const [existant] = await this.db
      .select({ id: utilisateurs.id })
      .from(utilisateurs)
      .where(eq(utilisateurs.email, email));
    if (existant) {
      throw new ConflictException(
        'Un compte existe déjà avec cet e-mail : connectez-vous.',
      );
    }
    const [cree] = await this.db
      .insert(utilisateurs)
      .values({
        nom: donnees.nom,
        email,
        motDePasse: await hacher(donnees.motDePasse),
      })
      .returning();
    return publier(cree);
  }

  // Ouvre une session : le jeton part dans le cookie, seule son empreinte est en base
  async ouvrirSession(utilisateurId: number): Promise<string> {
    const jeton = randomBytes(32).toString('base64url');
    await this.db.insert(sessions).values({
      id: empreinte(jeton),
      utilisateurId,
      expireLe: new Date(Date.now() + DUREE_SESSION_MS),
    });
    return jeton;
  }

  async utilisateurDeSession(
    jeton: string | undefined,
  ): Promise<UtilisateurPublic | null> {
    if (!jeton) return null;
    const [ligne] = await this.db
      .select({ u: utilisateurs })
      .from(sessions)
      .innerJoin(utilisateurs, eq(sessions.utilisateurId, utilisateurs.id))
      .where(
        and(
          eq(sessions.id, empreinte(jeton)),
          gt(sessions.expireLe, new Date()),
        ),
      );
    return ligne ? publier(ligne.u) : null;
  }

  async fermerSession(jeton: string | undefined): Promise<void> {
    if (!jeton) return;
    await this.db.delete(sessions).where(eq(sessions.id, empreinte(jeton)));
  }

  // US-03 : un seul message, que l'e-mail ou le mot de passe soit faux
  async authentifier(
    email: string,
    motDePasse: string,
  ): Promise<UtilisateurPublic> {
    const [u] = await this.db
      .select()
      .from(utilisateurs)
      .where(eq(utilisateurs.email, email.toLowerCase()));
    empreinteFactice ??= hacher('compte-inexistant');
    const ok = await verifier(
      motDePasse,
      u?.motDePasse ?? (await empreinteFactice),
    );
    if (!u || !ok) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect.');
    }
    return publier(u);
  }
}
