import { Test } from '@nestjs/testing';
import { TendancesController } from './tendances.controller.js';
import { TendancesService } from './tendances.service.js';

// Test unitaire : le contrôleur délègue au service, sans base
describe('TendancesController', () => {
  const service = { lister: vi.fn() };
  let controller: TendancesController;

  beforeEach(async () => {
    service.lister.mockReset();
    const moduleRef = await Test.createTestingModule({
      controllers: [TendancesController],
      providers: [{ provide: TendancesService, useValue: service }],
    }).compile();
    controller = moduleRef.get(TendancesController);
  });

  it('renvoie la liste du service', async () => {
    service.lister.mockResolvedValue([{ slug: 'pistache' }]);
    await expect(controller.lister()).resolves.toEqual([{ slug: 'pistache' }]);
  });
});
