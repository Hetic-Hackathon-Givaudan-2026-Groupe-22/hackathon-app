'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { formatDateHeure } from '@/lib/format';
import { type Decision, ecartStratege } from '@/lib/historique';
import { libelleVerdict } from '@/lib/verdict';

// US-30 : l'historique des décisions, repris du prototype (« Mémoire de l'équipe »)
export default function Historique() {
  const [decisions, setDecisions] = useState<Decision[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Decision[]>('/moi/decisions')
      .then(setDecisions)
      .catch((e: Error) => setErreur(e.message));
  }, []);

  return (
    <section className="view narrow">
      <div className="eyebrow">Mémoire de l&apos;équipe</div>
      <h2 className="t">Historique de mes décisions</h2>
      <p className="lede">
        Chaque verdict validé ou modifié, du plus récent au plus ancien.
      </p>

      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}
      {!erreur && !decisions && <p className="note">Chargement…</p>}

      {decisions && decisions.length === 0 && (
        <div className="empty" style={{ marginTop: 18 }}>
          Vous n&apos;avez encore validé aucun verdict.
          <Link href="/tendances" className="btn">
            Analyser une tendance
          </Link>
        </div>
      )}

      {decisions && decisions.length > 0 && (
        <div className="card hist">
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tendance</th>
                  <th>Décision</th>
                  <th>Écart avec le Stratège</th>
                  <th>Raison</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d) => (
                  <tr key={d.analyseId}>
                    <td className="mono">{formatDateHeure(d.decideLe)}</td>
                    <td>
                      <Link href={`/analyses/${d.analyseId}`} className="lnk">
                        {d.tendance.nom}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`chip ${d.retenu === 'durable' ? 'go' : 'risk'}`}
                      >
                        {libelleVerdict(d.retenu)}
                      </span>
                    </td>
                    <td>{ecartStratege(d)}</td>
                    <td className="note">{d.justification ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
