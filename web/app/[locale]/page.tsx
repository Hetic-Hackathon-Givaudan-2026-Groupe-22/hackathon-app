import { useTranslations } from 'next-intl';
import { Acces } from './acces';
import { ChoixLangue } from './choix-langue';
import { ApiStatus } from './api-status';
import { Comete } from './logo';

// Ouverture, reprise du prototype : accroche et accès au compte
export default function Accueil() {
  const t = useTranslations();
  return (
    <section className="intro-page" aria-label={t('ouverture')}>
      <div className="langue-accueil">
        <ChoixLangue />
      </div>
      <div className="intro-in">
        <div className="brand" aria-label="Sillage">
          <Comete taille={64} anime />
          <span>sillage</span>
        </div>
        <h1>{t('avant_qu_une_tendance_arrive_elle_laisse_un_sill')}</h1>
        <p>{t('sillage_repere_les_tendances_suit_leur_trace_jus')}</p>
        <Acces />
        <p className="note">
          {t('demonstration_les_analyses_sont_simulees_par_l_a')}
        </p>
        <ApiStatus />
      </div>
    </section>
  );
}
