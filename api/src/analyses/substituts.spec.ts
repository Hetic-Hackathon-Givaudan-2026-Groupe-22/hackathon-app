import { hausseDePrix, substituts } from './analyse-simulee.js';

// Tests unitaires du substitut de matière (US-21)
describe('hausseDePrix', () => {
  it('lit la hausse d’un signal de prix', () => {
    expect(hausseDePrix('+35 % sur 12 mois')).toBe(35);
    expect(hausseDePrix('+12,5 % sur 12 mois')).toBe(12.5);
  });

  it('null sans hausse lisible', () => {
    expect(hausseDePrix(undefined)).toBeNull();
    expect(hausseDePrix('stable')).toBeNull();
  });
});

describe('substituts', () => {
  const tendance = (prix?: string) => ({
    slug: 'x',
    nom: 'Pistache',
    famille: 'Gourmand',
    signaux: prix
      ? [
          {
            libelle: 'Prix de la pistache',
            valeur: prix,
            source: 'USDA',
            demo: true,
          },
        ]
      : [],
  });

  it('matière sous tension (+10 % ou plus) : un substitut, avec sa raison', () => {
    const [s] = substituts(tendance('+35 % sur 12 mois'));
    expect(s.substitut).toBe('Arôme pistache de synthèse');
    expect(s.raison).toContain('35 %');
  });

  it('prix du substitut non documenté : laissé à chiffrer par Data', () => {
    expect(substituts(tendance('+35 % sur 12 mois'))[0].prix).toBeNull();
  });

  it('pas de tension, pas de substitut', () => {
    expect(substituts(tendance('+5 % sur 12 mois'))).toEqual([]);
    expect(substituts(tendance())).toEqual([]);
  });
});
