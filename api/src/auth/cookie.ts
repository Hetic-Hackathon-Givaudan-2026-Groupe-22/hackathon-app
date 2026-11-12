// Cookie de session (ADR 0012) : httpOnly, jamais lisible par le JavaScript de la page
export const COOKIE_SESSION = 'sillage_session';
export const DUREE_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export const optionsCookie = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.COOKIE_SECURE === 'true',
  maxAge: DUREE_SESSION_MS,
};

// Valeur d'un cookie dans l'en-tête Cookie, sans dépendance
export function lireCookie(
  entete: string | undefined,
  nom: string,
): string | undefined {
  if (!entete) return undefined;
  for (const morceau of entete.split(';')) {
    const [cle, ...valeur] = morceau.trim().split('=');
    if (cle === nom) return decodeURIComponent(valeur.join('='));
  }
  return undefined;
}
