// Données de démonstration (ADR 0005) : npm run db:seed -w api
// Rejouable : vide les tables puis réinsère les mêmes lignes.
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import { tendances } from '../src/db/schema.ts';

try {
  process.loadEnvFile();
} catch {
  // Pas de .env : on garde l'environnement tel quel
}

const demo = (libelle: string, valeur: string, source: string) => ({
  libelle,
  valeur,
  source,
  demo: true,
});

export const TENDANCES = [
  {
    slug: 'pistache',
    nom: 'Pistache',
    famille: 'Gourmand',
    statut: 'en_hausse',
    dateDebut: '2023-09-01',
    description:
      'La pistache sort de la pâtisserie pour gagner les boissons, les glaces et les parfums gourmands.',
    suivie: true,
    signaux: [
      demo('Recherches Google, Europe', '+180 % en 24 mois', 'Google Trends'),
      demo('Pays en hausse', '9 pays sur 12', 'Google Trends'),
      demo('Lancements produits', '42 en 2024', 'Mintel GNPD'),
      demo('Prix de la pistache', '+35 % sur 12 mois', 'USDA'),
    ],
  },
  {
    slug: 'matcha',
    nom: 'Matcha',
    famille: 'Végétal',
    statut: 'stable',
    dateDebut: '2019-03-01',
    description:
      'Thé vert japonais en poudre, installé dans les boissons et les desserts depuis plusieurs années.',
    suivie: true,
    signaux: [
      demo('Recherches Google, Europe', '+40 % en 5 ans', 'Google Trends'),
      demo('Pays en hausse', '11 pays sur 12', 'Google Trends'),
      demo('Lancements produits', '65 en 2024', 'Mintel GNPD'),
    ],
  },
  {
    slug: 'dalgona',
    nom: 'Dalgona',
    famille: 'Gourmand',
    statut: 'en_baisse',
    dateDebut: '2020-03-01',
    description:
      'Café fouetté devenu viral pendant le confinement de 2020, retombé quelques mois plus tard.',
    suivie: false,
    signaux: [
      demo(
        'Recherches Google, monde',
        'pic x40 en avril 2020',
        'Google Trends',
      ),
      demo('Durée du pic', 'moins de 3 mois', 'Google Trends'),
      demo('Lancements produits', '3 en 2020', 'Mintel GNPD'),
    ],
  },
  {
    slug: 'yuzu',
    nom: 'Yuzu',
    famille: 'Agrume',
    statut: 'en_hausse',
    dateDebut: '2022-05-01',
    description:
      'Agrume japonais acidulé, de plus en plus présent dans les boissons et les parfums frais.',
    suivie: false,
    signaux: [
      demo('Recherches Google, Europe', '+65 % en 24 mois', 'Google Trends'),
      demo('Lancements produits', '18 en 2024', 'Mintel GNPD'),
      demo('Prix du yuzu', '+12 % sur 12 mois', 'Presse spécialisée'),
    ],
  },
  {
    slug: 'ube',
    nom: 'Ube',
    famille: 'Gourmand',
    statut: 'emergente',
    dateDebut: '2024-02-01',
    description:
      'Igname violette des Philippines, remarquée pour sa couleur dans les desserts et les boissons.',
    suivie: false,
    signaux: [
      demo('Recherches Google, Europe', '+90 % en 12 mois', 'Google Trends'),
      demo('Pays en hausse', '4 pays sur 12', 'Google Trends'),
      demo('Lancements produits', '6 en 2024', 'Mintel GNPD'),
    ],
  },
  {
    slug: 'fleur-oranger',
    nom: "Fleur d'oranger",
    famille: 'Floral',
    statut: 'stable',
    dateDebut: '2018-01-01',
    description:
      'Note florale méditerranéenne, classique de la pâtisserie et de la parfumerie, qui revient dans les boissons.',
    suivie: false,
    signaux: [
      demo('Recherches Google, Europe', '+8 % en 24 mois', 'Google Trends'),
      demo('Lancements produits', '22 en 2024', 'Mintel GNPD'),
      demo('Prix du néroli', '+5 % sur 12 mois', 'Presse spécialisée'),
    ],
  },
];

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  await db.execute(sql`TRUNCATE tendances RESTART IDENTITY CASCADE`);
  await db.insert(tendances).values(TENDANCES);
  console.log(`${TENDANCES.length} tendances de démonstration insérées`);
  await pool.end();
}

await main();
