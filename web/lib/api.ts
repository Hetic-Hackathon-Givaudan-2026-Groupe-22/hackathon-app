// Appels à l'API NestJS, relayés par Next.js sous /api (next.config.ts)

export type TendanceResume = {
  slug: string;
  nom: string;
  famille: string;
  statut: string;
  dateDebut: string;
  suivie: boolean;
};

export type Signal = {
  libelle: string;
  valeur: string;
  source: string;
  demo: boolean;
};

export type Tendance = TendanceResume & {
  id: number;
  description: string;
  signaux: Signal[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function lire<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // Sans réponse JSON, c'est le relais de Next.js : l'API ne répond pas
    throw new ApiError(body?.message ?? 'API injoignable', res.status);
  }
  return body as T;
}

export async function apiGet<T>(chemin: string): Promise<T> {
  return lire<T>(await fetch(`/api${chemin}`, { cache: 'no-store' }));
}

export async function apiPost<T>(chemin: string, corps?: unknown): Promise<T> {
  return lire<T>(
    await fetch(`/api${chemin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps ?? {}),
    }),
  );
}

async function envoyer<T>(
  methode: 'PATCH' | 'PUT' | 'DELETE',
  chemin: string,
  corps?: unknown,
): Promise<T> {
  return lire<T>(
    await fetch(`/api${chemin}`, {
      method: methode,
      headers: { 'Content-Type': 'application/json' },
      body: corps === undefined ? undefined : JSON.stringify(corps),
    }),
  );
}

export const apiPatch = <T>(chemin: string, corps?: unknown) =>
  envoyer<T>('PATCH', chemin, corps);

export const apiPut = <T>(chemin: string, corps?: unknown) =>
  envoyer<T>('PUT', chemin, corps);
