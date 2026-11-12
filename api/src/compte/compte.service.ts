import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
import { publier, type UtilisateurPublic } from '../auth/auth.service.js';
import { hacher, verifier } from '../auth/mot-de-passe.js';
import { DRIZZLE, type Database } from '../database/database.module.js';
import { suivis, tendances, utilisateurs } from '../db/schema.js';

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

  // US-06 : les tendances suivies, par identifiant (slug)
  async suivis(utilisateurId: number): Promise<string[]> {
    const lignes = await this.db
      .select({ slug: tendances.slug })
      .from(suivis)
      .innerJoin(tendances, eq(suivis.tendanceId, tendances.id))
      .where(eq(suivis.utilisateurId, utilisateurId))
      .orderBy(asc(tendances.nom));
    return lignes.map((l) => l.slug);
  }

  // Remplace la liste des tendances suivies ; une tendance inconnue est refusée
  async remplacerSuivis(utilisateurId: number, slugs: string[]) {
    const uniques = [...new Set(slugs)];
    const trouvees = uniques.length
      ? await this.db
          .select({ id: tendances.id, slug: tendances.slug })
          .from(tendances)
          .where(inArray(tendances.slug, uniques))
      : [];
    if (trouvees.length !== uniques.length) {
      throw new BadRequestException('Tendance inconnue');
    }
    await this.db.transaction(async (tx) => {
      await tx.delete(suivis).where(eq(suivis.utilisateurId, utilisateurId));
      if (trouvees.length) {
        await tx
          .insert(suivis)
          .values(trouvees.map((t) => ({ utilisateurId, tendanceId: t.id })));
      }
    });
    return this.suivis(utilisateurId);
  }

  // US-04 : l'ancien mot de passe d'abord, puis le nouveau deux fois
  async changerMotDePasse(
    id: number,
    saisie: { ancien: string; nouveau: string; confirmation: string },
  ): Promise<void> {
    if (saisie.nouveau !== saisie.confirmation) {
      throw new BadRequestException(
        'Les deux saisies du nouveau mot de passe diffèrent.',
      );
    }
    const [u] = await this.db
      .select({ motDePasse: utilisateurs.motDePasse })
      .from(utilisateurs)
      .where(eq(utilisateurs.id, id));
    if (!u || !(await verifier(saisie.ancien, u.motDePasse))) {
      throw new BadRequestException('Mot de passe actuel incorrect.');
    }
    await this.db
      .update(utilisateurs)
      .set({ motDePasse: await hacher(saisie.nouveau) })
      .where(eq(utilisateurs.id, id));
  }
}
