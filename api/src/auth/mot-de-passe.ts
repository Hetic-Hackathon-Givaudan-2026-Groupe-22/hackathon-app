// Hachage des mots de passe avec scrypt (ADR 0012), sans dépendance
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  mdp: string,
  sel: Buffer,
  taille: number,
) => Promise<Buffer>;

const TAILLE = 64;

// « scrypt$<sel>$<empreinte> », sel aléatoire de 16 octets
export async function hacher(motDePasse: string): Promise<string> {
  const sel = randomBytes(16);
  const empreinte = await scryptAsync(motDePasse, sel, TAILLE);
  return `scrypt$${sel.toString('base64url')}$${empreinte.toString('base64url')}`;
}

// Comparaison à temps constant : le temps de réponse ne trahit rien
export async function verifier(
  motDePasse: string,
  stocke: string,
): Promise<boolean> {
  const [algo, sel, empreinte] = stocke.split('$');
  if (algo !== 'scrypt' || !sel || !empreinte) return false;
  const attendu = Buffer.from(empreinte, 'base64url');
  const calcule = await scryptAsync(
    motDePasse,
    Buffer.from(sel, 'base64url'),
    attendu.length,
  );
  return calcule.length === attendu.length && timingSafeEqual(calcule, attendu);
}
