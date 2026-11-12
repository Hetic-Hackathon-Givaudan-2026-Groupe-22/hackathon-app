import { AGENTS, statutsAgents } from './agents.js';

// Tests unitaires de la progression des agents (US-14, US-15)
describe('statutsAgents', () => {
  const duree = 6000;

  it('5 agents, chacun avec son rôle', () => {
    const etats = statutsAgents(0, duree);
    expect(etats).toHaveLength(5);
    expect(etats.every((a) => a.role.length > 0)).toBe(true);
    expect(etats.map((a) => a.nom)).toEqual(AGENTS.map((a) => a.nom));
  });

  it('au démarrage, le premier agent travaille et les autres attendent', () => {
    expect(statutsAgents(0, duree).map((a) => a.statut)).toEqual([
      'en_cours',
      'en_attente',
      'en_attente',
      'en_attente',
      'en_attente',
    ]);
  });

  it('à mi-parcours, les trois statuts coexistent', () => {
    const statuts = statutsAgents(3000, duree).map((a) => a.statut);
    expect(statuts).toContain('termine');
    expect(statuts).toContain('en_cours');
    expect(statuts).toContain('en_attente');
  });

  it('à la fin de la durée, tous ont terminé', () => {
    expect(
      statutsAgents(duree, duree).every((a) => a.statut === 'termine'),
    ).toBe(true);
  });

  it('une durée nulle termine tout de suite', () => {
    expect(statutsAgents(0, 0).every((a) => a.statut === 'termine')).toBe(true);
  });
});
