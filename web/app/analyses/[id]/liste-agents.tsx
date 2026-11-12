import type { Agent } from '@/lib/analyse';
import { STATUT_AGENT } from '@/lib/agents';

// US-15 : chaque agent avec son rôle et son statut, en chaîne comme dans le prototype
export function ListeAgents({ agents }: { agents: Agent[] }) {
  return (
    <div className="pipe" role="list" aria-label="Agents">
      {agents.map((a, i) => (
        <div
          key={a.nom}
          role="listitem"
          className={`st${a.statut === 'en_cours' ? ' on' : ''}${a.statut === 'termine' ? ' done' : ''}`}
        >
          <b>
            {i + 1} · {a.nom}
          </b>
          <span>{a.role}</span>
          <em className={`stt ${STATUT_AGENT[a.statut].classe}`}>
            {STATUT_AGENT[a.statut].libelle}
          </em>
        </div>
      ))}
    </div>
  );
}
