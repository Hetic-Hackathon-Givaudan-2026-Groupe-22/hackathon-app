// Appels à l'API NestJS, relayés par Next.js sous /api (next.config.ts)

export type TendanceResume = {
  slug: string;
  nom: string;
  famille: string;
  statut: string;
  dateDebut: string;
  suivie: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function apiGet<T>(chemin: string): Promise<T> {
  const res = await fetch(`/api${chemin}`, { cache: 'no-store' });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(body?.message ?? 'API injoignable', res.status);
  }
  return body as T;
}
