import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { connecter, demarrerApi } from './setup.js';

// Test fonctionnel de l'ajout d'une équipe au plan (US-28)
describe('Ajouter une équipe au plan (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];
  let id: number;
  const ajouter = (equipe: string) =>
    request(app.getHttpServer())
      .post(`/api/analyses/${id}/plan/equipes`)
      .set('Cookie', cookie)
      .send({ equipe });

  beforeAll(async () => {
    app = await demarrerApi();
    cookie = await connecter(app);
    process.env.ANALYSE_DUREE_MS = '0';
    id = (
      await request(app.getHttpServer())
        .post('/api/analyses')
        .send({ tendance: 'yuzu' })
    ).body.id;
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/validation`)
      .set('Cookie', cookie)
      .expect(200);
  });

  afterAll(async () => {
    delete process.env.ANALYSE_DUREE_MS;
    await app.close();
  });

  it('l’équipe choisie apparaît dans le plan et quitte la liste proposée', async () => {
    const res = await ajouter('finance').expect(201);
    const cles = res.body.equipes.map((e: { cle: string }) => e.cle);
    expect(cles).toEqual([
      'achats',
      'commerciaux',
      'marketing',
      'labos',
      'finance',
    ]);
    expect(
      res.body.disponibles.map((d: { cle: string }) => d.cle),
    ).not.toContain('finance');

    // L'ajout est enregistré : il reste au retour sur le plan
    const relu = await request(app.getHttpServer())
      .get(`/api/analyses/${id}/plan`)
      .set('Cookie', cookie);
    expect(relu.body.equipes.at(-1).cle).toBe('finance');
  });

  it('une équipe déjà présente n’est pas ajoutée une seconde fois (409)', async () => {
    await ajouter('finance').expect(409);
    await ajouter('achats').expect(409);
  });

  it('une équipe inconnue est refusée (400)', async () => {
    await ajouter('astronautes').expect(400);
  });
});
