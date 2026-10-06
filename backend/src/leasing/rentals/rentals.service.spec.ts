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
        status: 'NOTICE_GIVEN',
      },
      {
        startDate: new Date('2024-02-01T00:00:00.000Z'),
        endDate: null,
        monthlyRent: new Prisma.Decimal('678.90'),
        status: 'ACTIVE',
      },
      {
        startDate: new Date('2024-02-01T00:00:00.000Z'),
        endDate: new Date('2024-04-15T00:00:00.000Z'),
        monthlyRent: new Prisma.Decimal('100.00'),
        status: 'ACTIVE',
      },
    ]);

    const result = await service.getStats({
      id: 'admin-1',
      role: UserRole.ADMIN,
    } as never);

    expect(result.activeCount).toBe(2);
    // Tenant-driven event, independent from the end date.
    expect(result.noticeGivenCount).toBe(1);
    // Time-derived: only the ACTIVE rental ending within 30 days.
    expect(result.expiringSoonCount).toBe(1);
    expect(result.averageTerm).toBe(2.1);
    expect(result.monthlyRevenue).toBe('902.35');
    expect(prisma.rental.count).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('only counts ACTIVE rentals whose endDate is within the next 30 days', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-01T00:00:00.000Z'));
    prisma.rental.findMany.mockResolvedValue([
      {
        // Exactly on the 30-day boundary -> counted.
        startDate: new Date('2023-04-01T00:00:00.000Z'),
        endDate: new Date('2024-05-01T00:00:00.000Z'),
        monthlyRent: new Prisma.Decimal('1.00'),
        status: 'ACTIVE',
      },
      {
        // One day past the boundary -> not counted.
        startDate: new Date('2023-04-01T00:00:00.000Z'),
        endDate: new Date('2024-05-02T00:00:00.000Z'),
        monthlyRent: new Prisma.Decimal('1.00'),
        status: 'ACTIVE',
      },
      {
        // Already ended -> not counted.
        startDate: new Date('2023-04-01T00:00:00.000Z'),
        endDate: new Date('2024-03-31T00:00:00.000Z'),
        monthlyRent: new Prisma.Decimal('1.00'),
        status: 'ACTIVE',
      },
      {
        // Notice given: counted as notice, never as expiring soon.
        startDate: new Date('2023-04-01T00:00:00.000Z'),
        endDate: new Date('2024-04-20T00:00:00.000Z'),
        monthlyRent: new Prisma.Decimal('1.00'),
        status: 'NOTICE_GIVEN',
      },
    ]);

    const result = await service.getStats({
      id: 'admin-1',
      role: UserRole.ADMIN,
    } as never);

    expect(result.activeCount).toBe(3);
    expect(result.expiringSoonCount).toBe(1);
    expect(result.noticeGivenCount).toBe(1);
    jest.useRealTimers();
  });
});
