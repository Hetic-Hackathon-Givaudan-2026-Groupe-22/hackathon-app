import { Inject, Injectable } from '@nestjs/common';
import { asc, desc } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.module.js';
import { tendances } from '../db/schema.js';

@Injectable()
export class TendancesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  // Liste des tendances : celles que Camille suit en tête, puis par nom (US-09)
  async lister() {
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
      .orderBy(desc(tendances.suivie), asc(tendances.nom));
  }
}
