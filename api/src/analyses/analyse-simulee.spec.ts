import { AnalyseSimulee } from './analyse-simulee.js';
import { AGENTS } from './agents.js';

// Tests unitaires du simulateur (ADR 0005)
describe('AnalyseSimulee', () => {
  const simulateur = new AnalyseSimulee();
  const tendance = (slug: string) => ({
    slug,
    nom: slug,
    famille: 'Gourmand',
    signaux: [
      {
        libelle: 'Recherches',
        valeur: '+10 %',
        source: 'Google Trends',
        demo: true,
      },
      {
        libelle: 'Pays',
        valeur: '3 sur 12',
        source: 'Google Trends',
        demo: true,
      },
      { libelle: 'Lancements', valeur: '4', source: 'Mintel', demo: true },
    ],
  });

  it('marque chaque résultat comme simulé', () => {
    expect(simulateur.analyser(tendance('pistache')).mode).toBe('dummy');
  });

  it('fait parler les 5 agents, le Stratège en dernier', () => {
    const { messages } = simulateur.analyser(tendance('matcha'));
    expect(new Set(messages.map((m) => m.agent))).toEqual(
      new Set(AGENTS.map((a) => a.nom)),
    );
    expect(messages.at(-1)?.agent).toBe('Stratège');
  });

  it('chaque réponse renvoie à un tour antérieur', () => {
    for (const m of simulateur.analyser(tendance('yuzu')).messages) {
      if (m.repondA !== null) expect(m.repondA).toBeLessThan(m.tour);
    }
  });

  it('positions entre 0 et 100', () => {
    for (const m of simulateur.analyser(tendance('ube')).messages) {
      expect(m.position).toBeGreaterThanOrEqual(0);
      expect(m.position).toBeLessThanOrEqual(100);
    }
  });

  it('le Dalgona est un buzz, sans réserve', () => {
    const { verdict } = simulateur.analyser(tendance('dalgona'));
    expect(verdict.propose).toBe('buzz');
    expect(verdict.reserve).toBeNull();
  });

  it('au plus 3 raisons, chacune reliée à un message', () => {
    const r = simulateur.analyser(tendance('pistache'));
    expect(r.verdict.raisons.length).toBeLessThanOrEqual(3);
    for (const raison of r.verdict.raisons) {
      expect(r.messages.some((m) => m.tour === raison.messageTour)).toBe(true);
    }
  });

  it('pistache : le prix réel du Financial Times (US-20)', () => {
    const { chaine } = simulateur.analyser(tendance('pistache'));
    expect(chaine.prix[0].detail).toContain('7,65');
    expect(chaine.prix[0].detail).toContain('10,30');
    expect(chaine.prix[0].source).toBe('Financial Times, 19/04/2025');
  });

  it('une tendance inconnue reçoit une chaîne générique en 3 maillons', () => {
    const { chaine } = simulateur.analyser(tendance('inconnue'));
    expect(chaine.notes.length).toBeGreaterThan(0);
    expect(chaine.matieres.length).toBeGreaterThan(0);
    expect(chaine.prix.length).toBeGreaterThan(0);
  });
});
