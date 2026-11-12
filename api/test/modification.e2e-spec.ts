import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { connecter, demarrerApi } from './setup.js';

// Test fonctionnel de la modification du verdict (US-26)
describe('Modification du verdict (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];

  const lancer = async (tendance: string) => {
    process.env.ANALYSE_DUREE_MS = '0';
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

  it('une justification est demandée avant d’enregistrer (400)', async () => {
    const id = await lancer('pistache');
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/modification`)
      .set('Cookie', cookie)
      .send({ verdict: 'buzz', justification: '' })
      .expect(400);
    const relu = await request(app.getHttpServer()).get(`/api/analyses/${id}`);
    expect(relu.body.verdict.statut).toBe('propose');
  });

  it('le verdict proposé par Sillage reste visible à côté de celui de Camille', async () => {
    const id = await lancer('pistache');
    const { body } = await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/modification`)
      .set('Cookie', cookie)
      .send({
        verdict: 'buzz',
        justification: 'Les commandes de nos clients baissent depuis un mois.',
      })
      .expect(200);
    expect(body.verdict).toMatchObject({
      statut: 'modifie',
      propose: 'durable',
      final: 'buzz',
      justification: 'Les commandes de nos clients baissent depuis un mois.',
      decidePar: 'Camille Testeuse',
    });
  });

  it('refuse de « modifier » vers le verdict déjà proposé (400)', async () => {
    const id = await lancer('pistache');
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/modification`)
      .set('Cookie', cookie)
      .send({
        verdict: 'durable',
        justification: 'Je suis d’accord avec Sillage.',
      })
      .expect(400);
  });

  it('un verdict déjà décidé ne se modifie plus (409)', async () => {
    const id = await lancer('matcha');
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/validation`)
      .set('Cookie', cookie)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/modification`)
      .set('Cookie', cookie)
      .send({ verdict: 'buzz', justification: 'Changement d’avis après coup.' })
      .expect(409);
  });
});
