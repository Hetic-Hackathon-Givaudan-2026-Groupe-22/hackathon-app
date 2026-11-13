import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import {
  couleurFamille,
  ETEINT,
  LEGENDE_FAMILLES,
  LEGENDE_STATUTS,
} from '@/lib/famille';

// US-12 : sur le globe, chaque couleur nommée ; la couleur n'est jamais la seule information
export function LegendeGlobe() {
  const td = useTd();
  const t = useTranslations();
  return (
    <div className="legend" aria-label={t('legende_du_globe')}>
      {LEGENDE_FAMILLES.map((f) => (
        <span key={f}>
          <i
            className="dot"
            style={{ background: `rgb(${couleurFamille(f)})` }}
          />
          {td(f)}
        </span>
      ))}
      <span>
        <i className="dot" style={{ background: `rgb(${ETEINT})` }} />
        {t('en_baisse_trait_en_pointilles')}
      </span>
    </div>
  );
}

// US-12 : la pastille de statut, toujours écrite en texte
export function LegendeStatuts() {
  const td = useTd();
  const t = useTranslations();
  return (
    <p
      className="cl"
      aria-label={t('legende_des_statuts')}
      style={{ margin: 0 }}
    >
      <span className="note">{t('statuts')}</span>
      {LEGENDE_STATUTS.map((s) => (
        <span key={td(s.libelle)} className={`chip ${s.chip}`}>
          {td(s.libelle)}
        </span>
      ))}
    </p>
  );
}
