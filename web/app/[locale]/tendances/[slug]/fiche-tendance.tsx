'use client';

import { useTd } from '@/lib/traduction';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { apiGet, type Tendance } from '@/lib/api';
import { couleurFamille, statutTendance } from '@/lib/famille';
import { formatMois } from '@/lib/format';
import { BoutonLancerAnalyse } from './bouton-lancer-analyse';

// US-13 : la fiche d'une tendance, pour juger si elle mérite une analyse
export function FicheTendance({ slug }: { slug: string }) {
  const td = useTd();
  const locale = useLocale();
  const t = useTranslations();
  const [tendance, setTendance] = useState<Tendance | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Tendance>(`/tendances/${encodeURIComponent(slug)}`)
      .then(setTendance)
      .catch((e: Error) => setErreur(e.message));
  }, [slug]);

  if (erreur)
    return (
      <div className="empty">
        {erreur}
        <Link href="/tendances" className="lnk">
          {t('retour_aux_tendances')}
        </Link>
      </div>
    );
  if (!tendance) return <p className="note">{t('chargement')}</p>;

  const statut = statutTendance(tendance.statut);

  return (
    <>
      <Link href="/tendances" className="lnk">
        {t('toutes_les_tendances')}
      </Link>
      <div className="head" style={{ marginTop: 14 }}>
        <div>
          <div className="eyebrow">
            {t('fiche_tendance_observee_depuis')}{' '}
            {formatMois(tendance.dateDebut, locale)}
          </div>
          <h2
            className="t"
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <i
              className="dot"
              style={{
                width: 16,
                height: 16,
                background: `rgb(${couleurFamille(tendance.famille)})`,
              }}
            />
            {tendance.nom}
          </h2>
          <div className="cl">
            <span className="chip off">{tendance.famille}</span>
            <span className={`chip ${statut.chip}`}>{td(statut.libelle)}</span>
            {tendance.suivie && <span className="chip go">{t('suivie')}</span>}
          </div>
          <p className="lede">{tendance.description}</p>
        </div>
      </div>

      <div className="eyebrow" style={{ marginTop: 22 }}>
        {t('signaux_cles')}
      </div>
      <div className="sig">
        {tendance.signaux.map((s) => (
          <div key={s.libelle} className="card">
            <span className="note">{s.libelle}</span>
            <span className="val">{s.valeur}</span>
            <span className="note">
              {t('source')} {s.source}{' '}
              {s.demo && (
                <span className="ph">{t('valeur_de_demonstration')}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <BoutonLancerAnalyse slug={tendance.slug} />
    </>
  );
}
