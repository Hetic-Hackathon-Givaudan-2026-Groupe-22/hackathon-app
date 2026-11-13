'use client';

import { useTd } from '@/lib/traduction';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import type { Analyse } from '@/lib/analyse';
import { couleurFamille } from '@/lib/famille';
import { formatChrono, formatDateHeure } from '@/lib/format';
import { ListeAgents } from './liste-agents';
import { Rejouer } from './rejouer';
import { ResultatAnalyse } from './resultat-analyse';

// US-14 : suivi d'une analyse lancée, interrogée chaque seconde (ADR 0007)
export function SuiviAnalyse({
  id,
  vue = 'tour',
}: {
  id: string;
  vue?: 'tour' | 'verdict';
}) {
  const td = useTd();
  const locale = useLocale();
  const tr = useTranslations();
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [famille, setFamille] = useState<string>('');
  const [erreur, setErreur] = useState<string | null>(null);
  // Chronomètre local, recalé sur l'API à chaque réponse
  const [ecoule, setEcoule] = useState(0);
  const [rejeu, setRejeu] = useState(false);

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
          {tr('retour_aux_tendances')}
        </Link>
      </div>
    );
  if (!analyse) return <p className="note view">{tr('chargement')}</p>;

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
          <span className="tb-l">{tr('tendance_analysee')}</span>
          <span className="tb-n">
            <i className="dot" style={{ background: `rgb(${tc})` }} />
            {perimetre.tendance.nom}
          </span>
          <span className={`chip ${enCours ? 'wait' : 'go'}`}>
            {td(enCours ? 'Analyse en cours' : 'Analyse terminée')}
          </span>
          <span className="tb-r">
            {perimetre.marche} ·{' '}
            {analyse.parametres
              ? tr('periode_derniers_mois', {
                  n: analyse.parametres.periodeMois,
                })
              : perimetre.periode}{' '}
            {tr('lancee_le')} {formatDateHeure(analyse.demarreeLe, locale)}
            {analyse.parametres?.comparaisons.length
              ? ` · ${td('comparée à')} ${analyse.parametres.comparaisons.join(', ')}`
              : ''}
          </span>
          {analyse.mode === 'dummy' && (
            <span className="ph">{tr('analyse_simulee')}</span>
          )}
          <span
            className={`chrono${enCours ? '' : ' stop'}`}
            data-testid="chrono"
            aria-label={tr('chronometre')}
          >
            {formatChrono(ecoule)}
          </span>
          <span className="tb-b" style={{ display: 'flex', gap: 8 }}>
            <Link
              href={`/tendances/${perimetre.tendance.slug}`}
              className="btn sm ghost"
            >
              {tr('fiche_de_la_tendance')}
            </Link>
            {!enCours && (
              <button className="btn sm" onClick={() => setRejeu(true)}>
                {tr('rejouer_lanalyse')}
              </button>
            )}
          </span>
        </div>
      </div>

      <section className="view">
        <div className="eyebrow">
          {enCours
            ? `${analyse.agents.length} ${td('agents au travail')}`
            : td('Les agents ont terminé')}
        </div>
        <ListeAgents agents={analyse.agents} />
        {!enCours && (
          <ResultatAnalyse analyse={analyse} onMaj={setAnalyse} vue={vue} />
        )}
      </section>
      {rejeu && <Rejouer analyse={analyse} onFermer={() => setRejeu(false)} />}
    </>
  );
}
