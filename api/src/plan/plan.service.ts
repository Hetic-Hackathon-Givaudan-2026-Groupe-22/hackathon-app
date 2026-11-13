import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { AnalysesService } from '../analyses/analyses.service.js';
import { DRIZZLE, type Database } from '../database/database.module.js';
import { alertes, planEquipes } from '../db/schema.js';
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
  private async contexte(id: number): Promise<Contexte & { score: number }> {
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
      score: v.score,
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
      score: c.score,
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

  // US-28 : ajouter une équipe ; une équipe déjà présente n'est pas ajoutée deux fois
  async ajouterEquipe(id: number, equipe: string) {
    await this.contexte(id);
    if (!MODELES.some((m) => m.cle === equipe)) {
      throw new BadRequestException('Équipe inconnue');
    }
    const cles = await this.cles(id);
    if (cles.includes(equipe)) {
      throw new ConflictException('Cette équipe est déjà dans le plan.');
    }
    const nouvelles = [...cles, equipe];
    await this.db.transaction(async (tx) => {
      await tx.delete(planEquipes).where(eq(planEquipes.analyseId, id));
      await tx
        .insert(planEquipes)
        .values(
          nouvelles.map((e, ordre) => ({ analyseId: id, equipe: e, ordre })),
        );
    });
    return this.obtenir(id);
  }

  // US-29 : l'alerte n'est jamais envoyée pour de vrai ; elle est enregistrée (ADR 0015)
  async envoyerAlerte(
    id: number,
    envoi: {
      canal: 'email' | 'teams' | 'slack';
      destinataires: string[];
      lien: string;
    },
    envoyeePar: string,
  ) {
    const c = await this.contexte(id);
    const verdict = c.verdict === 'durable' ? 'Durable' : 'Buzz';
    const contenu = `Sillage · ${c.tendance} : ${verdict}, score ${c.score}/100. Analyse : ${envoi.lien}`;
    const destinataires = [...new Set(envoi.destinataires)];
    const [a] = await this.db
      .insert(alertes)
      .values({
        analyseId: id,
        canal: envoi.canal,
        destinataires,
        contenu,
        envoyeePar,
      })
      .returning();
    return {
      canal: a.canal,
      nombre: destinataires.length,
      contenu: a.contenu,
      envoyeeLe: a.envoyeeLe.toISOString(),
      simule: true,
    };
  }
}
