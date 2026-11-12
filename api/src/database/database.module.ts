import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import pg from 'pg';

// Jeton d'injection du pool PostgreSQL : @Inject(DB) dans un service
export const DB = Symbol('DB');

// Une seule connexion à PostgreSQL (ADR 0002), partagée par toute l'API
@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: () =>
        new pg.Pool({ connectionString: process.env.DATABASE_URL }),
    },
  ],
  exports: [DB],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DB) private readonly pool: pg.Pool) {}

  // Ferme les connexions quand l'API s'arrête
  async onModuleDestroy() {
    await this.pool.end();
  }
}
