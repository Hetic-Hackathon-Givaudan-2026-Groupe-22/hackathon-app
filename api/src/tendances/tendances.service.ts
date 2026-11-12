import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, ilike, or } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.module.js';
import { tendances } from '../db/schema.js';

// Échappe % et _ : le mot-clé est cherché tel quel (US-10)
export function motifRecherche(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

@Injectable()
export class TendancesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  // Liste des tendances : celles que Camille suit en tête, puis par nom (US-09),
  // filtrée par mot-clé sur le nom ou la famille (US-10)
  async lister(q?: string) {
    const filtre = q
      ? or(
          ilike(tendances.nom, motifRecherche(q)),
          ilike(tendances.famille, motifRecherche(q)),
        )
      : undefined;
    return this.db
      .select({
        slug: tendances.slug,
        nom: tendances.nom,
        famille: tendances.famille,
        statut: tendances.statut,
        dateDebut: tendances.dateDebut,
        suivie: tendances.suivie,
      })
      .from(tendances)
      .where(filtre)
      .orderBy(desc(tendances.suivie), asc(tendances.nom));
  }

  // Fiche complète d'une tendance (US-13)
  async trouver(slug: string) {
    const [tendance] = await this.db
      .select()
      .from(tendances)
      .where(eq(tendances.slug, slug));
    return tendance;
  }
}
