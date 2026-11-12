'use client';

import type { TendanceResume } from '@/lib/api';
import { statutTendance } from '@/lib/famille';
import {
  type Filtres,
  nombreFiltresActifs,
  SANS_FILTRE,
  valeursDe,
} from '@/lib/filtres';

// US-11 : la barre de filtres du prototype ; le compte de résultats est annoncé
export function BarreFiltres({
  toutes,
  filtres,
  onChange,
  nombre,
}: {
  toutes: TendanceResume[];
  filtres: Filtres;
  onChange: (f: Filtres) => void;
  nombre: number;
}) {
  const actifs = nombreFiltresActifs(filtres);
  return (
    <div className="filters" role="toolbar" aria-label="Filtrer les tendances">
      <label className={`fbtn${filtres.famille ? ' on' : ''}`}>
        <span className="fl">Famille</span>
        <select
          value={filtres.famille}
          onChange={(e) => onChange({ ...filtres, famille: e.target.value })}
          className="fsel"
        >
          <option value="">Toutes</option>
          {valeursDe(toutes, 'famille').map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <label className={`fbtn${filtres.statut ? ' on' : ''}`}>
        <span className="fl">Statut</span>
        <select
          value={filtres.statut}
          onChange={(e) => onChange({ ...filtres, statut: e.target.value })}
          className="fsel"
        >
          <option value="">Tous</option>
          {valeursDe(toutes, 'statut').map((s) => (
            <option key={s} value={s}>
              {statutTendance(s).libelle}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className={`fbtn${filtres.suiviesSeulement ? ' on' : ''}`}
        aria-pressed={filtres.suiviesSeulement}
        onClick={() =>
          onChange({ ...filtres, suiviesSeulement: !filtres.suiviesSeulement })
        }
      >
        Suivies seulement
      </button>
      {actifs > 0 && (
        <button
          type="button"
          className="freset"
          onClick={() => onChange(SANS_FILTRE)}
        >
          Réinitialiser
        </button>
      )}
      <span className="fcount" role="status">
        <b>{nombre}</b> {nombre > 1 ? 'tendances' : 'tendance'}
      </span>
    </div>
  );
}
