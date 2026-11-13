'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { apiPatch, apiPut } from '@/lib/api';
import { useSession, type Utilisateur } from '@/lib/session';
import { ChoixMetier } from '../choix-metier';
import { ChoixTendances } from '../choix-tendances';
import { Comete } from '../logo';

// Onboarding repris du prototype, juste après la création du compte
// Étape 1 : le métier (US-05) ; étape 2 : les tendances à suivre (US-06)
export default function Onboarding() {
  const td = useTd();
  const t = useTranslations();
  const router = useRouter();
  const { utilisateur, setUtilisateur } = useSession();
  const [etape, setEtape] = useState<1 | 2>(1);
  const [metier, setMetier] = useState<string | null>(
    utilisateur?.metier ?? null,
  );
  const [choisies, setChoisies] = useState<string[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function validerMetier() {
    if (!metier) return;
    setEnvoi(true);
    setErreur(null);
    try {
      setUtilisateur(await apiPatch<Utilisateur>('/moi', { metier }));
      setEtape(2);
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  async function validerTendances() {
    setEnvoi(true);
    setErreur(null);
    try {
      await apiPut('/moi/suivis', { tendances: choisies });
      router.push('/tendances');
    } catch (e) {
      setErreur((e as Error).message);
      setEnvoi(false);
    }
  }

  return (
    <section className="view narrow" style={{ maxWidth: 880 }}>
      <div className="logo" style={{ marginBottom: 18 }}>
        <Comete />
        Sillage
      </div>
      <div className="obsteps">
        <span className={etape === 1 ? 'on' : ''}>{t('1_votre_metier')}</span>
        <span className={etape === 2 ? 'on' : ''}>{t('2_vos_tendances')}</span>
      </div>

      {etape === 1 && (
        <>
          <div className="eyebrow">{t('bienvenue_sur_sillage')}</div>
          <h2 className="t">
            {t('parlez_nous_de_vous')} {utilisateur?.nom.split(' ')[0]}
          </h2>
          <p className="lede">
            {t('sillage_adapte_les_tendances_et_les_plans_d_acti')}
          </p>
          <ChoixMetier valeur={metier} onChange={setMetier} />
          <div className="foot">
            <button
              className="btn"
              onClick={validerMetier}
              disabled={!metier || envoi}
            >
              {t('continuer')} <span aria-hidden="true">›</span>
            </button>
          </div>
        </>
      )}

      {etape === 2 && (
        <>
          <div className="eyebrow">{t('derniere_etape')}</div>
          <h2 className="t">{t('quelles_tendances_voulez_vous_suivre')}</h2>
          <p className="lede">
            {t('elles_apparaitront_en_premier_dans_la_vue_tendan')}
          </p>
          <div style={{ marginTop: 18 }}>
            <ChoixTendances choisies={choisies} onChange={setChoisies} />
          </div>
          <div className="foot">
            <button
              className="btn ghost"
              onClick={() => router.push('/tendances')}
            >
              {t('passer_cette_etape')}
            </button>
            <button
              className="btn"
              onClick={validerTendances}
              disabled={choisies.length === 0 || envoi}
            >
              {t('suivre')} {choisies.length || ''}{' '}
              {td(choisies.length > 1 ? 'tendances' : 'tendance')}{' '}
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </>
      )}

      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}
    </section>
  );
}
