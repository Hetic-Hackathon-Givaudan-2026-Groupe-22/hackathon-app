'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGet, apiPost, type TendanceResume } from '@/lib/api';
import type { Analyse } from '@/lib/analyse';
import {
  basculerComparaison,
  cheminSvg,
  COMPARAISONS_MAX,
  type Courbe,
  moisCourt,
  PERIODES,
} from '@/lib/courbes';
import { couleurFamille } from '@/lib/famille';
import { formatDateHeure } from '@/lib/format';

type Passage = {
  id: number;
  demarreeLe: string;
  periodeMois: number;
  comparaisons: string[];
};

const L = 640;
const H = 220;
const COULEURS_COMPARAISON = ['150,156,172', '120,170,220'];

// US-22 : la fenêtre « Rejouer » du prototype : période, comparaisons, courbes,
// et les résultats précédents, jamais écrasés
export function Rejouer({
  analyse,
  onFermer,
}: {
  analyse: Analyse;
  onFermer: () => void;
}) {
  const router = useRouter();
  const slug = analyse.perimetre.tendance.slug;
  const [mois, setMois] = useState<number>(
    analyse.parametres?.periodeMois ?? 24,
  );
  const [comparer, setComparer] = useState<string[]>(
    analyse.parametres?.comparaisons ?? [],
  );
  const [tendances, setTendances] = useState<TendanceResume[]>([]);
  const [courbes, setCourbes] = useState<Courbe[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiGet<TendanceResume[]>('/tendances')
      .then(setTendances)
      .catch(() => undefined);
    apiGet<Passage[]>(`/analyses?tendance=${slug}`)
      .then(setPassages)
      .catch(() => undefined);
  }, [slug]);

  useEffect(() => {
    const liste = [slug, ...comparer].join(',');
    apiGet<Courbe[]>(`/analyses/courbes?tendances=${liste}&mois=${mois}`)
      .then(setCourbes)
      .catch(() => setCourbes([]));
  }, [slug, comparer, mois]);

  const couleur = (s: string) => {
    if (s === slug) {
      const t = tendances.find((x) => x.slug === s);
      return t ? couleurFamille(t.famille) : '23,26,33';
    }
    return COULEURS_COMPARAISON[comparer.indexOf(s)] ?? '150,156,172';
  };

  async function relancer() {
    setEnvoi(true);
    setErreur(null);
    try {
      const { id } = await apiPost<{ id: number }>('/analyses', {
        tendance: slug,
        periodeMois: mois,
        comparer,
      });
      onFermer();
      router.push(`/analyses/${id}`);
    } catch (e) {
      setErreur((e as Error).message);
      setEnvoi(false);
    }
  }

  const points = courbes[0]?.points ?? [];

  return (
    <div className="modal" role="presentation" onClick={onFermer}>
      <div
        className="mpanel rp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-rejouer"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onFermer()}
      >
        <div className="rp-h">
          <div>
            <div className="eyebrow">Rejouer la tendance</div>
            <h3 id="titre-rejouer">
              <i
                className="dot"
                style={{ background: `rgb(${couleur(slug)})` }}
              />
              {analyse.perimetre.tendance.nom}
            </h3>
            <p className="note" style={{ margin: '2px 0 0' }}>
              Changez la période ou comparez avec d&apos;autres tendances, puis
              relancez : le résultat actuel reste disponible.
            </p>
          </div>
          <button className="x" onClick={onFermer} autoFocus>
            Fermer
          </button>
        </div>

        <div className="rp-tools">
          <div className="rp-f">
            <span className="lab">Période</span>
            <div className="seg" role="group" aria-label="Période">
              {PERIODES.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={mois === p}
                  onClick={() => setMois(p)}
                >
                  {p} mois
                </button>
              ))}
            </div>
          </div>
          <div className="rp-f">
            <span className="lab">
              Comparer avec ({comparer.length}/{COMPARAISONS_MAX})
            </span>
            <div className="dests">
              {tendances
                .filter((t) => t.slug !== slug)
                .map((t) => {
                  const choisie = comparer.includes(t.slug);
                  return (
                    <button
                      key={t.slug}
                      type="button"
                      className="toggle"
                      aria-pressed={choisie}
                      disabled={!choisie && comparer.length >= COMPARAISONS_MAX}
                      onClick={() =>
                        setComparer(basculerComparaison(comparer, t.slug))
                      }
                    >
                      {t.nom}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="rp-chart" style={{ height: 'auto', padding: 12 }}>
          <svg
            viewBox={`0 0 ${L} ${H + 24}`}
            width="100%"
            role="img"
            aria-label={`Recherches en ligne sur ${mois} mois, données de démonstration`}
          >
            {[0, 50, 100].map((v) => (
              <line
                key={v}
                x1={0}
                x2={L}
                y1={H - (v / 100) * H}
                y2={H - (v / 100) * H}
                stroke="#E7E9EF"
              />
            ))}
            {courbes.map((c) => (
              <path
                key={c.slug}
                d={cheminSvg(c.points, L, H)}
                fill="none"
                stroke={`rgb(${couleur(c.slug)})`}
                strokeWidth={c.slug === slug ? 3 : 2}
                strokeDasharray={c.slug === slug ? undefined : '6 5'}
              />
            ))}
            {points.length > 0 && (
              <>
                <text x={0} y={H + 18} fontSize={12} fill="#676C7C">
                  {moisCourt(points[0].mois)}
                </text>
                <text
                  x={L}
                  y={H + 18}
                  fontSize={12}
                  fill="#676C7C"
                  textAnchor="end"
                >
                  {moisCourt(points.at(-1)!.mois)}
                </text>
              </>
            )}
          </svg>
        </div>
        <div className="rp-leg">
          {courbes.map((c) => (
            <span key={c.slug}>
              <i
                className={`ln${c.slug === slug ? '' : ' cmp'}`}
                style={{ borderColor: `rgb(${couleur(c.slug)})` }}
              />
              {c.nom}
            </span>
          ))}
          <span className="note">
            Recherches en ligne, données de démonstration
          </span>
        </div>

        {erreur && (
          <p className="hint" role="alert">
            {erreur}
          </p>
        )}
        <div className="foot" style={{ marginTop: 0 }}>
          <button className="btn" onClick={relancer} disabled={envoi}>
            {envoi ? 'Relance…' : 'Relancer l’analyse'}
          </button>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Résultats précédents
          </div>
          <ul className="sx-docs">
            {passages.map((p) => (
              <li key={p.id}>
                <Link href={`/analyses/${p.id}`} onClick={onFermer}>
                  <b>
                    {formatDateHeure(p.demarreeLe)}
                    {p.id === analyse.id ? ' · affiché' : ''}
                  </b>
                  <span>
                    {p.periodeMois} mois
                    {p.comparaisons.length
                      ? ` · comparé à ${p.comparaisons.join(', ')}`
                      : ''}
                  </span>
                  <i aria-hidden="true">›</i>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
