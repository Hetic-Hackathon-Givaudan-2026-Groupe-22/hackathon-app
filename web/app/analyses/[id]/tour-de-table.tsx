'use client';

import { useEffect, useState } from 'react';
import type { Message } from '@/lib/analyse';
import {
  agentCible,
  ecart,
  positionsAuTour,
  RELATION,
  tourPrecedent,
  tourSuivant,
} from '@/lib/tour-de-table';

const PAS_MS = 2500;

// US-16 : le tour de table, lu tour par tour
export function TourDeTable({
  messages,
  onOuvrir,
}: {
  messages: Message[];
  onOuvrir?: (m: Message) => void;
}) {
  const dernier = messages.at(-1)?.tour ?? 1;
  const [tour, setTour] = useState(1);
  // Défilement automatique, sauf si l'appareil demande moins d'animations
  const [lectureDemandee, setLecture] = useState(
    () =>
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  // La lecture s'arrête d'elle-même au dernier tour
  const lecture = lectureDemandee && tour < dernier;

  useEffect(() => {
    if (!lecture) return;
    const t = setTimeout(() => setTour((c) => tourSuivant(c, dernier)), PAS_MS);
    return () => clearTimeout(t);
  }, [lecture, tour, dernier]);

  const visibles = messages.filter((m) => m.tour <= tour);
  const positions = positionsAuTour(messages, tour);

  return (
    <div className="flex flex-col gap-4" data-testid="tour-de-table">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn btn-sm"
          onClick={() => {
            setLecture(false);
            setTour(tourPrecedent(tour));
          }}
          disabled={tour <= 1}
        >
          Précédent
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setLecture(!lecture)}
          disabled={tour >= dernier}
        >
          {lecture ? 'Pause' : 'Lecture'}
        </button>
        <button
          className="btn btn-sm"
          onClick={() => {
            setLecture(false);
            setTour(tourSuivant(tour, dernier));
          }}
          disabled={tour >= dernier}
        >
          Suivant
        </button>
        <span className="text-sm opacity-70">
          Tour {tour} sur {dernier}
        </span>
      </div>

      <div className="rounded-box bg-base-100 p-4 shadow-sm">
        <div className="mb-2 flex justify-between text-xs opacity-70">
          <span>Buzz</span>
          <span>Écart entre agents : {ecart(positions)} points</span>
          <span>Durable</span>
        </div>
        <ul className="flex flex-col gap-1" aria-label="Positions des agents">
          {[...positions].map(([agent, position]) => (
            <li key={agent} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0">{agent}</span>
              <progress
                className="progress progress-secondary"
                value={position}
                max={100}
                aria-label={`${agent} : ${position} sur 100`}
              />
              <span className="w-8 text-right font-mono">{position}</span>
            </li>
          ))}
        </ul>
      </div>

      <ol className="flex flex-col gap-2" aria-live="polite">
        {visibles.map((m) => {
          const cible = agentCible(messages, m);
          return (
            <li key={m.tour}>
              <button
                className={`w-full rounded-box bg-base-100 p-3 text-left shadow-sm hover:bg-base-300 ${
                  m.tour === tour ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onOuvrir?.(m)}
              >
                <p className="text-sm">
                  <span className="font-semibold">{m.agent}</span>
                  <span className="opacity-70"> · tour {m.tour}</span>
                  {m.relation && cible && (
                    <span className="badge badge-sm badge-outline ml-2">
                      {RELATION[m.relation]} {cible}
                    </span>
                  )}
                </p>
                <p className="line-clamp-2">{m.contenu}</p>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
