import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { connecter, demarrerApi } from './setup.js';

// Test fonctionnel de la décision sur le verdict (US-25)
describe('Verdict (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];

  const lancer = async (tendance: string, duree: string) => {
    process.env.ANALYSE_DUREE_MS = duree;
    const { body } = await request(app.getHttpServer())
      .post('/api/analyses')
      .send({ tendance });
    return body.id as number;
  };

  beforeAll(async () => {
    app = await demarrerApi();
    cookie = await connecter(app);
  });

  afterAll(async () => {
    delete process.env.ANALYSE_DUREE_MS;
    await app.close();
  });

  it('US-25 : valider passe le verdict à « Validé » avec la date et le nom', async () => {
    const id = await lancer('matcha', '0');
    const avant = Date.now();
    const { body } = await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/validation`)
      .set('Cookie', cookie)
      .expect(200);
    expect(body.verdict.statut).toBe('valide');
    expect(body.verdict.decidePar).toBe('Camille Testeuse');
    expect(new Date(body.verdict.decideLe).getTime()).toBeGreaterThanOrEqual(
      avant - 1000,
    );

    // Le verdict validé reste validé quand on revient sur l'analyse
    const relu = await request(app.getHttpServer()).get(`/api/analyses/${id}`);
    expect(relu.body.verdict.statut).toBe('valide');
  });

  it('US-25 : un verdict déjà validé ne se revalide pas (409)', async () => {
    const id = await lancer('yuzu', '0');
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/validation`)
      .set('Cookie', cookie)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/validation`)
      .set('Cookie', cookie)
      .expect(409);
  });

  it('US-25 : pas de validation pendant l’analyse (409)', async () => {
    const id = await lancer('ube', '60000');
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/validation`)
      .set('Cookie', cookie)
      .expect(409);
  });

  it('404 pour une analyse inconnue', async () => {
    await request(app.getHttpServer())
      .post('/api/analyses/999999/verdict/validation')
      .set('Cookie', cookie)
      .expect(404);
  });
});
