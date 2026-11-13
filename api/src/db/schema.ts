// Schéma de la base (ADR 0006) : une table par objet des stories P1
import {
  boolean,
  primaryKey,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export type Signal = {
  libelle: string;
  valeur: string;
  source: string;
  // Valeur de démonstration, signalée comme telle à l'écran (US-13)
  demo: boolean;
};

export const tendances = pgTable('tendances', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nom: text('nom').notNull(),
  famille: text('famille').notNull(),
  // emergente | en_hausse | stable | en_baisse
  statut: text('statut').notNull(),
  dateDebut: date('date_debut').notNull(),
  description: text('description').notNull(),
  // Tendance suivie par Camille : en tête de liste (US-09)
  suivie: boolean('suivie').notNull().default(false),
  signaux: jsonb('signaux').$type<Signal[]>().notNull(),
  // Ville où la tendance est née, et villes qu'elle touche (globe, US-08)
  origine: text('origine').notNull().default(''),
  pays: jsonb('pays').$type<string[]>().notNull().default([]),
});

export type Maillon = { nom: string; detail: string; source: string };

// Substitut d'une matière sous tension (US-21) ; prix null = à chiffrer par Data
export type Substitut = {
  matiere: string;
  substitut: string;
  raison: string;
  prix: string | null;
};

export type Chaine = {
  notes: Maillon[];
  matieres: Maillon[];
  prix: Maillon[];
  substituts?: Substitut[];
};

export const analyses = pgTable('analyses', {
  id: serial('id').primaryKey(),
  tendanceId: integer('tendance_id')
    .notNull()
    .references(() => tendances.id),
  marche: text('marche').notNull(),
  periode: text('periode').notNull(),
  // Paramètres du rejeu (US-22) : période en mois, tendances comparées
  periodeMois: integer('periode_mois').notNull().default(24),
  comparaisons: jsonb('comparaisons').$type<string[]>().notNull().default([]),
  // dummy tant que le service Data n'est pas branché (ADR 0005)
  mode: text('mode').notNull(),
  demarreeLe: timestamp('demarree_le', { withTimezone: true })
    .notNull()
    .defaultNow(),
  dureeMs: integer('duree_ms').notNull(),
  chaine: jsonb('chaine').$type<Chaine>().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  analyseId: integer('analyse_id')
    .notNull()
    .references(() => analyses.id, { onDelete: 'cascade' }),
  tour: integer('tour').notNull(),
  agent: text('agent').notNull(),
  // Message auquel celui-ci répond, et comment : objecte | nuance | repond
  repondA: integer('repond_a'),
  relation: text('relation'),
  contenu: text('contenu').notNull(),
  // etabli | conteste | ouvert (US-17)
  statut: text('statut').notNull(),
  // Position de l'agent après ce tour : 0 = buzz, 100 = durable (US-16)
  position: integer('position').notNull().default(50),
});

export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  titre: text('titre').notNull(),
  editeur: text('editeur').notNull(),
  date: text('date').notNull(),
  url: text('url'),
  // false : donnée de démonstration (US-18)
  verifiee: boolean('verifiee').notNull(),
});

export type Raison = { texte: string; messageTour: number };

export const verdicts = pgTable('verdicts', {
  id: serial('id').primaryKey(),
  analyseId: integer('analyse_id')
    .notNull()
    .unique()
    .references(() => analyses.id, { onDelete: 'cascade' }),
  // buzz | durable
  propose: text('propose').notNull(),
  score: integer('score').notNull(),
  // faible | moyenne | elevee
  fiabilite: text('fiabilite').notNull(),
  explicationFiabilite: text('explication_fiabilite').notNull(),
  raisons: jsonb('raisons').$type<Raison[]>().notNull(),
  reserve: text('reserve'),
  // propose | valide | modifie (US-25, US-26)
  statut: text('statut').notNull().default('propose'),
  final: text('final'),
  justification: text('justification'),
  decidePar: text('decide_par'),
  decideLe: timestamp('decide_le', { withTimezone: true }),
});

// Comptes et sessions (ADR 0012)
export const utilisateurs = pgTable('utilisateurs', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  nom: text('nom').notNull(),
  // scrypt$<sel>$<empreinte>, jamais le mot de passe en clair
  motDePasse: text('mot_de_passe').notNull(),
  metier: text('metier'),
  // fr | en (US-07)
  langue: text('langue').notNull().default('fr'),
  creeLe: timestamp('cree_le', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  // Empreinte SHA-256 du jeton : le jeton lui-même ne vit que dans le cookie
  id: text('id').primaryKey(),
  utilisateurId: integer('utilisateur_id')
    .notNull()
    .references(() => utilisateurs.id, { onDelete: 'cascade' }),
  expireLe: timestamp('expire_le', { withTimezone: true }).notNull(),
});

// Tendances suivies par chaque compte (US-06)
export const suivis = pgTable(
  'suivis',
  {
    utilisateurId: integer('utilisateur_id')
      .notNull()
      .references(() => utilisateurs.id, { onDelete: 'cascade' }),
    tendanceId: integer('tendance_id')
      .notNull()
      .references(() => tendances.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.utilisateurId, t.tendanceId] })],
);

// Équipes retenues dans le plan d'action d'une analyse (US-27, US-28)
export const planEquipes = pgTable(
  'plan_equipes',
  {
    analyseId: integer('analyse_id')
      .notNull()
      .references(() => analyses.id, { onDelete: 'cascade' }),
    equipe: text('equipe').notNull(),
    ordre: integer('ordre').notNull(),
  },
  (t) => [primaryKey({ columns: [t.analyseId, t.equipe] })],
);

// Alertes envoyées depuis le plan d'action (US-29) : envoi simulé, tracé (ADR 0015)
export const alertes = pgTable('alertes', {
  id: serial('id').primaryKey(),
  analyseId: integer('analyse_id')
    .notNull()
    .references(() => analyses.id, { onDelete: 'cascade' }),
  // email | teams | slack
  canal: text('canal').notNull(),
  destinataires: jsonb('destinataires').$type<string[]>().notNull(),
  contenu: text('contenu').notNull(),
  envoyeePar: text('envoyee_par').notNull(),
  envoyeeLe: timestamp('envoyee_le', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
