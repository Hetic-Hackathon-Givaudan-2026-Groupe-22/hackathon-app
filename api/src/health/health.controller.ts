import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import pg from 'pg';
import { DB } from '../database/database.module.js';

@Controller('health')
export class HealthController {
  constructor(@Inject(DB) private readonly db: pg.Pool) {}

  // GET /api/health : l'API répond et la base aussi
  @Get()
  async check() {
    try {
      const { rows } = await this.db.query<{ version: string }>(
        'SELECT version()',
      );
      return { status: 'ok', db: rows[0].version };
    } catch {
      throw new ServiceUnavailableException('Base de données injoignable');
    }
  }
}
