import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from 'communication/notifications/notifications.service';
import { PrismaService } from 'core/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { RoomType, UserRole, UtilityType } from 'generated/prisma/enums';

import { BillsService } from './bills.service';

const PERIOD = '2026-10';
const PERIOD_DATE = new Date(2026, 9, 1);

const BUILDING = {
  id: 'building-1',
  name: 'Test House',
  landlordId: 'landlord-1',
  billingDate: 5,
  electricityRate: new Prisma.Decimal('3500'),
  waterRate: new Prisma.Decimal('12000'),
  gasRate: new Prisma.Decimal('20000'),
  managementFee: new Prisma.Decimal('150000'),
  cleaningFeePerPerson: new Prisma.Decimal('50000'),
  lightingFee: new Prisma.Decimal('30000'),
  rooms: [] as unknown[],
};

function makeRoom(overrides: Record<string, unknown> = {}) {
  return {
    id: 'room-1',
    number: '101',
    roomType: RoomType.PARTIAL_RIGHTS,
    rentals: [
      {
        tenantId: 'tenant-1',
        monthlyRent: new Prisma.Decimal('3000000'),
        numberOfTenants: 2,
        tenant: {
          id: 'tenant-1',
          email: 'tenant1@example.com',
          profile: { firstName: 'An', lastName: 'Nguyen' },
        },
      },
    ],
    ...overrides,
  };
}

const landlord = { id: 'landlord-1', role: UserRole.LANDLORD } as never;

