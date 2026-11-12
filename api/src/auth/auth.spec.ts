import { inscriptionSchema } from './auth.controller.js';
import { lireCookie } from './cookie.js';
import { hacher, verifier } from './mot-de-passe.js';

// Tests unitaires des comptes (US-02, ADR 0012)
describe('hacher et verifier', () => {
  it('le mot de passe n’est jamais stocké en clair', async () => {
    const stocke = await hacher('secret-de-test');
    expect(stocke).not.toContain('secret-de-test');
    expect(stocke.startsWith('scrypt$')).toBe(true);
  });

  it('reconnaît le bon mot de passe, refuse les autres', async () => {
    const stocke = await hacher('secret-de-test');
    await expect(verifier('secret-de-test', stocke)).resolves.toBe(true);
    await expect(verifier('mauvais', stocke)).resolves.toBe(false);
  });

  it('deux hachages du même mot de passe diffèrent (sel aléatoire)', async () => {
    expect(await hacher('abcdefgh')).not.toBe(await hacher('abcdefgh'));
  });

  it('refuse une empreinte mal formée', async () => {
    await expect(verifier('x', 'pas-une-empreinte')).resolves.toBe(false);
  });
});

describe('inscriptionSchema (US-02)', () => {
  const ok = {
    nom: 'Camille',
    email: 'c@exemple.test',
    motDePasse: '12345678',
  };

  it('accepte des champs valides', () => {
    expect(inscriptionSchema.safeParse(ok).success).toBe(true);
  });

  it('refuse un e-mail mal formé', () => {
    expect(
      inscriptionSchema.safeParse({ ...ok, email: 'pas-un-email' }).success,
    ).toBe(false);
  });

  it('refuse un mot de passe de moins de 8 caractères', () => {
    expect(
      inscriptionSchema.safeParse({ ...ok, motDePasse: '1234567' }).success,
    ).toBe(false);
  });
});

describe('lireCookie', () => {
  it('lit le cookie demandé parmi plusieurs', () => {
    expect(lireCookie('a=1; sillage_session=xyz; b=2', 'sillage_session')).toBe(
      'xyz',
    );
  });

  it('rien sans en-tête ni cookie', () => {
    expect(lireCookie(undefined, 'x')).toBeUndefined();
    expect(lireCookie('a=1', 'x')).toBeUndefined();
  });
});
