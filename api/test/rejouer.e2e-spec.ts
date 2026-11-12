import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { demarrerApi } from './setup.js';

// Test fonctionnel du rejeu d'une analyse (US-22)
describe('Rejouer l’analyse (e2e)', () => {
  let app: INestApplication<App>;
  const lancer = (corps: object) =>
    request(app.getHttpServer()).post('/api/analyses').send(corps);

  beforeAll(async () => {
    app = await demarrerApi();
    process.env.ANALYSE_DUREE_MS = '0';
  });

  afterAll(async () => {
    delete process.env.ANALYSE_DUREE_MS;
    await app.close();
  });

  it('relancer avec une période et 2 tendances à comparer : le résultat porte ses paramètres et sa date', async () => {
    const { body } = await lancer({
      tendance: 'yuzu',
      periodeMois: 12,
      comparer: ['matcha', 'dalgona'],
    }).expect(201);
    const a = await request(app.getHttpServer()).get(
      `/api/analyses/${body.id}`,
    );
    expect(a.body.parametres).toEqual({
      periodeMois: 12,
      comparaisons: ['matcha', 'dalgona'],
    });
    expect(a.body.perimetre.periode).toBe('12 derniers mois');
    expect(Date.parse(a.body.demarreeLe)).not.toBeNaN();
  });

  it('le premier résultat n’est pas écrasé : chaque rejeu s’ajoute à l’historique', async () => {
    const premier = (await lancer({ tendance: 'ube', periodeMois: 24 })).body
      .id;
    const second = (await lancer({ tendance: 'ube', periodeMois: 6 })).body.id;
    const h = await request(app.getHttpServer())
      .get('/api/analyses?tendance=ube')
      .expect(200);
    const ids = h.body.map((x: { id: number }) => x.id);
    expect(ids.indexOf(second)).toBeLessThan(ids.indexOf(premier));
    const p = await request(app.getHttpServer()).get(
      `/api/analyses/${premier}`,
    );
    expect(p.body.parametres.periodeMois).toBe(24);
  });

  it('refuse une période hors 6, 12, 24 ou plus de 2 comparaisons (400)', async () => {
    await lancer({ tendance: 'yuzu', periodeMois: 18 }).expect(400);
    await lancer({
      tendance: 'yuzu',
      comparer: ['ube', 'matcha', 'dalgona'],
    }).expect(400);
  });

  it('une tendance à comparer inconnue : 404', async () => {
    await lancer({ tendance: 'yuzu', comparer: ['inconnue'] }).expect(404);
  });

  it('les courbes : un point par mois, pour chaque tendance demandée', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/analyses/courbes?tendances=pistache,dalgona&mois=6')
      .expect(200);
    expect(res.body.map((c: { slug: string }) => c.slug)).toEqual([
      'pistache',
      'dalgona',
    ]);
    expect(res.body[0].points).toHaveLength(6);
  });
});
