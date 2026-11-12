import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { demarrerApi } from './setup.js';

// Test fonctionnel des sources d'une analyse terminée (US-18, US-19)
describe('Sources des messages (e2e)', () => {
  let app: INestApplication<App>;
  let messages: {
    agent: string;
    sources: {
      verifiee: boolean;
      titre: string;
      editeur: string;
      date: string;
    }[];
  }[];

  beforeAll(async () => {
    app = await demarrerApi();
    process.env.ANALYSE_DUREE_MS = '0';
    const { body } = await request(app.getHttpServer())
      .post('/api/analyses')
      .send({ tendance: 'pistache' });
    const res = await request(app.getHttpServer()).get(
      `/api/analyses/${body.id}`,
    );
    messages = res.body.messages;
  });

  afterAll(async () => {
    delete process.env.ANALYSE_DUREE_MS;
    await app.close();
  });

  it('US-18 : chaque source dit si elle est vérifiée', () => {
    const sources = messages.flatMap((m) => m.sources);
    expect(sources.length).toBeGreaterThan(0);
    for (const s of sources) expect(typeof s.verifiee).toBe('boolean');
  });

  it('US-18 : la source du Financial Times est vérifiée, les autres sont de démonstration', () => {
    const sources = messages.flatMap((m) => m.sources);
    expect(
      sources.some((s) => s.verifiee && s.editeur === 'Financial Times'),
    ).toBe(true);
    expect(sources.some((s) => !s.verifiee)).toBe(true);
  });

  it('US-18 : un message sans source existe (mention « Source à compléter »)', () => {
    expect(messages.some((m) => m.sources.length === 0)).toBe(true);
  });

  it('US-19 : chaque source garde titre, éditeur et date', () => {
    for (const s of messages.flatMap((m) => m.sources)) {
      expect(s.titre && s.editeur && s.date).toBeTruthy();
    }
  });
});
