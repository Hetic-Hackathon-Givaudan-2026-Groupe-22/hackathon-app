import { describe, expect, it } from 'vitest';
import { chipUrgence, iconeEquipe, jourMois, listeDestinataires } from './plan';

describe('plan d’action (US-27)', () => {
  it('urgence : rouge si urgent, jaune cette semaine, gris sinon', () => {
    expect(chipUrgence('Urgent')).toBe('risk');
    expect(chipUrgence('Cette semaine')).toBe('wait');
    expect(chipUrgence('Ce mois-ci')).toBe('off');
  });

  it('une lettre par équipe, un point sinon', () => {
    expect(iconeEquipe('achats')[0]).toBe('A');
    expect(iconeEquipe('inconnue')[0]).toBe('·');
  });

  it('échéance courte au format jour/mois', () => {
    expect(jourMois('2026-11-19')).toBe('19/11');
  });
});

describe('listeDestinataires (US-29)', () => {
  it('sépare par virgule, point-virgule ou retour à la ligne, sans vide ni doublon', () => {
    expect(listeDestinataires('a@x.fr, b@y.fr ;\n a@x.fr ,,')).toEqual([
      'a@x.fr',
      'b@y.fr',
    ]);
  });
});
