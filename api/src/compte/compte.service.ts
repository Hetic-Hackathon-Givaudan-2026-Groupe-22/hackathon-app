import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { publier, type UtilisateurPublic } from '../auth/auth.service.js';
import { DRIZZLE, type Database } from '../database/database.module.js';
import { utilisateurs } from '../db/schema.js';

// Les métiers proposés à l'onboarding et dans le profil (US-05)
export const METIERS = [
  'Consumer Insights',
  'Marketing',
  'Achats',
  'Aromaticien',
  'Parfumeur',
  'Développement produit',
  'Direction',
] as const;

@Injectable()
export class CompteService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async modifierProfil(
    id: number,
    modif: { metier: string },
  ): Promise<UtilisateurPublic> {
    const [u] = await this.db
      .update(utilisateurs)
      .set({ metier: modif.metier })
      .where(eq(utilisateurs.id, id))
      .returning();
    return publier(u);
  }
}
