'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
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
  const td = useTd();
  const t = useTranslations();
  const actifs = nombreFiltresActifs(filtres);
  return (
    <div
      className="filters"
      role="toolbar"
      aria-label={t('filtrer_les_tendances')}
    >
      <label className={`fbtn${filtres.famille ? ' on' : ''}`}>
        <span className="fl">{t('famille')}</span>
        <select
          value={filtres.famille}
          onChange={(e) => onChange({ ...filtres, famille: e.target.value })}
          className="fsel"
        >
          <option value="">{t('toutes')}</option>
          {valeursDe(toutes, 'famille').map((f) => (
            <option key={f} value={f}>
              {td(f)}
            </option>
          ))}
        </select>
      </label>
      <label className={`fbtn${filtres.statut ? ' on' : ''}`}>
        <span className="fl">{t('statut')}</span>
        <select
          value={filtres.statut}
          onChange={(e) => onChange({ ...filtres, statut: e.target.value })}
          className="fsel"
        >
          <option value="">{t('tous')}</option>
          {valeursDe(toutes, 'statut').map((s) => (
            <option key={s} value={s}>
              {td(statutTendance(s).libelle)}
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
        {t('suivies_seulement')}
      </button>
      {actifs > 0 && (
        <button
          type="button"
          className="freset"
          onClick={() => onChange(SANS_FILTRE)}
        >
          {t('reinitialiser')}
        </button>
      )}
      <span className="fcount" role="status">
        <b>{nombre}</b> {td(nombre > 1 ? 'tendances' : 'tendance')}
      </span>
    </div>
  );
}
