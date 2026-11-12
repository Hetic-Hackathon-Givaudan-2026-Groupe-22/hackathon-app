import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';

// Réglages communs à main.ts et aux tests fonctionnels
export function configureApp(app: INestApplication) {
  // Toutes les routes sous /api : le front les relaie avec ce préfixe
  app.setGlobalPrefix('api');
  // Les schémas Zod de @Body({ schema }) et @Query({ schema }) sont appliqués (ADR 0008)
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  return app;
}
