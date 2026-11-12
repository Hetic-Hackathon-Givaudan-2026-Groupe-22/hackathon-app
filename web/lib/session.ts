'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ApiError, apiGet, apiPost } from './api';

// La personne connectée (ADR 0012) ; le cookie de session est httpOnly
export type Utilisateur = {
  id: number;
  email: string;
  nom: string;
  metier: string | null;
  langue: string;
};

type Session = {
  utilisateur: Utilisateur | null;
  pret: boolean;
  setUtilisateur: (u: Utilisateur | null) => void;
  recharger: () => Promise<void>;
  deconnecter: () => Promise<void>;
};

const ContexteSession = createContext<Session | null>(null);

// Seul un 401 veut dire « pas de session » ; une API injoignable (redémarrage)
// ne déconnecte personne : on réessaie
export async function lireSession(
  attendre: (ms: number) => Promise<void> = (ms) =>
    new Promise((r) => setTimeout(r, ms)),
  essais = 20,
): Promise<Utilisateur | null> {
  for (let i = 0; ; i++) {
    try {
      return await apiGet<Utilisateur>('/auth/moi');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      if (i >= essais - 1) return null;
      await attendre(1000);
    }
  }
}

// Une seule lecture de la session, partagée par toute l'app
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    let actif = true;
    lireSession().then((u) => {
      if (!actif) return;
      setUtilisateur(u);
      setPret(true);
    });
    return () => {
      actif = false;
    };
  }, []);

  const recharger = useCallback(async () => {
    setUtilisateur(await lireSession());
  }, []);

  const deconnecter = useCallback(async () => {
    await apiPost('/auth/deconnexion').catch(() => undefined);
    setUtilisateur(null);
  }, []);

  return createElement(
    ContexteSession.Provider,
    { value: { utilisateur, pret, setUtilisateur, recharger, deconnecter } },
    children,
  );
}

export function useSession(): Session {
  const s = useContext(ContexteSession);
  if (!s) throw new Error('useSession hors de SessionProvider');
  return s;
}

// Règles de saisie partagées par les formulaires de compte (US-02)
export const MOT_DE_PASSE_MIN = 8;

export function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Pages accessibles sans être connecté
export function pagePublique(chemin: string): boolean {
  return chemin === '/';
}

// Initiales de l'avatar : « Camille Martin » -> « CM »
export function initiales(nom: string): string {
  return (
    nom
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((m) => m[0]!.toUpperCase())
      .join('') || '?'
  );
}
