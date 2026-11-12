import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { AnalysesService } from '../analyses/analyses.service.js';
import { DRIZZLE, type Database } from '../database/database.module.js';
import { planEquipes } from '../db/schema.js';
import {
  construireEquipe,
  type Contexte,
  EQUIPES_PAR_DEFAUT,
  MODELES,
} from './equipes.js';

@Injectable()
export class PlanService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly analyses: AnalysesService,
  ) {}

  // Le plan n'existe qu'après un verdict validé ou modifié (US-27)
  private async contexte(id: number): Promise<Contexte> {
    const a = await this.analyses.obtenir(id);
    const v = 'verdict' in a ? a.verdict : null;
    if (!v || v.statut === 'propose' || !v.decideLe) {
      throw new ConflictException(
        "Validez d'abord le verdict pour ouvrir le plan d'action.",
      );
    }
    return {
      tendance: a.perimetre.tendance.nom,
      verdict: (v.statut === 'modifie' && v.final ? v.final : v.propose) as
        'buzz' | 'durable',
      matiere:
        ('chaine' in a ? a.chaine.matieres[0]?.nom : undefined) ??
        a.perimetre.tendance.nom,
      substitut:
        ('chaine' in a ? a.chaine.substituts?.[0]?.substitut : undefined) ??
        null,
      decideLe: new Date(v.decideLe),
    };
  }

  private async cles(id: number): Promise<string[]> {
    const lignes = await this.db
      .select({ equipe: planEquipes.equipe })
      .from(planEquipes)
      .where(eq(planEquipes.analyseId, id))
      .orderBy(asc(planEquipes.ordre));
    return lignes.length ? lignes.map((l) => l.equipe) : EQUIPES_PAR_DEFAUT;
  }

  // US-27 : les actions regroupées par équipe
  async obtenir(id: number) {
    const c = await this.contexte(id);
    const cles = await this.cles(id);
    return {
      tendance: c.tendance,
      verdict: c.verdict,
      decideLe: c.decideLe.toISOString(),
      equipes: cles
        .map((k) => construireEquipe(k, c))
        .filter((e) => e !== null),
      disponibles: MODELES.filter((m) => !cles.includes(m.cle)).map((m) => ({
        cle: m.cle,
        nom: m.nom,
      })),
    };
  }
}
