import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { connecter, demarrerApi } from './setup.js';

// Test fonctionnel de l'historique des décisions (US-30)
describe('Historique des décisions (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];
  const lancer = async (tendance: string) =>
    (
      await request(app.getHttpServer())
        .post('/api/analyses')
        .send({ tendance })
    ).body.id as number;
  const decisions = () =>
    request(app.getHttpServer())
      .get('/api/moi/decisions')
      .set('Cookie', cookie);

  beforeAll(async () => {
    app = await demarrerApi();
    cookie = await connecter(app);
    process.env.ANALYSE_DUREE_MS = '0';
  });

  afterAll(async () => {
    delete process.env.ANALYSE_DUREE_MS;
    await app.close();
  });

  it('rien validé : liste vide', async () => {
    const res = await decisions().expect(200);
    expect(res.body).toEqual([]);
  });

  it('mes décisions, la plus récente d’abord, avec tendance, verdict et date', async () => {
    const premiere = await lancer('matcha');
    await request(app.getHttpServer())
      .post(`/api/analyses/${premiere}/verdict/validation`)
      .set('Cookie', cookie)
      .expect(200);
    const seconde = await lancer('pistache');
    await request(app.getHttpServer())
      .post(`/api/analyses/${seconde}/verdict/modification`)
      .set('Cookie', cookie)
      .send({
        verdict: 'buzz',
        justification: 'Nos ventes baissent depuis un mois.',
      })
      .expect(200);

    const res = await decisions();
    expect(res.body.map((d: { analyseId: number }) => d.analyseId)).toEqual([
      seconde,
      premiere,
    ]);
    expect(res.body[0]).toMatchObject({
      tendance: { slug: 'pistache', nom: 'Pistache' },
      propose: 'durable',
      retenu: 'buzz',
      statut: 'modifie',
    });
    expect(Date.parse(res.body[0].decideLe)).not.toBeNaN();
  });

  it('les décisions des autres n’apparaissent pas', async () => {
    const autre = await connecter(app);
    const res = await request(app.getHttpServer())
      .get('/api/moi/decisions')
      .set('Cookie', autre);
    expect(res.body).toEqual([]);
  });

  it('sans session : 401', async () => {
    await request(app.getHttpServer()).get('/api/moi/decisions').expect(401);
  });
});
