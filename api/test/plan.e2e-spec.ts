import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { connecter, demarrerApi } from './setup.js';

// Test fonctionnel du plan d'action (US-27)
describe('Plan d’action (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];
  const lancer = async () => {
    const { body } = await request(app.getHttpServer())
      .post('/api/analyses')
      .send({ tendance: 'pistache' });
    return body.id as number;
  };

  beforeAll(async () => {
    app = await demarrerApi();
    cookie = await connecter(app);
    process.env.ANALYSE_DUREE_MS = '0';
  });

  afterAll(async () => {
    delete process.env.ANALYSE_DUREE_MS;
    await app.close();
  });

  it('verdict pas encore validé : 409 avec une invitation à le valider', async () => {
    const id = await lancer();
    const res = await request(app.getHttpServer())
      .get(`/api/analyses/${id}/plan`)
      .set('Cookie', cookie)
      .expect(409);
    expect(res.body.message).toContain("Validez d'abord le verdict");
  });

  it('verdict validé : les actions regroupées par équipe', async () => {
    const id = await lancer();
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/validation`)
      .set('Cookie', cookie)
      .expect(200);
    const res = await request(app.getHttpServer())
      .get(`/api/analyses/${id}/plan`)
      .set('Cookie', cookie)
      .expect(200);
    expect(res.body.equipes.map((e: { cle: string }) => e.cle)).toEqual([
      'achats',
      'commerciaux',
      'marketing',
      'labos',
    ]);
    expect(res.body.equipes[0].actions.length).toBeGreaterThan(0);
    expect(res.body.disponibles.length).toBe(4);
  });

  it('sans session : 401', async () => {
    await request(app.getHttpServer()).get('/api/analyses/1/plan').expect(401);
  });
});
