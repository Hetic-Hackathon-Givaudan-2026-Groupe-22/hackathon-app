import { Test } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service.js';
import {
  rechercheSchema,
  TendancesController,
} from './tendances.controller.js';
import { motifRecherche, TendancesService } from './tendances.service.js';

// Tests unitaires : le contrôleur délègue au service, sans base
describe('TendancesController', () => {
  const service = { lister: vi.fn() };
  let controller: TendancesController;

  beforeEach(async () => {
    service.lister.mockReset();
    const moduleRef = await Test.createTestingModule({
      controllers: [TendancesController],
      providers: [
        { provide: TendancesService, useValue: service },
        {
          provide: AuthService,
          useValue: { utilisateurDeSession: async () => null },
        },
      ],
    }).compile();
    controller = moduleRef.get(TendancesController);
  });

  it('renvoie la liste du service', async () => {
    service.lister.mockResolvedValue([{ slug: 'pistache' }]);
    await expect(controller.lister({})).resolves.toEqual([
      { slug: 'pistache' },
    ]);
  });

  it('transmet le mot-clé, et ignore un mot-clé vide', async () => {
    service.lister.mockResolvedValue([]);
    await controller.lister({ q: 'pist' });
    await controller.lister({ q: '' });
    expect(service.lister.mock.calls).toEqual([
      ['pist', undefined],
      [undefined, undefined],
    ]);
  });
});

describe('rechercheSchema (US-10)', () => {
  it('retire les espaces autour du mot-clé', () => {
    expect(rechercheSchema.parse({ q: '  matcha ' })).toEqual({ q: 'matcha' });
  });

  it('refuse un mot-clé de plus de 60 caractères', () => {
    expect(rechercheSchema.safeParse({ q: 'x'.repeat(61) }).success).toBe(
      false,
    );
  });
});

describe('motifRecherche (US-10)', () => {
  it('cherche le mot-clé n’importe où', () => {
    expect(motifRecherche('pist')).toBe('%pist%');
  });

  it('échappe les jokers SQL', () => {
    expect(motifRecherche('50%_')).toBe('%50\\%\\_%');
  });
});
