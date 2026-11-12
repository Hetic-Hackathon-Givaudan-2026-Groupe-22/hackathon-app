import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// En dev, la configuration vient de api/.env ; en production, de l'hébergeur
try {
  process.loadEnvFile();
} catch {
  // Pas de .env : on garde l'environnement tel quel
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Toutes les routes sous /api : le front les relaie avec ce préfixe
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
