// Simulateur d'analyse (ADR 0005) : remplace le service Data Sillage tant qu'il n'est pas prêt.
// Chaque résultat porte mode « dummy » ; seules les données publiques citées sont réelles.
import { Injectable } from '@nestjs/common';
import type { Chaine } from '../db/schema.js';
import type {
  AnalyseProvider,
  MessageProduit,
  ResultatAnalyse,
  SourceProduite,
  TendanceAnalysee,
} from './analyse-provider.js';

type Profil = {
  propose: 'buzz' | 'durable';
  score: number;
  fiabilite: 'faible' | 'moyenne' | 'elevee';
  chaine?: Chaine;
};

// Page d'accueil publique de chaque éditeur cité (US-19) ; jamais d'article inventé
export function lienEditeur(editeur: string, terme: string): string | null {
  switch (editeur) {
    case 'Google Trends':
      return `https://trends.google.com/trends/explore?q=${encodeURIComponent(terme)}`;
    case 'Mintel GNPD':
      return 'https://www.mintel.com/';
    case 'USDA':
      return 'https://www.fas.usda.gov/';
    default:
      return null;
  }
}

const demo = (
  titre: string,
  editeur: string,
  date: string,
  url: string | null = null,
): SourceProduite => ({
  titre,
  editeur,
  date,
  url,
  verifiee: false,
});

// Seule donnée de prix réelle de la démonstration (critère d'US-20)
const PRIX_PISTACHE_FT: SourceProduite = {
  titre: 'Cours de la pistache, avril 2024 à avril 2025',
  editeur: 'Financial Times',
  date: '19/04/2025',
  url: null,
  verifiee: true,
};

const PROFILS: Record<string, Profil> = {
  pistache: {
    propose: 'durable',
    score: 78,
    fiabilite: 'elevee',
    chaine: {
      notes: [
        {
          nom: 'Gourmande, lactée, grillée',
          detail: 'Note dominante des glaces et pâtisseries pistache',
          source: 'Référentiel olfactif interne (démo)',
        },
        {
          nom: 'Verte',
          detail: 'Facette fraîche de l’amande de pistache',
          source: 'Référentiel olfactif interne (démo)',
        },
      ],
      matieres: [
        {
          nom: 'Pistache',
          detail: 'Origines principales : États-Unis, Iran, Turquie',
          source: 'USDA (démo)',
        },
        {
          nom: 'Arôme pistache de synthèse',
          detail: 'Substitut possible pour lisser le coût',
          source: 'Référentiel matières (démo)',
        },
      ],
      prix: [
        {
          nom: 'Pistache',
          detail: '7,65 $ puis 10,30 $ la livre, d’avril 2024 à avril 2025',
          source: 'Financial Times, 19/04/2025',
        },
      ],
    },
  },
  matcha: { propose: 'durable', score: 82, fiabilite: 'elevee' },
  dalgona: { propose: 'buzz', score: 18, fiabilite: 'elevee' },
  yuzu: { propose: 'durable', score: 64, fiabilite: 'moyenne' },
  ube: { propose: 'durable', score: 55, fiabilite: 'faible' },
  'fleur-oranger': { propose: 'durable', score: 70, fiabilite: 'moyenne' },
};

const borne = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function chaineGenerique(t: TendanceAnalysee): Chaine {
  return {
    notes: [
      {
        nom: `Facette ${t.famille.toLowerCase()}`,
        detail: `Note associée à ${t.nom}`,
        source: 'Référentiel olfactif interne (démo)',
      },
    ],
    matieres: [
      {
        nom: t.nom,
        detail: 'Matière naturelle principale',
        source: 'Référentiel matières (démo)',
      },
    ],
    prix: [
      {
        nom: t.nom,
        detail:
          t.signaux.find((s) => s.libelle.startsWith('Prix'))?.valeur ??
          'Pas de série de prix publique identifiée',
        source: 'Démonstration',
      },
    ],
  };
}

