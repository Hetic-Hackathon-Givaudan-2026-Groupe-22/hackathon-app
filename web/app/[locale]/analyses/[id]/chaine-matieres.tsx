import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import type { Analyse } from '@/lib/analyse';
import { etapesChaine } from '@/lib/chaine';

// US-20 : la chaîne tendance → notes olfactives → matières → prix, chaque maillon sourcé
export function ChaineMatieres({ analyse }: { analyse: Analyse }) {
  const td = useTd();
  const t = useTranslations();
  const etapes = etapesChaine(analyse);
  return (
    <div style={{ marginTop: 18 }}>
      <p className="lede" style={{ marginTop: 0 }}>
        {t('lisez_de_gauche_a_droite_la_tendance_se_relie_a')}
      </p>
      <div className="prog" aria-hidden="true">
        {etapes.map((e) => (
          <span key={td(e.titre)} className="on">
            {td(e.titre)}
          </span>
        ))}
      </div>
      <ol
        className="chain"
        aria-label={t('chaine_tendance_notes_matieres_prix')}
        style={{ listStyle: 'none', padding: 0 }}
      >
        {etapes.map((etape, i) => (
          <li key={td(etape.titre)} className="col">
            <span className="col-h">
              <span className="num">{i + 1}</span>
              {td(etape.titre)}
            </span>
            {etape.maillons.map((m) =>
              etape.titre === 'Prix' ? (
                <div key={m.nom} className="price">
                  <span className="note" style={{ color: 'inherit' }}>
                    {m.nom}
                  </span>
                  <b>{m.detail}</b>
                  <span style={{ fontSize: 12.5 }}>
                    {t('source')} {m.source}
                  </span>
                </div>
              ) : (
                <div key={m.nom} className="tc">
                  <b>{m.nom}</b>
                  <span>{m.detail}</span>
                  <span className="note">
                    {t('source')} {m.source}
                  </span>
                </div>
              ),
            )}
          </li>
        ))}
      </ol>

      {(analyse.chaine?.substituts ?? []).map((sub) => (
        <div key={sub.substitut} className="card" style={{ marginTop: 14 }}>
          <div className="eyebrow">
            {t('substitut_propose')} {sub.matiere}
          </div>
          <h3>{sub.substitut}</h3>
          <p style={{ margin: 0 }}>{sub.raison}</p>
          <p style={{ margin: 0 }}>
            {t('prix_2')}{' '}
            {sub.prix ?? (
              <span className="chip wait">{t('a_chiffrer_par_data')}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
