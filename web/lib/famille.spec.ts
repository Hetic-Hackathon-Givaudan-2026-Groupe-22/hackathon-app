import { describe, expect, it } from 'vitest';
import { couleurFamille, ETEINT, statutTendance } from './famille';

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
