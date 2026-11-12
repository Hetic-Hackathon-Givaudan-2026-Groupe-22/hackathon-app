import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../db/schema.js';

// Jetons d'injection : @Inject(DB) pour le pool, @Inject(DRIZZLE) pour les requêtes typées
export const DB = Symbol('DB');
export const DRIZZLE = Symbol('DRIZZLE');
export type Database = NodePgDatabase<typeof schema>;

// Une seule connexion à PostgreSQL (ADR 0002), partagée par toute l'API
@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: () =>
        new pg.Pool({ connectionString: process.env.DATABASE_URL }),
    },
    {
      provide: DRIZZLE,
      inject: [DB],
      useFactory: (pool: pg.Pool): Database => drizzle(pool, { schema }),
    },
  ],
  exports: [DB, DRIZZLE],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DB) private readonly pool: pg.Pool) {}

  // Ferme les connexions quand l'API s'arrête
  async onModuleDestroy() {
    await this.pool.end();
  }
}
