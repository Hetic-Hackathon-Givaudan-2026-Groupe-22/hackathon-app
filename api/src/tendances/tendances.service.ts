import { Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.module.js';
import { suivis, tendances } from '../db/schema.js';

// Échappe % et _ : le mot-clé est cherché tel quel (US-10)
export function motifRecherche(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

// « suivie » : choisie par la personne connectée (US-06) ; sans compte, la valeur de démonstration
function suivie(utilisateurId?: number): SQL<boolean> {
  return utilisateurId
    ? sql<boolean>`exists (select 1 from ${suivis} where ${suivis.tendanceId} = ${tendances.id} and ${suivis.utilisateurId} = ${utilisateurId})`
    : sql<boolean>`${tendances.suivie}`;
}

@Injectable()
export class TendancesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  // Liste des tendances : celles que Camille suit en tête, puis par nom (US-09),
  // filtrée par mot-clé sur le nom ou la famille (US-10)
  async lister(q?: string, utilisateurId?: number) {
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
        suivie: suivie(utilisateurId),
      })
      .from(tendances)
      .where(filtre)
      .orderBy(desc(suivie(utilisateurId)), asc(tendances.nom));
  }

  // Fiche complète d'une tendance (US-13)
  async trouver(slug: string, utilisateurId?: number) {
    const [ligne] = await this.db
      .select({ t: tendances, suivie: suivie(utilisateurId) })
      .from(tendances)
      .where(eq(tendances.slug, slug));
    return ligne ? { ...ligne.t, suivie: ligne.suivie } : undefined;
  }
}
