import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
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
  async lancer(slug: string): Promise<{ id: number }> {
    const [tendance] = await this.db
      .select()
      .from(tendances)
      .where(eq(tendances.slug, slug));
    if (!tendance) throw new NotFoundException('Tendance introuvable');

    const r = this.provider.analyser(tendance);
    return this.db.transaction(async (tx) => {
      const [analyse] = await tx
        .insert(analyses)
        .values({
          tendanceId: tendance.id,
          marche: r.marche,
          periode: r.periode,
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
}
