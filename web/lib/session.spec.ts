import { afterEach, describe, expect, it, vi } from 'vitest';
import { emailValide, initiales, lireSession, pagePublique } from './session';

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

describe('lireSession', () => {
  afterEach(() => vi.unstubAllGlobals());
  const reponse = (status: number, corps: unknown = {}) =>
    new Response(JSON.stringify(corps), { status });

  it('401 : pas de session, sans réessayer', async () => {
    const f = vi.fn(async () => reponse(401, { message: 'Connexion requise' }));
    vi.stubGlobal('fetch', f);
    await expect(lireSession(async () => undefined)).resolves.toBeNull();
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('API injoignable : réessaie, puis retrouve la session', async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('Internal Server Error', { status: 500 }),
      )
      .mockResolvedValueOnce(reponse(200, { id: 1, nom: 'Camille' }));
    vi.stubGlobal('fetch', f);
    await expect(lireSession(async () => undefined)).resolves.toMatchObject({
      nom: 'Camille',
    });
    expect(f).toHaveBeenCalledTimes(2);
  });
});
