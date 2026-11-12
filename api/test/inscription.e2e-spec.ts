import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { demarrerApi } from './setup.js';

// Test fonctionnel de la création de compte (US-02)
describe('Inscription (e2e)', () => {
  let app: INestApplication<App>;
  const email = `camille.${Date.now()}@exemple.test`;

  beforeAll(async () => {
    app = await demarrerApi();
  });

  afterAll(async () => {
    await app.close();
  });

  it('crée le compte, ouvre la session (cookie httpOnly) et ne renvoie jamais le mot de passe', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/inscription')
      .send({ nom: 'Camille Martin', email, motDePasse: 'motdepasse-test' })
      .expect(201);
    expect(res.body).toMatchObject({ nom: 'Camille Martin', email });
    expect(JSON.stringify(res.body)).not.toContain('motdepasse-test');
    expect(res.body.motDePasse).toBeUndefined();
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toContain('sillage_session=');
    expect(cookie).toContain('HttpOnly');

    const moi = await request(app.getHttpServer())
      .get('/api/auth/moi')
      .set('Cookie', res.headers['set-cookie'])
      .expect(200);
    expect(moi.body.email).toBe(email);
  });

  it('un e-mail déjà utilisé : 409, avec une invitation à se connecter', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/inscription')
      .send({ nom: 'Autre', email, motDePasse: 'motdepasse-test' })
      .expect(409);
    expect(res.body.message).toContain('connectez-vous');
  });

  it('e-mail mal formé ou mot de passe trop court : 400, compte non créé', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/inscription')
      .send({ nom: 'X', email: 'pas-un-email', motDePasse: 'motdepasse-test' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/inscription')
      .send({
        nom: 'X',
        email: `court.${Date.now()}@exemple.test`,
        motDePasse: '1234',
      })
      .expect(400);
  });

  it('sans session, /api/auth/moi répond 401', async () => {
    await request(app.getHttpServer()).get('/api/auth/moi').expect(401);
  });
});
