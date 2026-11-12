import type { Agent } from '@/lib/analyse';
import { STATUT_AGENT } from '@/lib/agents';

// US-15 : chaque agent avec son rôle et son statut
export function ListeAgents({ agents }: { agents: Agent[] }) {
  return (
    <ul
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Agents"
    >
      {agents.map((a) => (
        <li
          key={a.nom}
          className="flex items-start justify-between gap-3 rounded-box bg-base-100 p-3 shadow-sm"
        >
          <div>
            <p className="font-semibold">{a.nom}</p>
            <p className="text-sm opacity-70">{a.role}</p>
          </div>
          <span className={`badge ${STATUT_AGENT[a.statut].badge} shrink-0`}>
            {a.statut === 'en_cours' && (
              <span className="loading loading-spinner loading-xs" />
            )}
            {STATUT_AGENT[a.statut].libelle}
          </span>
        </li>
      ))}
    </ul>
  );
}
