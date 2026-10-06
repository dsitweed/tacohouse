import { BadRequestException } from '@nestjs/common';
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
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    room: {
      update: jest.fn(),
    },
  };

  const mockRental = {
    id: 'rental-1',
    tenantId: 'tenant-1',
    roomId: 'room-1',
    status: 'ACTIVE',
    room: { id: 'room-1', building: { landlordId: 'landlord-1' } },
    tenant: { id: 'tenant-1', profile: {} },
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

  describe('update (tenant notice)', () => {
    const tenant = { id: 'tenant-1', role: UserRole.TENANT } as never;

    it('rejects a notice date less than 30 days away', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-15T00:00:00.000Z'));
      prisma.rental.findUnique.mockResolvedValue(mockRental);

      // 29 days away.
      const tooSoon = new Date('2024-02-13T00:00:00.000Z');

      await expect(
        service.update(tenant, 'rental-1', {
          noticeDate: tooSoon.toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.room.update).not.toHaveBeenCalled();
      expect(prisma.rental.update).not.toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('accepts a notice date exactly 30 days away', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-15T00:00:00.000Z'));
      prisma.rental.findUnique.mockResolvedValue(mockRental);
      prisma.rental.update.mockResolvedValue(mockRental);
      prisma.room.update.mockResolvedValue({ id: 'room-1' });

      // Exactly 30 days away: the old `setMonth(+1)` rule (2024-02-15) would
      // have wrongly rejected this.
      const exactly30 = new Date('2024-02-14T00:00:00.000Z');

      await service.update(tenant, 'rental-1', {
        noticeDate: exactly30.toISOString(),
      });

      expect(prisma.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { status: 'PENDING_CHECKOUT', availableFrom: exactly30 },
      });
      expect(prisma.rental.update).toHaveBeenCalledWith({
        where: { id: 'rental-1' },
        data: { noticeDate: exactly30, status: 'NOTICE_GIVEN' },
      });
      jest.useRealTimers();
    });
  });
});
