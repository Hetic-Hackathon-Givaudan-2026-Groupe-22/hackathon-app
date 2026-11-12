import { describe, expect, it } from 'vitest';
import {
  formatChrono,
  formatDateHeure,
  formatMois,
  libelleStatut,
} from './format';

describe('formatChrono', () => {
  it('affiche minutes et secondes sur deux chiffres', () => {
    expect(formatChrono(75_000)).toBe('01:15');
    expect(formatChrono(0)).toBe('00:00');
  });

  it('ne descend jamais sous zéro', () => {
    expect(formatChrono(-500)).toBe('00:00');
  });
});

describe('formatMois', () => {
  it('affiche le mois et l’année en français', () => {
    expect(formatMois('2023-09-01')).toBe('sept. 2023');
  });
});

describe('libelleStatut', () => {
  it('traduit les statuts connus et garde les autres', () => {
    expect(libelleStatut('en_hausse')).toBe('En hausse');
    expect(libelleStatut('inconnu')).toBe('inconnu');
  });
});

describe('formatDateHeure', () => {
  it('date et heure de Paris', () => {
    expect(formatDateHeure('2026-11-12T19:30:00Z')).toBe('12/11/2026 20:30');
  });
});
