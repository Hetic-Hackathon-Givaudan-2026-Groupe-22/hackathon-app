'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { Analyse } from '@/lib/analyse';
import { formatChrono } from '@/lib/format';
import { ListeAgents } from './liste-agents';
import { ResultatAnalyse } from './resultat-analyse';

// US-14 : suivi d'une analyse lancée, interrogée chaque seconde (ADR 0007)
export function SuiviAnalyse({ id }: { id: string }) {
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
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

  useEffect(() => {
    if (!analyse || analyse.statut === 'terminee') return;
    const t = setInterval(
      () => setEcoule((e) => Math.min(e + 100, analyse.dureeMs)),
      100,
    );
    return () => clearInterval(t);
  }, [analyse]);

  if (erreur && !analyse)
    return <div className="alert alert-error">{erreur}</div>;
  if (!analyse) return <span className="loading loading-dots" />;

  const { perimetre } = analyse;
  const enCours = analyse.statut === 'en_cours';

  return (
    <>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/tendances">Tendances</Link>
          </li>
          <li>
            <Link href={`/tendances/${perimetre.tendance.slug}`}>
              {perimetre.tendance.nom}
            </Link>
          </li>
          <li>Analyse</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          Analyse : {perimetre.tendance.nom}
        </h1>
        {analyse.mode === 'dummy' && (
          <span className="badge badge-warning">Analyse simulée</span>
        )}
      </div>

      <div className="stats stats-vertical bg-base-100 shadow-sm sm:stats-horizontal">
        <div className="stat">
          <div className="stat-title">Tendance</div>
          <div className="stat-value text-lg">{perimetre.tendance.nom}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Marché</div>
          <div className="stat-value text-lg">{perimetre.marche}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Période</div>
          <div className="stat-value text-lg">{perimetre.periode}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Chronomètre</div>
          <div
            className="stat-value font-mono text-lg"
            aria-live="off"
            data-testid="chrono"
          >
            {formatChrono(ecoule)}
          </div>
          <div className="stat-desc">
            {enCours
              ? `${analyse.agents.length} agents au travail`
              : 'Analyse terminée'}
          </div>
        </div>
      </div>

      {enCours && (
        <progress
          className="progress progress-primary w-full"
          value={ecoule}
          max={analyse.dureeMs}
        />
      )}

      <ListeAgents agents={analyse.agents} />

      {!enCours && <ResultatAnalyse analyse={analyse} />}
    </>
  );
}
