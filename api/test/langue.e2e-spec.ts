import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { demarrerApi } from './setup.js';

// Test fonctionnel de la langue gardée dans le compte (US-07)
describe('Langue de l’interface (e2e)', () => {
  let app: INestApplication<App>;
  const email = `langue.${Date.now()}@exemple.test`;

  beforeAll(async () => {
    app = await demarrerApi();
  });

  afterAll(async () => {
    await app.close();
  });

  it('un nouveau compte est en français', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/inscription')
      .send({ nom: 'Alex', email, motDePasse: 'motdepasse-test' });
    expect(res.body.langue).toBe('fr');
  });

  it('choisir l’anglais : la langue reste à la reconnexion', async () => {
    const connexion = await request(app.getHttpServer())
      .post('/api/auth/connexion')
      .send({ email, motDePasse: 'motdepasse-test' });
    const cookie = connexion.headers['set-cookie'];
    await request(app.getHttpServer())
      .patch('/api/moi')
      .set('Cookie', cookie)
      .send({ langue: 'en' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/auth/deconnexion')
      .set('Cookie', cookie);

    const retour = await request(app.getHttpServer())
      .post('/api/auth/connexion')
      .send({ email, motDePasse: 'motdepasse-test' })
      .expect(200);
    expect(retour.body.langue).toBe('en');
  });

  it('une langue inconnue ou un corps vide sont refusés (400)', async () => {
    const connexion = await request(app.getHttpServer())
      .post('/api/auth/connexion')
      .send({ email, motDePasse: 'motdepasse-test' });
    const cookie = connexion.headers['set-cookie'];
    await request(app.getHttpServer())
      .patch('/api/moi')
      .set('Cookie', cookie)
      .send({ langue: 'de' })
      .expect(400);
    await request(app.getHttpServer())
      .patch('/api/moi')
      .set('Cookie', cookie)
      .send({})
      .expect(400);
  });
});
