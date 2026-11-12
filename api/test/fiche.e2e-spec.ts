import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { demarrerApi } from './setup.js';

// Test fonctionnel de la fiche d'une tendance (US-13)
describe('Fiche d’une tendance (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await demarrerApi();
  });

  afterAll(async () => {
    await app.close();
  });

  it('montre nom, description et 3 à 4 signaux sourcés', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/tendances/pistache')
      .expect(200);
    expect(res.body.nom).toBe('Pistache');
    expect(res.body.description.length).toBeGreaterThan(20);
    expect(res.body.signaux.length).toBeGreaterThanOrEqual(3);
    expect(res.body.signaux.length).toBeLessThanOrEqual(4);
    for (const signal of res.body.signaux) {
      expect(signal.source).toBeTruthy();
      expect(typeof signal.demo).toBe('boolean');
    }
  });

  it('répond 404 pour une tendance inconnue', async () => {
    await request(app.getHttpServer())
      .get('/api/tendances/inconnue')
      .expect(404);
  });

  it('refuse un identifiant mal formé (Zod)', async () => {
    await request(app.getHttpServer()).get('/api/tendances/A%20B').expect(400);
  });
});
