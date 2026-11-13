'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Message } from '@/lib/analyse';
import { couleurAgent, sieges } from '@/lib/agents';
import {
  agentCible,
  ecart,
  positionsAuTour,
  RELATION,
  tourPrecedent,
  tourSuivant,
} from '@/lib/tour-de-table';

const PAS_MS = 2500;

// US-16 : le tour de table, lu tour par tour, autour de la table du prototype
export function TourDeTable({
  messages,
  onOuvrir,
}: {
  messages: Message[];
  onOuvrir?: (m: Message) => void;
}) {
  const td = useTd();
  const tr = useTranslations();
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
  const courant = messages.find((m) => m.tour === tour);
  const positions = positionsAuTour(messages, tour);
  const agents = [...new Set(messages.map((m) => m.agent))];
  const places = sieges(agents.length);

  return (
    <div className="g2" data-testid="tour-de-table">
      <div className="box roombox">
        <div className="rt" aria-label={tr('tour_de_table_des_agents')}>
          <div className="table">
            <span className="eyebrow">
              {tr('tour_3')} {tour} {tr('sur')} {dernier}
            </span>
            {courant && (
              <span className="tsay">
                <b>{courant.agent}</b>{' '}
                {courant.relation && agentCible(messages, courant)
                  ? `${td(RELATION[courant.relation])} ${agentCible(messages, courant)}`
                  : courant.tour === dernier
                    ? td('conclut le débat')
                    : td('ouvre le débat')}
              </span>
            )}
          </div>
          {agents.map((nom, i) => {
            const [x, y] = places[i];
            const parle = courant?.agent === nom;
            const aParle = positions.has(nom);
            return (
              <div
                key={nom}
                className={`seat${parle ? ' on' : aParle ? ' fin' : ''}`}
                style={
                  {
                    left: `${x}%`,
                    top: `${y}%`,
                    '--c': couleurAgent(nom),
                  } as React.CSSProperties
                }
              >
                <span className="av2">{i + 1}</span>
                <b>{nom}</b>
                <em className="mono">
                  {aParle ? `${positions.get(nom)}/100` : ''}
                </em>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
        <div className="ctrl">
          <button
            className="btn sm ghost"
            onClick={() => {
              setLecture(false);
              setTour(tourPrecedent(tour));
            }}
            disabled={tour <= 1}
          >
            {tr('precedent')}
          </button>
          <button
            className="btn sm"
            onClick={() => setLecture(!lecture)}
            disabled={tour >= dernier}
          >
            {td(lecture ? 'Pause' : 'Lecture')}
          </button>
          <button
            className="btn sm ghost"
            onClick={() => {
              setLecture(false);
              setTour(tourSuivant(tour, dernier));
            }}
            disabled={tour >= dernier}
          >
            {tr('suivant')}
          </button>
          <span className="note">
            {tr('tour_3')} {tour} {tr('sur')} {dernier}
          </span>
        </div>

        <div className="pos">
          <div className="pos-h">
            <span>{tr('buzz')}</span>
            <span>
              {tr('ecart_entre_agents')} {ecart(positions)} {tr('points')}
            </span>
            <span>{tr('durable')}</span>
          </div>
          {[...positions].map(([agent, position]) => (
            <div key={agent} className="pos-r">
              <span>{agent}</span>
              <span
                className="pos-b"
                role="meter"
                aria-valuenow={position}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${agent} : ${position} sur 100`}
              >
                <i
                  style={{
                    width: `${position}%`,
                    background: `rgb(${couleurAgent(agent)})`,
                  }}
                />
              </span>
              <span className="mono">{position}</span>
            </div>
          ))}
        </div>

        <p className="note" style={{ margin: 0 }}>
          {tr('cliquez_sur_un_echange_pour_lire_le_message_comp')}
        </p>
        <ol
          className="feed"
          aria-live="polite"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {[...visibles].reverse().map((m) => {
            const cible = agentCible(messages, m);
            return (
              <li key={m.tour}>
                <button
                  className={`msg${m.tour === tour ? ' cur' : ''}`}
                  onClick={() => onOuvrir?.(m)}
                >
                  <div className="h">
                    <p className="w">
                      <span
                        className="ico"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          fontSize: 11,
                          background: `rgba(${couleurAgent(m.agent)},.45)`,
                        }}
                      >
                        {agents.indexOf(m.agent) + 1}
                      </span>
                      {m.agent}
                      <span className="tm">
                        {tr('tour_4')} {m.tour}
                      </span>
                    </p>
                    {m.relation && cible && (
                      <span className="rel">
                        {td(RELATION[m.relation])} {cible}
                      </span>
                    )}
                  </div>
                  <p>{m.contenu}</p>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
