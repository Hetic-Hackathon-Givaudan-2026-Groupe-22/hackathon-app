import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { demarrerApi } from './setup.js';

// Test fonctionnel du changement de mot de passe (US-04)
describe('Changer son mot de passe (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];
  const email = `mdp.${Date.now()}@exemple.test`;
  const changer = (corps: object) =>
    request(app.getHttpServer())
      .put('/api/moi/mot-de-passe')
      .set('Cookie', cookie)
      .send(corps);

  beforeAll(async () => {
    app = await demarrerApi();
    const res = await request(app.getHttpServer())
      .post('/api/auth/inscription')
      .send({ nom: 'Camille', email, motDePasse: 'ancien-mot-de-passe' });
    cookie = res.headers['set-cookie'] as unknown as string[];
  });

  afterAll(async () => {
    await app.close();
  });

  it('deux saisies différentes du nouveau mot de passe : refusé, message clair', async () => {
    const res = await changer({
      ancien: 'ancien-mot-de-passe',
      nouveau: 'nouveau-mot-de-passe',
      confirmation: 'autre-chose-123',
    }).expect(400);
    expect(res.body.message).toBe(
      'Les deux saisies du nouveau mot de passe diffèrent.',
    );
  });

  it('ancien mot de passe faux : refusé', async () => {
    const res = await changer({
      ancien: 'faux',
      nouveau: 'nouveau-mot-de-passe',
      confirmation: 'nouveau-mot-de-passe',
    }).expect(400);
    expect(res.body.message).toBe('Mot de passe actuel incorrect.');
  });

  it('changement réussi : seul le nouveau mot de passe ouvre une session', async () => {
    await changer({
      ancien: 'ancien-mot-de-passe',
      nouveau: 'nouveau-mot-de-passe',
      confirmation: 'nouveau-mot-de-passe',
    }).expect(204);
    await request(app.getHttpServer())
      .post('/api/auth/connexion')
      .send({ email, motDePasse: 'ancien-mot-de-passe' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/connexion')
      .send({ email, motDePasse: 'nouveau-mot-de-passe' })
      .expect(200);
  });

  it('sans session : 401', async () => {
    await request(app.getHttpServer())
      .put('/api/moi/mot-de-passe')
      .send({ ancien: 'a', nouveau: 'b', confirmation: 'b' })
      .expect(401);
  });
});
