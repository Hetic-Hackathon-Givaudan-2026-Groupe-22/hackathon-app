import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { demarrerApi } from './setup.js';

// Test fonctionnel des tendances, sur les données de démonstration
describe('Tendances (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await demarrerApi();
  });

  afterAll(async () => {
    await app.close();
  });

  it('US-09 : liste chaque tendance avec nom, famille, statut et date de début', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/tendances')
      .expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(6);
    expect(res.body[0]).toMatchObject({
      nom: expect.any(String),
      famille: expect.any(String),
      statut: expect.any(String),
      dateDebut: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
  });

  it('US-09 : les tendances suivies sont en tête', async () => {
    const res = await request(app.getHttpServer()).get('/api/tendances');
    const suivies: boolean[] = res.body.map(
      (t: { suivie: boolean }) => t.suivie,
    );
    const premiereNonSuivie = suivies.indexOf(false);
    expect(suivies.slice(premiereNonSuivie)).not.toContain(true);
    expect(suivies[0]).toBe(true);
  });
});
