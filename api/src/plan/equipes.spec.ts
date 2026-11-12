import {
  apres,
  construireEquipe,
  EQUIPES_PAR_DEFAUT,
  MODELES,
} from './equipes.js';

// Tests unitaires du plan d'action (US-27)
describe('équipes du plan', () => {
  const contexte = {
    tendance: 'Pistache',
    verdict: 'durable' as const,
    matiere: 'Pistache',
    substitut: 'Arôme pistache de synthèse',
    decideLe: new Date('2026-11-12T10:00:00Z'),
  };

  it('quatre équipes par défaut, comme dans le prototype', () => {
    expect(EQUIPES_PAR_DEFAUT).toEqual([
      'achats',
      'commerciaux',
      'marketing',
      'labos',
    ]);
  });

  it('chaque équipe a une conclusion et au moins une action datée', () => {
    for (const m of MODELES) {
      const e = construireEquipe(m.cle, contexte)!;
      expect(e.conclusion.length).toBeGreaterThan(10);
      expect(e.actions.length).toBeGreaterThan(0);
      for (const a of e.actions)
        expect(a.echeance).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('un verdict durable rend les achats urgents, un buzz non', () => {
    expect(construireEquipe('achats', contexte)!.urgence).toBe('Urgent');
    expect(
      construireEquipe('achats', { ...contexte, verdict: 'buzz' })!.urgence,
    ).toBe('À préparer');
  });

  it('le substitut, s’il existe, devient une action', () => {
    const avec = construireEquipe('achats', contexte)!;
    const sans = construireEquipe('achats', { ...contexte, substitut: null })!;
    expect(avec.actions.some((a) => a.texte.includes('Arôme pistache'))).toBe(
      true,
    );
    expect(sans.actions).toHaveLength(avec.actions.length - 1);
  });

  it('équipe inconnue : rien', () => {
    expect(construireEquipe('inconnue', contexte)).toBeNull();
  });

  it('les échéances partent de la date de décision', () => {
    expect(apres(new Date('2026-11-12T10:00:00Z'), 7)).toBe('2026-11-19');
  });
});
