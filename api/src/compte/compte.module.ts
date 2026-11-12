import { Module } from '@nestjs/common';
import { CompteController } from './compte.controller.js';
import { CompteService } from './compte.service.js';

@Module({
  controllers: [CompteController],
  providers: [CompteService],
})
export class CompteModule {}
