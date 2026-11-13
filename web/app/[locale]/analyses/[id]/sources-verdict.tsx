import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import type { Analyse } from '@/lib/analyse';
import { sourcesDuVerdict } from '@/lib/raisons';

// US-32 : les sources sur lesquelles reposait le verdict, telles qu'enregistrées
export function SourcesVerdict({ analyse }: { analyse: Analyse }) {
  const td = useTd();
  const t = useTranslations();
  const sources = sourcesDuVerdict(analyse);
  return (
    <section
      className="card"
      aria-labelledby="titre-sources-verdict"
      style={{ marginTop: 16 }}
    >
      <h3 id="titre-sources-verdict">{t('sources_du_verdict')}</h3>
      {sources.length === 0 ? (
        <p className="note" style={{ margin: 0 }}>
          {t('source_a_completer_2')}
        </p>
      ) : (
        <ul className="sx-docs">
          {sources.map((s) => (
            <li key={`${s.titre}-${s.editeur}`}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  <b>{s.titre}</b>
                  <span>
                    {s.editeur} · {s.date} ·{' '}
                    {td(
                      s.verifiee
                        ? 'Source vérifiée'
                        : 'Donnée de démonstration',
                    )}
                  </span>
                  <i aria-hidden="true">↗</i>
                </a>
              ) : (
                <span
                  style={{
                    display: 'grid',
                    gap: 2,
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    padding: '10px 12px',
                  }}
                >
                  <b>{s.titre}</b>
                  <span className="note">
                    {s.editeur} · {s.date} ·{' '}
                    {td(
                      s.verifiee
                        ? 'Source vérifiée'
                        : 'Donnée de démonstration',
                    )}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
