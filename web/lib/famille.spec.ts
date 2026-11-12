import { describe, expect, it } from 'vitest';
import {
  couleurFamille,
  ETEINT,
  LEGENDE_FAMILLES,
  LEGENDE_STATUTS,
  statutTendance,
} from './famille';

describe('couleurFamille', () => {
  it('donne la couleur pastel de la famille, accents et majuscules compris', () => {
    expect(couleurFamille('Gourmand')).toBe('246,195,94');
    expect(couleurFamille('Végétal')).toBe('142,214,184');
    expect(couleurFamille('Floral')).toBe('169,184,245');
  });

  it('gris « éteint » pour une famille inconnue', () => {
    expect(couleurFamille('Boisé')).toBe(ETEINT);
  });
});

describe('statutTendance (US-09)', () => {
  it('libellé et couleur de la pastille', () => {
    expect(statutTendance('en_hausse')).toEqual({
      libelle: 'En hausse',
      chip: 'go',
    });
    expect(statutTendance('en_baisse').chip).toBe('risk');
  });

  it('statut inconnu : affiché tel quel, en gris', () => {
    expect(statutTendance('autre')).toEqual({ libelle: 'autre', chip: 'off' });
  });
});

describe('légende (US-12)', () => {
  it('chaque famille de la légende a sa propre couleur', () => {
    const couleurs = LEGENDE_FAMILLES.map(couleurFamille);
    expect(new Set(couleurs).size).toBe(LEGENDE_FAMILLES.length);
    expect(couleurs).not.toContain(ETEINT);
  });

  it('chaque statut a un texte et une couleur distincte', () => {
    expect(LEGENDE_STATUTS.map((s) => s.libelle)).toEqual([
      'Émergente',
      'En hausse',
      'Stable',
      'En baisse',
    ]);
    expect(new Set(LEGENDE_STATUTS.map((s) => s.chip)).size).toBe(4);
  });
});
