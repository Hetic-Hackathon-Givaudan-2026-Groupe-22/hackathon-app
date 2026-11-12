import { describe, expect, it } from 'vitest';
import { emailValide } from './session';

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
