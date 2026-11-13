import { useTd } from '@/lib/traduction';
import { useLocale, useTranslations } from 'next-intl';
import type { Analyse } from '@/lib/analyse';
import { formatDateHeure } from '@/lib/format';
import { libelleVerdict, verdictRetenu } from '@/lib/verdict';

// US-32 : un verdict déjà décidé s'ouvre avec sa date de décision en tête
export function EnteteDecision({ analyse }: { analyse: Analyse }) {
  const td = useTd();
  const locale = useLocale();
  const t = useTranslations();
  const v = analyse.verdict;
  if (!v || v.statut === 'propose' || !v.decideLe) return null;
  return (
    <div
      className="decision"
      role="note"
      style={{ marginTop: 0, marginBottom: 16 }}
    >
      <span className="eyebrow">{t('verdict_decide_le')}</span>
      <b className="mono" style={{ fontSize: 18 }}>
        {formatDateHeure(v.decideLe, locale)}
      </b>
      <span
        className={`chip ${verdictRetenu(v) === 'durable' ? 'go' : 'risk'}`}
      >
        {td(v.statut === 'valide' ? 'Validé' : 'Modifié')} :{' '}
        {td(libelleVerdict(verdictRetenu(v)))}
      </span>
      <span className="note">
        {t('par')} {v.decidePar}{' '}
        {t('affiche_tel_qu_il_a_ete_enregistre_avec_ses_sour')}
      </span>
    </div>
  );
}
