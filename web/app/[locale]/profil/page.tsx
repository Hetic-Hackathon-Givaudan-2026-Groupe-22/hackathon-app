'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { apiGet, apiPatch, apiPut } from '@/lib/api';
import { useSession, type Utilisateur } from '@/lib/session';
import { ChoixMetier } from '../choix-metier';
import { ChoixTendances } from '../choix-tendances';
import { ChangerMotDePasse } from './mot-de-passe';

// Le profil : métier (US-05), tendances suivies (US-06), mot de passe (US-04)
export default function Profil() {
  const td = useTd();
  const t = useTranslations();
  const { utilisateur, setUtilisateur } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [suivies, setSuivies] = useState<string[] | null>(null);

  useEffect(() => {
    apiGet<string[]>('/moi/suivis')
      .then(setSuivies)
      .catch(() => setSuivies([]));
  }, []);

  if (!utilisateur) return null;

  async function enregistrer(action: () => Promise<void>, ok: string) {
    setMessage(null);
    setErreur(null);
    try {
      await action();
      setMessage(ok);
    } catch (e) {
      setErreur((e as Error).message);
    }
  }

  return (
    <section className="view narrow" style={{ maxWidth: 880 }}>
      <div className="eyebrow">{t('mon_profil')}</div>
      <h2 className="t">{utilisateur.nom}</h2>
      <p className="lede">{utilisateur.email}</p>
      <p className="note" role="status" style={{ minHeight: 20 }}>
        {message}
      </p>
      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}

      <div className="mtabs" style={{ marginTop: 10 }}>
        <section>
          <h4>{t('metier')}</h4>
          <ChoixMetier
            valeur={utilisateur.metier}
            onChange={(metier) =>
              enregistrer(async () => {
                setUtilisateur(await apiPatch<Utilisateur>('/moi', { metier }));
              }, td('Métier enregistré.'))
            }
          />
        </section>

        <section>
          <h4>{t('tendances_suivies')}</h4>
          <p className="note" style={{ margin: 0 }}>
            {t('elles_apparaissent_en_premier_dans_la_vue_tendan')}
          </p>
          {suivies === null ? (
            <p className="note">{t('chargement')}</p>
          ) : (
            <ChoixTendances
              choisies={suivies}
              onChange={(slugs) =>
                enregistrer(async () => {
                  setSuivies(
                    await apiPut<string[]>('/moi/suivis', { tendances: slugs }),
                  );
                }, td('Tendances suivies enregistrées.'))
              }
            />
          )}
        </section>

        <section>
          <h4>{t('mot_de_passe')}</h4>
          <ChangerMotDePasse />
        </section>
      </div>
    </section>
  );
}
