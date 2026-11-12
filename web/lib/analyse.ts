// Types de GET /api/analyses/:id

export type Agent = {
  nom: string;
  role: string;
  statut: 'en_attente' | 'en_cours' | 'termine';
};

export type Source = {
  titre: string;
  editeur: string;
  date: string;
  url: string | null;
  verifiee: boolean;
};

export type Message = {
  tour: number;
  agent: string;
  repondA: number | null;
  relation: 'objecte' | 'nuance' | 'repond' | null;
  contenu: string;
  statut: 'etabli' | 'conteste' | 'ouvert';
  position: number;
  sources: Source[];
};

export type Maillon = { nom: string; detail: string; source: string };

// Substitut d'une matière sous tension (US-21) ; prix null = à chiffrer par Data
export type Substitut = {
  matiere: string;
  substitut: string;
  raison: string;
  prix: string | null;
};

export type Verdict = {
  propose: 'buzz' | 'durable';
  score: number;
  fiabilite: 'faible' | 'moyenne' | 'elevee';
  explicationFiabilite: string;
  raisons: { texte: string; messageTour: number }[];
  reserve: string | null;
  statut: 'propose' | 'valide' | 'modifie';
  final: 'buzz' | 'durable' | null;
  justification: string | null;
  decidePar: string | null;
  decideLe: string | null;
};

export type Analyse = {
  id: number;
  mode: 'dummy' | 'reel';
  perimetre: {
    tendance: { slug: string; nom: string };
    marche: string;
    periode: string;
  };
  demarreeLe: string;
  dureeMs: number;
  ecouleMs: number;
  statut: 'en_cours' | 'terminee';
  agents: Agent[];
  messages?: Message[];
  chaine?: {
    notes: Maillon[];
    matieres: Maillon[];
    prix: Maillon[];
    substituts?: Substitut[];
  };
  verdict?: Verdict;
};