describe('BillsService – bill generation', () => {
  let service: BillsService;

  const prisma = {
    building: { findUnique: jest.fn() },
    utilityRecord: { findMany: jest.fn(), upsert: jest.fn() },
    bill: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const notifications = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<BillsService>(BillsService);

    prisma.building.findUnique.mockResolvedValue({
      ...BUILDING,
      rooms: [makeRoom()],
    });
    prisma.utilityRecord.findMany.mockResolvedValue([]);
    prisma.bill.groupBy.mockResolvedValue([]);
    prisma.bill.findMany.mockResolvedValue([]);
    prisma.$transaction.mockImplementation(
      (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          utilityRecord: { upsert: prisma.utilityRecord.upsert },
          bill: { create: prisma.bill.create, update: prisma.bill.update },
        }),
    );
    prisma.bill.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({
        id: 'bill-1',
        ...data,
      }),
    );
    notifications.create.mockResolvedValue({});
    jest.clearAllMocks();
  });

  describe('previewGeneration', () => {
    it('charges metered utilities and per-person cleaning for PARTIAL_RIGHTS', async () => {
      prisma.utilityRecord.findMany.mockResolvedValue([
        {
          roomId: 'room-1',
          utilityType: UtilityType.ELECTRICITY,
          currentReading: new Prisma.Decimal('1000'),
          recordDate: new Date(2026, 8, 1),
        },
      ]);

      const result = await service.previewGeneration(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
        readings: [
          {
            roomId: 'room-1',
            utilityType: UtilityType.ELECTRICITY,
            currentReading: 1150,
          },
          {
            roomId: 'room-1',
            utilityType: UtilityType.WATER,
            currentReading: 108,
            previousReading: 100,
          },
        ],
      });

      const row = result.rows[0];
      // electricity: 150 kWh * 3500, water: 8 * 12000
      expect(row.electricityAmount).toBe('525000.00');
      expect(row.waterAmount).toBe('96000.00');
      // gas has no reading -> 0 and a warning
      expect(row.gasAmount).toBe('0.00');
      expect(row.warnings).toContain('Thiếu chỉ số gas — tính 0');
      // cleaning = 50000 * 2 tenants
      expect(row.cleaningFee).toBe('100000.00');
      // rent + electricity + water + management + cleaning + lighting (no gas)
      expect(row.totalAmount).toBe('3901000.00');
      expect(row.status).toBe('WARNING');
    });

    it('never charges utilities for FULL_RIGHTS rooms', async () => {
      prisma.building.findUnique.mockResolvedValue({
        ...BUILDING,
        rooms: [makeRoom({ roomType: RoomType.FULL_RIGHTS })],
      });

      const result = await service.previewGeneration(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
      });

      const row = result.rows[0];
      expect(row.electricityAmount).toBe('0.00');
      expect(row.waterAmount).toBe('0.00');
      expect(row.gasAmount).toBe('0.00');
      expect(row.warnings).toEqual([]);
      expect(row.status).toBe('READY');
      expect(row.totalAmount).toBe('3280000.00');
    });

    it('carries previous debt from unpaid bills of earlier periods', async () => {
      prisma.bill.groupBy.mockResolvedValue([
        {
          roomId: 'room-1',
          _sum: { totalAmount: new Prisma.Decimal('250000') },
        },
      ]);

      const result = await service.previewGeneration(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
      });

      const row = result.rows[0];
      expect(row.previousDebt).toBe('250000.00');
      expect(row.totalAmount).toBe('3530000.00');
    });

    it('skips rooms without an active rental', async () => {
      prisma.building.findUnique.mockResolvedValue({
        ...BUILDING,
        rooms: [makeRoom({ rentals: [] })],
      });

      const result = await service.previewGeneration(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
      });

      expect(result.rows[0].status).toBe('SKIPPED');
      expect(result.rows[0].warnings).toContain(
        'Phòng chưa có hợp đồng đang thuê',
      );
      expect(result.summary.skipped).toBe(1);
    });

    it('skips (not overwrites) a room that already has a bill for the period', async () => {
      prisma.bill.findMany.mockResolvedValue([
        { id: 'existing-bill', roomId: 'room-1' },
      ]);

      const result = await service.previewGeneration(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
      });

      expect(result.rows[0].status).toBe('SKIPPED');
      expect(result.rows[0].existingBillId).toBe('existing-bill');
      expect(result.summary.totalAmount).toBe('0.00');
    });

    it('marks the row as overridable when overwrite is requested', async () => {
      prisma.bill.findMany.mockResolvedValue([
        { id: 'existing-bill', roomId: 'room-1' },
      ]);

      const result = await service.previewGeneration(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
        overwrite: true,
      });

      expect(result.rows[0].status).toBe('WARNING');
      expect(result.rows[0].warnings).toContain(
        'Đã có hóa đơn kỳ này — sẽ ghi đè',
      );
      expect(result.summary.ready + result.summary.warnings).toBe(1);
    });

    it('defaults the due date to the building billing day of the next month', async () => {
      const result = await service.previewGeneration(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
      });

      // Compare in local time: the ISO string shifts by the UTC offset.
      const due = new Date(result.dueDate);
      expect([due.getFullYear(), due.getMonth() + 1, due.getDate()]).toEqual([
        2026, 11, 5,
      ]);
    });

    it('skips a room whose current reading is below the previous one', async () => {
      const result = await service.previewGeneration(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
        readings: [
          {
            roomId: 'room-1',
            utilityType: UtilityType.ELECTRICITY,
            currentReading: 100,
            previousReading: 500,
          },
        ],
      });

      expect(result.rows[0].status).toBe('SKIPPED');
      expect(result.rows[0].warnings.join(' ')).toContain('electricity');
    });

    it("forbids a landlord from previewing another landlord's building", async () => {
      await expect(
        service.previewGeneration(
          { id: 'other-landlord', role: UserRole.LANDLORD } as never,
          { buildingId: 'building-1', billingPeriod: PERIOD },
        ),
      ).rejects.toThrow('You can only generate bills for your own buildings');
    });

    it('exposes resolved meter readings so the wizard can pre-fill them', async () => {
      prisma.utilityRecord.findMany.mockResolvedValue([
        {
          roomId: 'room-1',
          utilityType: UtilityType.ELECTRICITY,
          currentReading: new Prisma.Decimal('1000'),
          recordDate: new Date(2026, 8, 1),
        },
      ]);

      const result = await service.previewGeneration(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
        readings: [
          {
            roomId: 'room-1',
            utilityType: UtilityType.ELECTRICITY,
            currentReading: 1150,
          },
        ],
      });

      const meters = result.rows[0].meters;
      expect(meters).toHaveLength(3);

      const electricity = meters.find(
        (meter) => meter.utilityType === UtilityType.ELECTRICITY,
      );
      expect(electricity?.previousReading).toBe('1000.000');
      expect(electricity?.currentReading).toBe('1150.000');

      // Not entered yet: the wizard shows it as empty.
      const water = meters.find(
        (meter) => meter.utilityType === UtilityType.WATER,
      );
      expect(water?.currentReading).toBeNull();
    });

    it('forbids tenants from generating bills', async () => {
      await expect(
        service.previewGeneration(
          { id: 't1', role: UserRole.TENANT } as never,
          {
            buildingId: 'building-1',
            billingPeriod: PERIOD,
          },
        ),
      ).rejects.toThrow('Tenants cannot generate bills');
    });
  });

  describe('generateBills', () => {
    it('creates a PENDING bill and persists supplied readings', async () => {
      const result = await service.generateBills(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
        readings: [
          {
            roomId: 'room-1',
            utilityType: UtilityType.ELECTRICITY,
            currentReading: 1150,
            previousReading: 1000,
          },
        ],
      });

      expect(result.created).toBe(1);
      expect(prisma.bill.create).toHaveBeenCalledTimes(1);
      const createCalls = prisma.bill.create.mock.calls as unknown as [
        { data: Record<string, unknown> },
      ][];
      const data = createCalls[0][0].data;
      expect(data.status).toBe('PENDING');
      expect(data.billingPeriod).toEqual(PERIOD_DATE);
      expect(data.roomId).toBe('room-1');

      expect(prisma.utilityRecord.upsert).toHaveBeenCalledTimes(1);
      const upsertCalls = prisma.utilityRecord.upsert.mock.calls as unknown as [
        {
          where: { roomId_utilityType_recordDate: { recordDate: Date } };
          create: { consumption: Prisma.Decimal };
        },
      ][];
      const upsert = upsertCalls[0][0];
      expect(upsert.where.roomId_utilityType_recordDate.recordDate).toEqual(
        PERIOD_DATE,
      );
      expect(upsert.create.consumption.toFixed(3)).toBe('150.000');
    });

    it('notifies the tenant for each created bill', async () => {
      await service.generateBills(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
      });

      expect(notifications.create).toHaveBeenCalledTimes(1);
      expect(notifications.create).toHaveBeenCalledWith(
        landlord,
        expect.objectContaining({
          userId: 'tenant-1',
          type: 'BILL_GENERATED',
          relatedType: 'BILL',
        }),
      );
    });

    it('is idempotent: skips existing bills instead of duplicating them', async () => {
      prisma.bill.findMany.mockResolvedValue([
        { id: 'existing-bill', roomId: 'room-1' },
      ]);

      const result = await service.generateBills(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
      });

      expect(result.created).toBe(0);
      expect(result.skipped).toBe(1);
      expect(prisma.bill.create).not.toHaveBeenCalled();
      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('updates the existing bill when overwrite is true', async () => {
      prisma.bill.findMany.mockResolvedValue([
        { id: 'existing-bill', roomId: 'room-1' },
      ]);
      prisma.bill.update.mockResolvedValue({ id: 'existing-bill' });

      const result = await service.generateBills(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
        overwrite: true,
      });

      expect(result.created).toBe(1);
      expect(prisma.bill.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'existing-bill' } }),
      );
      expect(prisma.bill.create).not.toHaveBeenCalled();
    });

    it('reports a write failure without losing the other bills', async () => {
      prisma.building.findUnique.mockResolvedValue({
        ...BUILDING,
        rooms: [makeRoom(), makeRoom({ id: 'room-2', number: '102' })],
      });
      prisma.bill.create
        .mockRejectedValueOnce(new Error('unique constraint'))
        .mockImplementationOnce(
          ({ data }: { data: Record<string, unknown> }) => ({
            id: 'bill-2',
            ...data,
          }),
        );

      const result = await service.generateBills(landlord, {
        buildingId: 'building-1',
        billingPeriod: PERIOD,
      });

      expect(result.created).toBe(1);
      expect(result.failed).toEqual([
        { roomId: 'room-1', roomNumber: '101', reason: 'unique constraint' },
      ]);
    });
  });
});
