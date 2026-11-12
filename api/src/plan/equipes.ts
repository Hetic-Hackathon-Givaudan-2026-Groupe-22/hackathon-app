// Équipes du plan d'action, reprises du prototype (US-27, US-28).
// Les actions sont produites à partir de l'analyse : simulées, comme elle (ADR 0005).

export type Contexte = {
  tendance: string;
  verdict: 'buzz' | 'durable';
  matiere: string;
  substitut: string | null;
  decideLe: Date;
};

export type Action = {
  texte: string;
  qui: string;
  echeance: string; // AAAA-MM-JJ
  priorite: 'Haute' | 'Moyenne' | 'Basse';
};

export type Equipe = {
  cle: string;
  nom: string;
  destinataire: string;
  urgence: string;
  conclusion: string;
  actions: Action[];
};

type Modele = {
  cle: string;
  nom: string;
  destinataire: string;
  parDefaut: boolean;
  construire: (
    c: Contexte,
    dans: (jours: number) => string,
  ) => {
    urgence: string;
    conclusion: string;
    actions: Action[];
  };
};

const min = (s: string) => s.toLowerCase();

export const MODELES: Modele[] = [
  {
    cle: 'achats',
    nom: 'Achats et stocks',
    destinataire: 'Responsable achats matières · Europe',
    parDefaut: true,
    construire: (c, dans) => ({
      urgence: c.verdict === 'durable' ? 'Urgent' : 'À préparer',
      conclusion:
        c.verdict === 'durable'
          ? `La demande de ${min(c.matiere)} va durer : sécuriser les volumes avant la hausse des prix.`
          : `Buzz passager : ne pas surstocker de ${min(c.matiere)}.`,
      actions: [
        {
          texte: `Vérifier la couverture de stock en ${min(c.matiere)}`,
          qui: 'Acheteur matières',
          echeance: dans(7),
          priorite: 'Haute',
        },
        {
          texte: 'Ouvrir un deuxième fournisseur',
          qui: 'Acheteur matières',
          echeance: dans(30),
          priorite: 'Moyenne',
        },
        ...(c.substitut
          ? [
              {
                texte: `Commander un échantillon : ${c.substitut}`,
                qui: 'Acheteur et labo',
                echeance: dans(14),
                priorite: 'Moyenne' as const,
              },
            ]
          : []),
      ],
    }),
  },
  {
    cle: 'commerciaux',
    nom: 'Commerciaux',
    destinataire: 'Key account managers',
    parDefaut: true,
    construire: (c, dans) => ({
      urgence: 'Cette semaine',
      conclusion:
        c.verdict === 'durable'
          ? `« ${c.tendance} » n'est plus un buzz : en parler aux clients avant qu'ils ne viennent.`
          : `« ${c.tendance} » est un buzz : ne pas pousser de nouveau projet.`,
      actions: [
        {
          texte: `Appeler les clients qui parlent déjà de ${min(c.tendance)}`,
          qui: 'KAM',
          echeance: dans(9),
          priorite: 'Haute',
        },
        {
          texte: `Proposer un atelier dégustation « ${min(c.tendance)} »`,
          qui: 'KAM et labo',
          echeance: dans(27),
          priorite: 'Moyenne',
        },
      ],
    }),
  },
  {
    cle: 'marketing',
    nom: 'Marketing',
    destinataire: 'Marketing Taste & Wellbeing',
    parDefaut: true,
    construire: (c, dans) => ({
      urgence: 'Ce mois-ci',
      conclusion: `Tendance « ${c.tendance} » ${c.verdict === 'durable' ? 'validée' : 'classée buzz'} en Europe.`,
      actions: [
        {
          texte: `Préparer un brief inspiration « ${min(c.tendance)} »`,
          qui: 'Marketing',
          echeance: dans(22),
          priorite: 'Moyenne',
        },
        {
          texte: `Ajouter « ${min(c.tendance)} » au tableau de bord des tendances`,
          qui: 'Marketing',
          echeance: dans(12),
          priorite: 'Basse',
        },
      ],
    }),
  },
  {
    cle: 'labos',
    nom: 'Labos arômes',
    destinataire: 'Aromaticiens',
    parDefaut: true,
    construire: (c, dans) => ({
      urgence: 'Ce mois-ci',
      conclusion: c.substitut
        ? `Substitut possible si la matière manque : ${c.substitut}.`
        : `Formuler des variantes autour de ${min(c.tendance)}.`,
      actions: [
        {
          texte: `Formuler deux variantes « ${min(c.tendance)} »`,
          qui: 'Aromaticien',
          echeance: dans(27),
          priorite: 'Haute',
        },
        ...(c.substitut
          ? [
              {
                texte: `Tester une formule avec 30 % : ${c.substitut}`,
                qui: 'Aromaticien',
                echeance: dans(32),
                priorite: 'Moyenne' as const,
              },
            ]
          : []),
      ],
    }),
  },
  {
    cle: 'qualite',
    nom: 'Qualité et réglementaire',
    destinataire: 'Qualité matières premières',
    parDefaut: false,
    construire: (c, dans) => ({
      urgence: 'Ce mois-ci',
      conclusion:
        'Tout nouveau fournisseur demande un contrôle qualité et allergènes avant achat.',
      actions: [
        {
          texte: 'Auditer le nouveau fournisseur',
          qui: 'Qualité',
          echeance: dans(29),
          priorite: 'Haute',
        },
        {
          texte: `Vérifier l'étiquetage allergènes des variantes ${min(c.tendance)}`,
          qui: 'Réglementaire',
          echeance: dans(32),
          priorite: 'Moyenne',
        },
      ],
    }),
  },
  {
    cle: 'finance',
    nom: 'Finance',
    destinataire: 'Contrôle de gestion · Taste & Wellbeing',
    parDefaut: false,
    construire: (c, dans) => ({
      urgence: 'Cette semaine',
      conclusion: `La hausse du prix de ${min(c.matiere)} réduit la marge si les prix de vente ne bougent pas.`,
      actions: [
        {
          texte: "Chiffrer l'impact de la hausse sur la marge",
          qui: 'Contrôle de gestion',
          echeance: dans(15),
          priorite: 'Haute',
        },
        {
          texte: 'Préparer une grille de révision de prix',
          qui: 'Finance et KAM',
          echeance: dans(25),
          priorite: 'Moyenne',
        },
      ],
    }),
  },
  {
    cle: 'supply',
    nom: 'Supply chain',
    destinataire: 'Planification supply · Europe',
    parDefaut: false,
    construire: (c, dans) => ({
      urgence: 'Cette semaine',
      conclusion: `Prévoir la place et les délais pour les volumes de ${min(c.matiere)}.`,
      actions: [
        {
          texte: "Mettre à jour le plan d'approvisionnement",
          qui: 'Planificateur',
          echeance: dans(22),
          priorite: 'Haute',
        },
        {
          texte: 'Vérifier la capacité de stockage du site',
          qui: 'Logistique',
          echeance: dans(27),
          priorite: 'Basse',
        },
      ],
    }),
  },
  {
    cle: 'region',
    nom: 'Direction régionale',
    destinataire: 'Direction Europe',
    parDefaut: false,
    construire: (c, dans) => ({
      urgence: 'Ce mois-ci',
      conclusion: `Tendance « ${c.tendance} » ${c.verdict === 'durable' ? 'validée' : 'classée buzz'}, actions lancées dans les équipes.`,
      actions: [
        {
          texte: 'Valider le budget achats supplémentaire',
          qui: 'Direction',
          echeance: dans(17),
          priorite: 'Haute',
        },
      ],
    }),
  },
];

export const EQUIPES_PAR_DEFAUT = MODELES.filter((m) => m.parDefaut).map(
  (m) => m.cle,
);

// Date ISO « AAAA-MM-JJ », n jours après la décision
export function apres(depart: Date, jours: number): string {
  const d = new Date(depart.getTime() + jours * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function construireEquipe(cle: string, c: Contexte): Equipe | null {
  const m = MODELES.find((x) => x.cle === cle);
  if (!m) return null;
  return {
    cle: m.cle,
    nom: m.nom,
    destinataire: m.destinataire,
    ...m.construire(c, (j) => apres(c.decideLe, j)),
  };
}
