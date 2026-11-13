import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { connecter, demarrerApi } from './setup.js';

// Test fonctionnel de l'envoi d'une alerte (US-29)
describe('Envoyer une alerte (e2e)', () => {
  let app: INestApplication<App>;
  let cookie: string[];
  let id: number;
  const envoyer = (corps: object) =>
    request(app.getHttpServer())
      .post(`/api/analyses/${id}/plan/alertes`)
      .set('Cookie', cookie)
      .send(corps);

  beforeAll(async () => {
    app = await demarrerApi();
    cookie = await connecter(app);
    process.env.ANALYSE_DUREE_MS = '0';
    id = (
      await request(app.getHttpServer())
        .post('/api/analyses')
        .send({ tendance: 'pistache' })
    ).body.id;
  });

  afterAll(async () => {
    delete process.env.ANALYSE_DUREE_MS;
    await app.close();
  });

  it('avant la validation du verdict : 409', async () => {
    await envoyer({
      canal: 'email',
      destinataires: ['achats@exemple.test'],
      lien: 'http://localhost:5173/analyses/1',
    }).expect(409);
  });

  it('envoi simulé : canal, nombre de destinataires et contenu avec tendance, verdict, score et lien', async () => {
    await request(app.getHttpServer())
      .post(`/api/analyses/${id}/verdict/validation`)
      .set('Cookie', cookie)
      .expect(200);
    const res = await envoyer({
      canal: 'email',
      destinataires: [
        'achats@exemple.test',
        'kam@exemple.test',
        'achats@exemple.test',
      ],
      lien: `http://localhost:5173/analyses/${id}`,
    }).expect(201);
    expect(res.body).toMatchObject({ canal: 'email', nombre: 2, simule: true });
    expect(res.body.contenu).toContain('Pistache');
    expect(res.body.contenu).toContain('Durable');
    expect(res.body.contenu).toContain('/100');
    expect(res.body.contenu).toContain(`/analyses/${id}`);
  });

  it('Teams accepte des noms ; un e-mail mal formé est refusé (400)', async () => {
    await envoyer({
      canal: 'teams',
      destinataires: ['Équipe achats'],
      lien: 'http://localhost:5173/analyses/1',
    }).expect(201);
    await envoyer({
      canal: 'email',
      destinataires: ['pas-un-email'],
      lien: 'http://localhost:5173/analyses/1',
    }).expect(400);
  });

  it('sans destinataire : 400', async () => {
    await envoyer({
      canal: 'slack',
      destinataires: [],
      lien: 'http://localhost:5173/analyses/1',
    }).expect(400);
  });
});
