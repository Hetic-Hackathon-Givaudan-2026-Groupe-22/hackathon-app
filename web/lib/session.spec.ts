import { describe, expect, it } from 'vitest';
import { emailValide, initiales, pagePublique } from './session';

describe('emailValide (US-02)', () => {
  it('accepte une adresse bien formée', () => {
    expect(emailValide('camille.martin@givaudan.com')).toBe(true);
    expect(emailValide('  c@exemple.test ')).toBe(true);
  });

  it('refuse une adresse mal formée', () => {
    for (const e of ['', 'camille', 'camille@', '@givaudan.com', 'a b@c.d']) {
      expect(emailValide(e)).toBe(false);
    }
  });
});

describe('pagePublique (US-03)', () => {
  it('seul l’accueil est accessible sans connexion', () => {
    expect(pagePublique('/')).toBe(true);
    expect(pagePublique('/tendances')).toBe(false);
    expect(pagePublique('/analyses/3')).toBe(false);
  });
});

describe('initiales', () => {
  it('deux initiales au plus, en majuscules', () => {
    expect(initiales('camille martin')).toBe('CM');
    expect(initiales('Camille Anne Martin')).toBe('CA');
    expect(initiales('  ')).toBe('?');
  });
});
