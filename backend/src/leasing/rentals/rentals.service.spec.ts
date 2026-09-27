import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'core/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import { RentalsService } from './rentals.service';

describe('RentalsService', () => {
  let service: RentalsService;
  const prisma = {
    rental: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<RentalsService>(RentalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calculates average rental term from start and end dates', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-01T00:00:00.000Z'));
    prisma.rental.count.mockResolvedValue(0);
    prisma.rental.findMany.mockResolvedValue([
      {
        startDate: new Date('2024-01-01T00:00:00.000Z'),
        endDate: new Date('2024-03-01T00:00:00.000Z'),
        monthlyRent: new Prisma.Decimal('123.45'),
        status: 'ACTIVE',
      },
      {
        startDate: new Date('2024-02-01T00:00:00.000Z'),
        endDate: null,
        monthlyRent: new Prisma.Decimal('678.90'),
        status: 'ACTIVE',
      },
    ]);

    const result = await service.getStats({
      id: 'admin-1',
      role: UserRole.ADMIN,
    } as never);

    expect(result.activeCount).toBe(2);
    expect(result.expiringCount).toBe(1);
    expect(result.averageTerm).toBe(2);
    expect(result.monthlyRevenue).toBe('802.35');
    expect(prisma.rental.count).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