@Injectable()
export class AnalyseSimulee implements AnalyseProvider {
  analyser(t: TendanceAnalysee): ResultatAnalyse {
    const p = PROFILS[t.slug] ?? {
      propose: 'durable',
      score: 50,
      fiabilite: 'faible',
    };
    const buzz = p.propose === 'buzz';
    const [s1, s2, s3] = t.signaux;
    const src = (i: number) =>
      t.signaux[i]
        ? [
            demo(
              t.signaux[i].libelle,
              t.signaux[i].source,
              '2025',
              lienEditeur(t.signaux[i].source, t.nom),
            ),
          ]
        : [];
    const sourcePrix = t.slug === 'pistache' ? [PRIX_PISTACHE_FT] : src(2);

    const messages: MessageProduit[] = [
      {
        tour: 1,
        agent: 'Veilleur',
        repondA: null,
        relation: null,
        contenu: `${s1?.libelle} : ${s1?.valeur}. Pour ${t.nom}, le signal est net.`,
        statut: 'etabli',
        position: borne(p.score + 15),
        sources: src(0),
      },
      {
        tour: 2,
        agent: 'Sceptique',
        repondA: 1,
        relation: 'objecte',
        contenu: buzz
          ? 'Un pic aussi brutal ressemble à un effet de réseaux sociaux : il faut voir s’il tient plus d’une saison.'
          : 'Une hausse des recherches ne suffit pas : beaucoup de tendances s’effondrent après leur pic.',
        statut: 'conteste',
        position: borne(p.score - 35),
        // Pas de source : la mention « Source à compléter » s'affiche (US-18)
        sources: [],
      },
      {
        tour: 3,
        agent: 'Historien',
        repondA: 2,
        relation: 'nuance',
        contenu: buzz
          ? `Le profil de ${t.nom} rappelle les buzz passés : montée en quelques semaines, retombée en quelques mois.`
          : `Contrairement au Dalgona en 2020, ${t.nom} progresse depuis plusieurs saisons (${s2?.libelle} : ${s2?.valeur}).`,
        statut: 'etabli',
        position: borne(p.score - 5),
        sources: src(1),
      },
      {
        tour: 4,
        agent: 'Acheteur',
        repondA: 1,
        relation: 'repond',
        contenu:
          t.slug === 'pistache'
            ? 'Le prix de la pistache est passé de 7,65 $ à 10,30 $ la livre en un an : la demande dépasse l’offre.'
            : `Côté matières : ${s3 ? `${s3.libelle} : ${s3.valeur}` : 'peu de données'}.`,
        statut: 'etabli',
        position: borne(p.score + 5),
        sources: sourcePrix,
      },
      {
        tour: 5,
        agent: 'Sceptique',
        repondA: 3,
        relation: 'nuance',
        contenu: buzz
          ? 'Je maintiens : aucun lancement produit durable n’a suivi le pic.'
          : 'D’accord sur la durée, mais la diffusion reste concentrée sur quelques pays.',
        statut: 'ouvert',
        position: borne(p.score - 15),
        sources: src(2),
      },
      {
        tour: 6,
        agent: 'Veilleur',
        repondA: 5,
        relation: 'repond',
        contenu: buzz
          ? 'Accordé : sans lancements ni hausse durable des prix, le signal ne se confirme pas.'
          : `${s2?.libelle ?? 'La diffusion'} : ${s2?.valeur ?? 'en cours'}. La diffusion s’élargit.`,
        statut: buzz ? 'etabli' : 'conteste',
        position: borne(p.score + 8),
        sources: src(1),
      },
      {
        tour: 7,
        agent: 'Stratège',
        repondA: null,
        relation: null,
        contenu: `Je propose « ${buzz ? 'Buzz' : 'Durable'} » avec un score de ${p.score}/100.`,
        statut: 'etabli',
        position: p.score,
        sources: [],
      },
    ];

    const toutes = messages.flatMap((m) => m.sources);
    const verifiees = toutes.filter((s) => s.verifiee).length;

    return {
      mode: 'dummy',
      marche: 'Europe',
      periode: '24 derniers mois',
      messages,
      chaine: p.chaine ?? chaineGenerique(t),
      verdict: {
        propose: p.propose,
        score: p.score,
        fiabilite: p.fiabilite,
        explicationFiabilite: `Repose sur ${toutes.length} sources, dont ${verifiees} vérifiée${verifiees > 1 ? 's' : ''} ; les autres sont des données de démonstration.`,
        raisons: [
          { texte: messages[0].contenu, messageTour: 1 },
          { texte: messages[2].contenu, messageTour: 3 },
          { texte: messages[3].contenu, messageTour: 4 },
        ],
        reserve: buzz
          ? null
          : `Le Sceptique garde une réserve : ${messages[4].contenu}`,
      },
    };
  }
}
