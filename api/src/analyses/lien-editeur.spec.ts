import { lienEditeur } from './analyse-simulee.js';

// Tests unitaires des liens de sources (US-19)
describe('lienEditeur', () => {
  it('Google Trends : la recherche de la tendance, encodée', () => {
    expect(lienEditeur('Google Trends', "Fleur d'oranger")).toBe(
      "https://trends.google.com/trends/explore?q=Fleur%20d'oranger",
    );
  });

  it('éditeurs connus : leur page d’accueil', () => {
    expect(lienEditeur('USDA', 'pistache')).toBe('https://www.fas.usda.gov/');
  });

  it('éditeur sans lien connu : aucun lien inventé', () => {
    expect(lienEditeur('Financial Times', 'pistache')).toBeNull();
    expect(lienEditeur('Presse spécialisée', 'yuzu')).toBeNull();
  });
});
