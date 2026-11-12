'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { Analyse } from '@/lib/analyse';
import { couleurFamille } from '@/lib/famille';
import { formatChrono } from '@/lib/format';
import { ListeAgents } from './liste-agents';
import { ResultatAnalyse } from './resultat-analyse';

// US-14 : suivi d'une analyse lancée, interrogée chaque seconde (ADR 0007)
export function SuiviAnalyse({ id }: { id: string }) {
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [famille, setFamille] = useState<string>('');
  const [erreur, setErreur] = useState<string | null>(null);
  // Chronomètre local, recalé sur l'API à chaque réponse
  const [ecoule, setEcoule] = useState(0);

  useEffect(() => {
    let fini = false;
    let minuteur: ReturnType<typeof setTimeout>;
    async function interroger() {
      try {
        const a = await apiGet<Analyse>(`/analyses/${encodeURIComponent(id)}`);
        setAnalyse(a);
        setEcoule(a.ecouleMs);
        setErreur(null);
        if (a.statut === 'terminee') fini = true;
      } catch (e) {
        setErreur((e as Error).message);
      }
      if (!fini) minuteur = setTimeout(interroger, 1000);
    }
    interroger();
    return () => {
      fini = true;
      clearTimeout(minuteur);
    };
  }, [id]);

  // Famille de la tendance, pour la couleur du bandeau
  const slug = analyse?.perimetre.tendance.slug;
  useEffect(() => {
    if (!slug) return;
    apiGet<{ famille: string }>(`/tendances/${slug}`)
      .then((t) => setFamille(t.famille))
      .catch(() => setFamille(''));
  }, [slug]);

  useEffect(() => {
    if (!analyse || analyse.statut === 'terminee') return;
    const t = setInterval(
      () => setEcoule((e) => Math.min(e + 100, analyse.dureeMs)),
      100,
    );
    return () => clearInterval(t);
  }, [analyse]);

  if (erreur && !analyse)
    return (
      <div className="empty view">
        {erreur}
        <Link href="/tendances" className="lnk">
          Retour aux tendances
        </Link>
      </div>
    );
  if (!analyse) return <p className="note view">Chargement…</p>;

  const { perimetre } = analyse;
  const enCours = analyse.statut === 'en_cours';
  const tc = couleurFamille(famille);

  return (
    <>
      <div
        className="trendbar gutter"
        style={{ '--tc': tc } as React.CSSProperties}
      >
        <div className="tb-in">
          <span className="tb-l">Tendance analysée</span>
          <span className="tb-n">
            <i className="dot" style={{ background: `rgb(${tc})` }} />
            {perimetre.tendance.nom}
          </span>
          <span className={`chip ${enCours ? 'wait' : 'go'}`}>
            {enCours ? 'Analyse en cours' : 'Analyse terminée'}
          </span>
          <span className="tb-r">
            {perimetre.marche} · {perimetre.periode}
          </span>
          {analyse.mode === 'dummy' && (
            <span className="ph">Analyse simulée</span>
          )}
          <span
            className={`chrono${enCours ? '' : ' stop'}`}
            data-testid="chrono"
            aria-label="Chronomètre"
          >
            {formatChrono(ecoule)}
          </span>
          <Link
            href={`/tendances/${perimetre.tendance.slug}`}
            className="btn sm ghost tb-b"
          >
            Fiche de la tendance
          </Link>
        </div>
      </div>

      <section className="view">
        <div className="eyebrow">
          {enCours
            ? `${analyse.agents.length} agents au travail`
            : 'Les agents ont terminé'}
        </div>
        <ListeAgents agents={analyse.agents} />
        {!enCours && <ResultatAnalyse analyse={analyse} onMaj={setAnalyse} />}
      </section>
    </>
  );
}
