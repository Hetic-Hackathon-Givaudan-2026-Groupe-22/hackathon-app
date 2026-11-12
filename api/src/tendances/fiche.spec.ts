import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service.js';
import { slugSchema, TendancesController } from './tendances.controller.js';
import { TendancesService } from './tendances.service.js';

// Tests unitaires de la fiche d'une tendance (US-13)
describe('TendancesController.fiche', () => {
  const service = { lister: vi.fn(), trouver: vi.fn() };
  let controller: TendancesController;

  beforeEach(async () => {
    service.trouver.mockReset();
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

  it('renvoie la tendance trouvée', async () => {
    service.trouver.mockResolvedValue({ slug: 'pistache' });
    await expect(controller.fiche('pistache')).resolves.toEqual({
      slug: 'pistache',
    });
  });

  it('répond 404 si la tendance n’existe pas', async () => {
    service.trouver.mockResolvedValue(undefined);
    await expect(controller.fiche('inconnue')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('slugSchema', () => {
  it('accepte minuscules, chiffres et tirets', () => {
    expect(slugSchema.safeParse('fleur-oranger').success).toBe(true);
  });

  it('refuse majuscules, espaces et caractères spéciaux', () => {
    expect(slugSchema.safeParse('Pistache').success).toBe(false);
    expect(slugSchema.safeParse('a b').success).toBe(false);
    expect(slugSchema.safeParse("x';--").success).toBe(false);
  });
});
