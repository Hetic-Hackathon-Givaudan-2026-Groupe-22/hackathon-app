// Contrat entre l'API et la source des analyses (ADR 0005).
// Aujourd'hui : le simulateur. Demain : le service Data Sillage (ADR 0003).
import type { Chaine, Raison } from '../db/schema.js';

export const ANALYSE_PROVIDER = Symbol('ANALYSE_PROVIDER');

export type TendanceAnalysee = {
  slug: string;
  nom: string;
  famille: string;
  signaux: { libelle: string; valeur: string; source: string; demo: boolean }[];
};

export type SourceProduite = {
  titre: string;
  editeur: string;
  date: string;
  url: string | null;
  verifiee: boolean;
};

export type MessageProduit = {
  tour: number;
  agent: string;
  // Tour du message auquel celui-ci répond
  repondA: number | null;
  relation: 'objecte' | 'nuance' | 'repond' | null;
  contenu: string;
  statut: 'etabli' | 'conteste' | 'ouvert';
  // Position de l'agent après ce tour : 0 = buzz, 100 = durable (US-16)
  position: number;
  sources: SourceProduite[];
};

export type VerdictProduit = {
  propose: 'buzz' | 'durable';
  score: number;
  fiabilite: 'faible' | 'moyenne' | 'elevee';
  explicationFiabilite: string;
  raisons: Raison[];
  reserve: string | null;
};

export type ResultatAnalyse = {
  mode: 'dummy' | 'reel';
  marche: string;
  periode: string;
  messages: MessageProduit[];
  chaine: Chaine;
  verdict: VerdictProduit;
};

export interface AnalyseProvider {
  analyser(tendance: TendanceAnalysee): ResultatAnalyse;
}
