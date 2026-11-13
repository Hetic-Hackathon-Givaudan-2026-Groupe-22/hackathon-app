import type { Analyse } from '@/lib/analyse';
import { formatDateHeure } from '@/lib/format';
import { libelleVerdict, verdictRetenu } from '@/lib/verdict';

// US-32 : un verdict déjà décidé s'ouvre avec sa date de décision en tête
export function EnteteDecision({ analyse }: { analyse: Analyse }) {
  const v = analyse.verdict;
  if (!v || v.statut === 'propose' || !v.decideLe) return null;
  return (
    <div
      className="decision"
      role="note"
      style={{ marginTop: 0, marginBottom: 16 }}
    >
      <span className="eyebrow">Verdict décidé le</span>
      <b className="mono" style={{ fontSize: 18 }}>
        {formatDateHeure(v.decideLe)}
      </b>
      <span
        className={`chip ${verdictRetenu(v) === 'durable' ? 'go' : 'risk'}`}
      >
        {v.statut === 'valide' ? 'Validé' : 'Modifié'} :{' '}
        {libelleVerdict(verdictRetenu(v))}
      </span>
      <span className="note">
        par {v.decidePar} · affiché tel qu&apos;il a été enregistré, avec ses
        sources
      </span>
    </div>
  );
}
