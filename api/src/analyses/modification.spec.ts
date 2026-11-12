import { modificationSchema } from './analyses.controller.js';

// Tests unitaires du schéma de modification du verdict (US-26)
describe('modificationSchema', () => {
  it('accepte un verdict et une justification', () => {
    expect(
      modificationSchema.safeParse({
        verdict: 'buzz',
        justification: 'Les ventes ont chuté au troisième trimestre.',
      }).success,
    ).toBe(true);
  });

  it('refuse une justification vide ou trop courte, même avec des espaces', () => {
    expect(
      modificationSchema.safeParse({ verdict: 'buzz', justification: '' })
        .success,
    ).toBe(false);
    expect(
      modificationSchema.safeParse({
        verdict: 'buzz',
        justification: '        court      ',
      }).success,
    ).toBe(false);
  });

  it('refuse un verdict inconnu', () => {
    expect(
      modificationSchema.safeParse({
        verdict: 'peut-être',
        justification: 'Une justification assez longue.',
      }).success,
    ).toBe(false);
  });
});
