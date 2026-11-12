import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { connecter, demarrerApi } from './setup.js';

// Test fonctionnel des tendances suivies (US-06)
describe('Tendances suivies (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];

  beforeAll(async () => {
    app = await demarrerApi();
    cookie = await connecter(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('un nouveau compte ne suit encore rien (étape passée)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/moi/suivis')
      .set('Cookie', cookie)
      .expect(200);
    expect(res.body).toEqual([]);
  });

  it('les tendances choisies apparaissent en premier dans la liste', async () => {
    await request(app.getHttpServer())
      .put('/api/moi/suivis')
      .set('Cookie', cookie)
      .send({ tendances: ['yuzu', 'ube'] })
      .expect(200);
    const res = await request(app.getHttpServer())
      .get('/api/tendances')
      .set('Cookie', cookie);
    const premieres = res.body.slice(0, 2).map((t: { slug: string }) => t.slug);
    expect(premieres.sort()).toEqual(['ube', 'yuzu']);
    expect(res.body.filter((t: { suivie: boolean }) => t.suivie)).toHaveLength(
      2,
    );

    const fiche = await request(app.getHttpServer())
      .get('/api/tendances/yuzu')
      .set('Cookie', cookie);
    expect(fiche.body.suivie).toBe(true);
  });

  it('changer d’avis remplace le choix', async () => {
    const res = await request(app.getHttpServer())
      .put('/api/moi/suivis')
      .set('Cookie', cookie)
      .send({ tendances: ['matcha'] })
      .expect(200);
    expect(res.body).toEqual(['matcha']);
  });

  it('une tendance inconnue est refusée (400), le choix reste intact', async () => {
    await request(app.getHttpServer())
      .put('/api/moi/suivis')
      .set('Cookie', cookie)
      .send({ tendances: ['matcha', 'inconnue'] })
      .expect(400);
    const res = await request(app.getHttpServer())
      .get('/api/moi/suivis')
      .set('Cookie', cookie);
    expect(res.body).toEqual(['matcha']);
  });

  it('sans session : 401', async () => {
    await request(app.getHttpServer()).get('/api/moi/suivis').expect(401);
  });
});
