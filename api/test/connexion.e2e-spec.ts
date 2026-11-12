import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { demarrerApi } from './setup.js';

// Test fonctionnel de la connexion et de la déconnexion (US-03)
describe('Connexion (e2e)', () => {
  let app: INestApplication<App>;
  const email = `connexion.${Date.now()}@exemple.test`;

  beforeAll(async () => {
    app = await demarrerApi();
    await request(app.getHttpServer())
      .post('/api/auth/inscription')
      .send({ nom: 'Camille', email, motDePasse: 'bon-mot-de-passe' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('identifiants corrects : session ouverte, majuscules de l’e-mail ignorées', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/connexion')
      .send({ email: email.toUpperCase(), motDePasse: 'bon-mot-de-passe' })
      .expect(200);
    expect(res.body.email).toBe(email);
    expect(String(res.headers['set-cookie'])).toContain('HttpOnly');
  });

  it('mauvais mot de passe ou e-mail inconnu : le même message, sans dire lequel', async () => {
    const mauvaisMdp = await request(app.getHttpServer())
      .post('/api/auth/connexion')
      .send({ email, motDePasse: 'faux' })
      .expect(401);
    const inconnu = await request(app.getHttpServer())
      .post('/api/auth/connexion')
      .send({ email: 'personne@exemple.test', motDePasse: 'faux' })
      .expect(401);
    expect(mauvaisMdp.body.message).toBe('E-mail ou mot de passe incorrect.');
    expect(inconnu.body.message).toBe(mauvaisMdp.body.message);
  });

  it('la déconnexion supprime la session', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/connexion')
      .send({ email, motDePasse: 'bon-mot-de-passe' });
    const cookie = res.headers['set-cookie'];
    await request(app.getHttpServer())
      .post('/api/auth/deconnexion')
      .set('Cookie', cookie)
      .expect(204);
    await request(app.getHttpServer())
      .get('/api/auth/moi')
      .set('Cookie', cookie)
      .expect(401);
  });

  it('valider un verdict sans être connecté : 401', async () => {
    await request(app.getHttpServer())
      .post('/api/analyses/1/verdict/validation')
      .expect(401);
  });
});
