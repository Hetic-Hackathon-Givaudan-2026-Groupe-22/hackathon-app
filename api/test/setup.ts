import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';

// Démarre l'API complète, branchée sur la vraie base (DATABASE_URL, données de npm run db:seed)
export async function demarrerApi(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = configureApp(moduleRef.createNestApplication());
  await app.init();
  return app as INestApplication<App>;
}

// Crée un compte jetable « Camille Testeuse » et renvoie son cookie de session
export async function connecter(app: INestApplication<App>): Promise<string[]> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/inscription')
    .send({
      nom: 'Camille Testeuse',
      email: `test.${Date.now()}.${Math.random().toString(36).slice(2)}@exemple.test`,
      motDePasse: 'motdepasse-test',
    })
    .expect(201);
  return res.headers['set-cookie'] as unknown as string[];
}
