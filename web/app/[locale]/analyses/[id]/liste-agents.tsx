import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import type { Agent } from '@/lib/analyse';
import { STATUT_AGENT } from '@/lib/agents';

// US-15 : chaque agent avec son rôle et son statut, en chaîne comme dans le prototype
export function ListeAgents({ agents }: { agents: Agent[] }) {
  const td = useTd();
  const t = useTranslations();
  return (
    <div className="pipe" role="list" aria-label={t('agents')}>
      {agents.map((a, i) => (
        <div
          key={a.nom}
          role="listitem"
          className={`st${a.statut === 'en_cours' ? ' on' : ''}${a.statut === 'termine' ? ' done' : ''}`}
        >
          <b>
            {i + 1} · {a.nom}
          </b>
          <span>{td(a.role)}</span>
          <em className={`stt ${STATUT_AGENT[a.statut].classe}`}>
            {td(STATUT_AGENT[a.statut].libelle)}
          </em>
        </div>
      ))}
    </div>
  );
}
