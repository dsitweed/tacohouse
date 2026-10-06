import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'core/prisma/prisma.service';
import type { Building, User } from 'generated/prisma/client';
import { Prisma, UtilityRecord, UtilityType } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import {
  CreateUtilityRecordDto,
  FindAllUtilityRecordsDto,
  FindLatestUtilityRecordsDto,
} from './dto';

type UtilityRecordData = {
  roomId: string;
  utilityType: UtilityType;
  recordDate: Date;
  previousReading: Prisma.Decimal;
  currentReading: Prisma.Decimal;
  consumption: Prisma.Decimal;
  unitRate: Prisma.Decimal;
};

/** Readings are monthly, so they are always stored on the first day of the month. */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfPeriod(period: string): Date {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function toUsage(value: number | Prisma.Decimal): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(3);
}

@Injectable()
export class UtilityRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    currentUser: User,
    dto: CreateUtilityRecordDto,
  ): Promise<UtilityRecord> {
    const [record] = await this.createMany(currentUser, [dto]);
    return record;
  }

  async createMany(
    currentUser: User,
    dtos: CreateUtilityRecordDto[],
  ): Promise<UtilityRecord[]> {
    const prepared: UtilityRecordData[] = [];
    for (const dto of dtos) {
      prepared.push(await this.prepareRecord(currentUser, dto));
    }

    return this.prisma.$transaction(
      prepared.map((data) =>
        this.prisma.utilityRecord.upsert({
          where: {
            roomId_utilityType_recordDate: {
              roomId: data.roomId,
              utilityType: data.utilityType,
              recordDate: data.recordDate,
            },
          },
          create: data,
          update: {
            previousReading: data.previousReading,
            currentReading: data.currentReading,
            consumption: data.consumption,
            unitRate: data.unitRate,
          },
        }),
      ),
    );
  }

  async findAll(
    currentUser: User,
    query: FindAllUtilityRecordsDto,
  ): Promise<UtilityRecord[]> {
    const where: Prisma.UtilityRecordWhereInput = {};

    if (query.roomId) where.roomId = query.roomId;
    if (query.utilityType) where.utilityType = query.utilityType;

    if (query.period) {
      const from = startOfPeriod(query.period);
      const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
      where.recordDate = { gte: from, lt: to };
    }

    where.room = this.buildRoomScope(currentUser, query.buildingId);

    return this.prisma.utilityRecord.findMany({
      where,
      orderBy: [{ recordDate: 'desc' }, { utilityType: 'asc' }],
    });
  }

  /**
   * Latest reading per utility type. With `period`, returns the reading from
   * before that month — the value that seeds the next billing period.
   */
  async findLatest(
    currentUser: User,
    query: FindLatestUtilityRecordsDto,
  ): Promise<UtilityRecord[]> {
    const where: Prisma.UtilityRecordWhereInput = {};

    if (query.roomId) where.roomId = query.roomId;
    if (query.period) {
      where.recordDate = { lt: startOfPeriod(query.period) };
    }

    where.room = this.buildRoomScope(currentUser, query.buildingId);

    const records = await this.prisma.utilityRecord.findMany({
      where,
      orderBy: [{ recordDate: 'desc' }],
    });

    // Keep the most recent record of each utility type.
    const latestByType = new Map<UtilityType, UtilityRecord>();
    for (const record of records) {
      if (!latestByType.has(record.utilityType)) {
        latestByType.set(record.utilityType, record);
      }
    }

    return Array.from(latestByType.values());
  }

  private async prepareRecord(
    currentUser: User,
    dto: CreateUtilityRecordDto,
  ): Promise<UtilityRecordData> {
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
      include: { building: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    this.assertCanManageRoom(currentUser, room.building.landlordId);

    const recordDate = startOfMonth(new Date(dto.recordDate));

    const previousReading =
      dto.previousReading !== undefined
        ? toUsage(dto.previousReading)
        : await this.getPreviousReading(room.id, dto.utilityType, recordDate);

    const currentReading = toUsage(dto.currentReading);

    if (currentReading.lessThan(previousReading)) {
      throw new BadRequestException(
        'currentReading must be greater than or equal to previousReading',
      );
    }

    return {
      roomId: room.id,
      utilityType: dto.utilityType,
      recordDate,
      previousReading,
      currentReading,
      consumption: toUsage(currentReading.minus(previousReading)),
      unitRate: new Prisma.Decimal(
        dto.unitRate ?? this.rateFor(room.building, dto.utilityType),
      ).toDecimalPlaces(2),
    };
  }

  private async getPreviousReading(
    roomId: string,
    utilityType: UtilityType,
    beforeDate: Date,
  ): Promise<Prisma.Decimal> {
    const latest = await this.prisma.utilityRecord.findFirst({
      where: { roomId, utilityType, recordDate: { lt: beforeDate } },
      orderBy: { recordDate: 'desc' },
    });

    return latest?.currentReading ?? new Prisma.Decimal(0);
  }

  private rateFor(
    building: Building,
    utilityType: UtilityType,
  ): Prisma.Decimal {
    switch (utilityType) {
      case UtilityType.ELECTRICITY:
        return building.electricityRate;
      case UtilityType.WATER:
        return building.waterRate;
      case UtilityType.GAS:
        return building.gasRate;
    }
  }

  private assertCanManageRoom(currentUser: User, landlordId: string) {
    if (currentUser.role === UserRole.ADMIN) return;

    if (
      currentUser.role === UserRole.LANDLORD &&
      landlordId === currentUser.id
    ) {
      return;
    }

    throw new ForbiddenException(
      'You can only manage utility records for your own buildings',
    );
  }

  private buildRoomScope(
    currentUser: User,
    buildingId?: string,
  ): Prisma.RoomWhereInput {
    const scope: Prisma.RoomWhereInput = {};

    if (buildingId) scope.buildingId = buildingId;

    if (currentUser.role === UserRole.LANDLORD) {
      scope.building = { landlordId: currentUser.id };
    } else if (currentUser.role === UserRole.TENANT) {
      scope.rentals = {
        some: { tenantId: currentUser.id, status: 'ACTIVE' },
      };
    }

    return scope;
  }
}
