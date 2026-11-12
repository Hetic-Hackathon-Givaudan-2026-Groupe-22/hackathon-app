import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { connecter, demarrerApi } from './setup.js';

// Test fonctionnel du métier (US-05)
describe('Métier (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];

  beforeAll(async () => {
    app = await demarrerApi();
    cookie = await connecter(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('un nouveau compte n’a pas encore de métier', async () => {
    const moi = await request(app.getHttpServer())
      .get('/api/auth/moi')
      .set('Cookie', cookie);
    expect(moi.body.metier).toBeNull();
  });

  it('choisir puis modifier son métier dans la liste', async () => {
    const choix = await request(app.getHttpServer())
      .patch('/api/moi')
      .set('Cookie', cookie)
      .send({ metier: 'Achats' })
      .expect(200);
    expect(choix.body.metier).toBe('Achats');

    await request(app.getHttpServer())
      .patch('/api/moi')
      .set('Cookie', cookie)
      .send({ metier: 'Parfumeur' })
      .expect(200);
    const moi = await request(app.getHttpServer())
      .get('/api/auth/moi')
      .set('Cookie', cookie);
    expect(moi.body.metier).toBe('Parfumeur');
  });

  it('un métier hors de la liste est refusé (400)', async () => {
    await request(app.getHttpServer())
      .patch('/api/moi')
      .set('Cookie', cookie)
      .send({ metier: 'Astronaute' })
      .expect(400);
  });

  it('sans session : 401', async () => {
    await request(app.getHttpServer())
      .patch('/api/moi')
      .send({ metier: 'Achats' })
      .expect(401);
  });
});
