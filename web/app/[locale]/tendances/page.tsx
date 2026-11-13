import { useTranslations } from 'next-intl';
import { ListeTendances } from './liste-tendances';

export const metadata = { title: 'Tendances · Sillage' };

export default function PageTendances() {
  const t = useTranslations();
  return (
    <section className="view">
      <div className="head">
        <div>
          <div className="eyebrow">
            {t('veille_en_continu_donnees_de_demonstration')}
          </div>
          <h2 className="t">{t('les_tendances_du_moment')}</h2>
          <p className="lede">
            {t('chaque_tendance_porte_la_couleur_de_sa_famille_d')}
          </p>
        </div>
      </div>
      <ListeTendances />
    </section>
  );
}
