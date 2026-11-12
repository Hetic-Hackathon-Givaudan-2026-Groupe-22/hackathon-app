import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { demarrerApi } from './setup.js';

// Test fonctionnel du lancement et du suivi d'une analyse (US-14)
describe('Analyses (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await demarrerApi();
  });

  afterAll(async () => {
    delete process.env.ANALYSE_DUREE_MS;
    await app.close();
  });

  it('US-14 : lancer une analyse démarre les 5 agents et rappelle le périmètre', async () => {
    process.env.ANALYSE_DUREE_MS = '60000';
    const { body: lance } = await request(app.getHttpServer())
      .post('/api/analyses')
      .send({ tendance: 'pistache' })
      .expect(201);
    expect(lance.id).toEqual(expect.any(Number));

    const { body } = await request(app.getHttpServer())
      .get(`/api/analyses/${lance.id}`)
      .expect(200);
    expect(body.statut).toBe('en_cours');
    expect(body.mode).toBe('dummy');
    expect(body.agents).toHaveLength(5);
    expect(body.perimetre).toEqual({
      tendance: { slug: 'pistache', nom: 'Pistache' },
      marche: 'Europe',
      periode: '24 derniers mois',
    });
    expect(body.ecouleMs).toBeLessThan(60000);
    // Rien n'est révélé avant la fin
    expect(body.messages).toBeUndefined();
  });

  it('une analyse terminée révèle messages, chaîne et verdict', async () => {
    process.env.ANALYSE_DUREE_MS = '0';
    const { body: lance } = await request(app.getHttpServer())
      .post('/api/analyses')
      .send({ tendance: 'dalgona' });
    const { body } = await request(app.getHttpServer()).get(
      `/api/analyses/${lance.id}`,
    );
    expect(body.statut).toBe('terminee');
    expect(
      body.agents.every((a: { statut: string }) => a.statut === 'termine'),
    ).toBe(true);
    expect(body.messages.length).toBeGreaterThanOrEqual(5);
    expect(body.verdict.propose).toBe('buzz');
    expect(body.chaine.prix.length).toBeGreaterThan(0);
  });

  it('refuse une tendance inconnue (404) ou mal formée (400)', async () => {
    await request(app.getHttpServer())
      .post('/api/analyses')
      .send({ tendance: 'inconnue' })
      .expect(404);
    await request(app.getHttpServer())
      .post('/api/analyses')
      .send({ tendance: 42 })
      .expect(400);
  });

  it('404 pour une analyse inconnue, 400 pour un identifiant invalide', async () => {
    await request(app.getHttpServer()).get('/api/analyses/999999').expect(404);
    await request(app.getHttpServer()).get('/api/analyses/abc').expect(400);
  });
});
