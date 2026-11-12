'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiGet } from './api';

// La personne connectée (ADR 0012) ; le cookie de session est httpOnly
export type Utilisateur = {
  id: number;
  email: string;
  nom: string;
  metier: string | null;
  langue: string;
};

const lireSession = () => apiGet<Utilisateur>('/auth/moi').catch(() => null);

export function useSession() {
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

  return { utilisateur, pret, recharger, setUtilisateur };
}

// Règles de saisie partagées par les formulaires de compte (US-02)
export const MOT_DE_PASSE_MIN = 8;

export function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
