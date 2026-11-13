import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.module.js';
import {
  analyses,
  messages,
  sources,
  tendances,
  verdicts,
} from '../db/schema.js';
import { ANALYSE_PROVIDER, type AnalyseProvider } from './analyse-provider.js';
import { statutsAgents } from './agents.js';
import { courbeSimulee } from './courbe.js';

// Durée simulée d'une analyse ; ANALYSE_DUREE_MS=0 dans les tests
export function dureeAnalyseMs(): number {
  const v = Number(process.env.ANALYSE_DUREE_MS);
  return Number.isFinite(v) && v >= 0 ? v : 15_000;
}

@Injectable()
export class AnalysesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(ANALYSE_PROVIDER) private readonly provider: AnalyseProvider,
  ) {}

  // Lance l'analyse d'une tendance (US-14) : tout est produit et enregistré
  // tout de suite, puis révélé au fil du temps écoulé (ADR 0007)
  async lancer(
    slug: string,
    parametres: { periodeMois?: number; comparer?: string[] } = {},
  ): Promise<{ id: number }> {
    const [tendance] = await this.db
      .select()
      .from(tendances)
      .where(eq(tendances.slug, slug));
    if (!tendance) throw new NotFoundException('Tendance introuvable');
    const periodeMois = parametres.periodeMois ?? 24;
    const comparaisons = [...new Set(parametres.comparer ?? [])].filter(
      (c) => c !== slug,
    );
    if (comparaisons.length) {
      const trouvees = await this.db
        .select({ slug: tendances.slug })
        .from(tendances)
        .where(inArray(tendances.slug, comparaisons));
      if (trouvees.length !== comparaisons.length) {
        throw new NotFoundException('Tendance à comparer introuvable');
      }
    }

    const r = this.provider.analyser(tendance);
    return this.db.transaction(async (tx) => {
      const [analyse] = await tx
        .insert(analyses)
        .values({
          tendanceId: tendance.id,
          marche: r.marche,
          periode: `${periodeMois} derniers mois`,
          periodeMois,
          comparaisons,
          mode: r.mode,
          dureeMs: dureeAnalyseMs(),
          chaine: r.chaine,
        })
        .returning({ id: analyses.id });

      for (const m of r.messages) {
        const [msg] = await tx
          .insert(messages)
          .values({
            analyseId: analyse.id,
            tour: m.tour,
            agent: m.agent,
            repondA: m.repondA,
            relation: m.relation,
            contenu: m.contenu,
            statut: m.statut,
            position: m.position,
          })
          .returning({ id: messages.id });
        if (m.sources.length) {
          await tx
            .insert(sources)
            .values(m.sources.map((s) => ({ ...s, messageId: msg.id })));
        }
      }

      await tx.insert(verdicts).values({ analyseId: analyse.id, ...r.verdict });
      return { id: analyse.id };
    });
  }

  // État de l'analyse, interrogé chaque seconde par le front (ADR 0007)
  async obtenir(id: number) {
    const [ligne] = await this.db
      .select({ analyse: analyses, tendance: tendances })
      .from(analyses)
      .innerJoin(tendances, eq(analyses.tendanceId, tendances.id))
      .where(eq(analyses.id, id));
    if (!ligne) throw new NotFoundException('Analyse introuvable');
    const { analyse, tendance } = ligne;

    const ecouleMs = Math.max(0, Date.now() - analyse.demarreeLe.getTime());
    const terminee = ecouleMs >= analyse.dureeMs;
    const base = {
      id: analyse.id,
      mode: analyse.mode,
      perimetre: {
        tendance: { slug: tendance.slug, nom: tendance.nom },
        marche: analyse.marche,
        periode: analyse.periode,
      },
      demarreeLe: analyse.demarreeLe.toISOString(),
      parametres: {
        periodeMois: analyse.periodeMois,
        comparaisons: analyse.comparaisons,
      },
      dureeMs: analyse.dureeMs,
      ecouleMs: Math.min(ecouleMs, analyse.dureeMs),
      statut: terminee ? ('terminee' as const) : ('en_cours' as const),
      agents: statutsAgents(ecouleMs, analyse.dureeMs),
    };
    if (!terminee) return base;

    const msgs = await this.db
      .select()
      .from(messages)
      .where(eq(messages.analyseId, id))
      .orderBy(asc(messages.tour));
    const srcs = msgs.length
      ? await this.db
          .select()
          .from(sources)
          .where(
            inArray(
              sources.messageId,
              msgs.map((m) => m.id),
            ),
          )
          .orderBy(asc(sources.id))
      : [];
    const [verdict] = await this.db
      .select()
      .from(verdicts)
      .where(eq(verdicts.analyseId, id));

    return {
      ...base,
      messages: msgs.map((m) => ({
        tour: m.tour,
        agent: m.agent,
        repondA: m.repondA,
        relation: m.relation,
        contenu: m.contenu,
        statut: m.statut,
        position: m.position,
        sources: srcs
          .filter((s) => s.messageId === m.id)
          .map(({ titre, editeur, date, url, verifiee }) => ({
            titre,
            editeur,
            date,
            url,
            verifiee,
          })),
      })),
      chaine: analyse.chaine,
      verdict: {
        propose: verdict.propose,
        score: verdict.score,
        fiabilite: verdict.fiabilite,
        explicationFiabilite: verdict.explicationFiabilite,
        raisons: verdict.raisons,
        reserve: verdict.reserve,
        statut: verdict.statut,
        final: verdict.final,
        justification: verdict.justification,
        decidePar: verdict.decidePar,
        decideLe: verdict.decideLe?.toISOString() ?? null,
      },
    };
  }

  // Un verdict ne se décide qu'une fois l'analyse terminée, et une seule fois
  private async verdictADecider(id: number) {
    const analyse = await this.obtenir(id);
    if (analyse.statut !== 'terminee' || !('verdict' in analyse)) {
      throw new ConflictException(
        'Analyse en cours : verdict pas encore proposé',
      );
    }
    if (analyse.verdict.statut !== 'propose') {
      throw new ConflictException('Verdict déjà décidé');
    }
    return analyse.verdict;
  }

  // US-25 : Camille valide le verdict proposé ; il passe au statut « Validé », daté et signé
  async valider(id: number, decidePar: string, decideParId?: number) {
    await this.verdictADecider(id);
    await this.db
      .update(verdicts)
      .set({
        statut: 'valide',
        decidePar,
        decideParId,
        decideLe: new Date(),
      })
      .where(eq(verdicts.analyseId, id));
    return this.obtenir(id);
  }

  // US-26 : Camille remplace le verdict proposé, justification obligatoire ;
  // le verdict de Sillage reste enregistré à côté du sien
  async modifier(
    id: number,
    choix: { verdict: 'buzz' | 'durable'; justification: string },
    decidePar: string,
    decideParId?: number,
  ) {
    const propose = await this.verdictADecider(id);
    if (choix.verdict === propose.propose) {
      throw new BadRequestException(
        'Choisissez un verdict différent de celui proposé, ou validez-le',
      );
    }
    await this.db
      .update(verdicts)
      .set({
        statut: 'modifie',
        final: choix.verdict,
        justification: choix.justification,
        decidePar,
        decideParId,
        decideLe: new Date(),
      })
      .where(eq(verdicts.analyseId, id));
    return this.obtenir(id);
  }

  // US-22 : toutes les analyses d'une tendance, la plus récente d'abord ;
  // rejouer en crée une nouvelle, l'ancienne n'est jamais écrasée
  async historique(slug: string) {
    const lignes = await this.db
      .select({
        id: analyses.id,
        demarreeLe: analyses.demarreeLe,
        periodeMois: analyses.periodeMois,
        comparaisons: analyses.comparaisons,
      })
      .from(analyses)
      .innerJoin(tendances, eq(analyses.tendanceId, tendances.id))
      .where(eq(tendances.slug, slug))
      .orderBy(desc(analyses.demarreeLe), desc(analyses.id));
    return lignes.map((l) => ({
      ...l,
      demarreeLe: l.demarreeLe.toISOString(),
    }));
  }

  // US-22 : la courbe simulée de la tendance et de ses comparaisons
  async courbes(slugs: string[], mois: number) {
    const lignes = await this.db
      .select({
        slug: tendances.slug,
        nom: tendances.nom,
        statut: tendances.statut,
      })
      .from(tendances)
      .where(inArray(tendances.slug, slugs));
    return slugs
      .map((s) => lignes.find((l) => l.slug === s))
      .filter((l) => l !== undefined)
      .map((l) => ({
        slug: l.slug,
        nom: l.nom,
        points: courbeSimulee(l.slug, l.statut, mois),
      }));
  }

  // US-30 : les décisions d'une personne, de la plus récente à la plus ancienne
  async decisions(decideParId: number) {
    const lignes = await this.db
      .select({
        analyseId: analyses.id,
        slug: tendances.slug,
        nom: tendances.nom,
        propose: verdicts.propose,
        final: verdicts.final,
        statut: verdicts.statut,
        score: verdicts.score,
        justification: verdicts.justification,
        decidePar: verdicts.decidePar,
        decideLe: verdicts.decideLe,
      })
      .from(verdicts)
      .innerJoin(analyses, eq(verdicts.analyseId, analyses.id))
      .innerJoin(tendances, eq(analyses.tendanceId, tendances.id))
      .where(eq(verdicts.decideParId, decideParId))
      .orderBy(desc(verdicts.decideLe), desc(verdicts.id));
    return lignes.map((l) => ({
      analyseId: l.analyseId,
      tendance: { slug: l.slug, nom: l.nom },
      propose: l.propose,
      retenu: l.statut === 'modifie' && l.final ? l.final : l.propose,
      statut: l.statut,
      score: l.score,
      justification: l.justification,
      decidePar: l.decidePar,
      decideLe: l.decideLe?.toISOString() ?? null,
    }));
  }
}
