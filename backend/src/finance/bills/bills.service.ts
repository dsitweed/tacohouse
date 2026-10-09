import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from 'communication/notifications/notifications.service';
import { buildPaginationMeta } from 'core/common/utils/pagination.util';
import { PrismaService } from 'core/prisma/prisma.service';
import { Bill, Prisma, User } from 'generated/prisma/client';
import {
  BillStatus,
  NotificationType,
  RelatedEntityType,
  RoomType,
  UserRole,
  UtilityType,
} from 'generated/prisma/enums';
import { PaginationMeta } from 'types';

import {
  BillCalculationError,
  type BillCalculationResult,
  calculateBillForRoom,
} from './bill-calculation';
import {
  type BillGenerationPreviewDto,
  type BillGenerationReadingDto,
  type BillGenerationResultDto,
  type BillGenerationRowDto,
  type BillGenerationRowStatus,
  ConfirmPaymentDto,
  CreateBillDto,
  FindAllBillsDto,
  GenerateBillsDto,
  UpdateBillDto,
} from './dto';

/** Utility types that a PARTIAL_RIGHTS room is billed for. */
const METERED_UTILITY_TYPES: UtilityType[] = [
  UtilityType.ELECTRICITY,
  UtilityType.WATER,
  UtilityType.GAS,
];

const UTILITY_LABELS: Record<UtilityType, string> = {
  [UtilityType.ELECTRICITY]: 'điện',
  [UtilityType.WATER]: 'nước',
  [UtilityType.GAS]: 'gas',
};

type PlannedReading = {
  utilityType: UtilityType;
  previousReading: Prisma.Decimal;
  currentReading: Prisma.Decimal;
  unitRate: Prisma.Decimal;
};

type PlannedMeter = {
  utilityType: UtilityType;
  previousReading: Prisma.Decimal;
  currentReading: Prisma.Decimal | null;
};

type GenerationPlanRow = {
  roomId: string;
  roomNumber: string;
  tenantId: string | null;
  tenantName: string | null;
  roomType: RoomType;
  status: BillGenerationRowStatus;
  warnings: string[];
  existingBillId: string | null;
  calculation: BillCalculationResult;
  /** Resolved meter state for the wizard (metered rooms only). */
  meters: PlannedMeter[];
  /** Only readings explicitly supplied by the caller are persisted. */
  readings: PlannedReading[];
};

type GenerationPlan = {
  buildingId: string;
  buildingName: string;
  billingPeriodDate: Date;
  dueDate: Date;
  rows: GenerationPlanRow[];
};

function startOfMonth(period: string): Date {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

/**
 * Default due date: the building's billing day in the month following the
 * billing period. Falls back to the 5th when the building has no billing day.
 */
function defaultDueDate(billingDate: number | null, periodStart: Date): Date {
  const year = periodStart.getFullYear();
  const month = periodStart.getMonth() + 1;
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.min(billingDate ?? 5, lastDayOfMonth);
  return new Date(year, month, day);
}

function toAmount(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

@Injectable()
export class BillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(currentUser: User, createBillDto: CreateBillDto): Promise<Bill> {
    const { roomId, billingPeriod, dueDate } = createBillDto;

    // Check if room exists and user has access
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        building: true,
        rentals: {
          where: {
            status: 'ACTIVE',
          },
          take: 1,
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check permissions - only Landlord and Admin can create bills
    if (currentUser.role === UserRole.LANDLORD) {
      if (room.building.landlordId !== currentUser.id) {
        throw new ForbiddenException(
          'You can only create bills for your buildings',
        );
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    // Check if room has active rental
    if (room.rentals.length === 0) {
      throw new BadRequestException('Room has no active rental');
    }

    // Calculate total amount
    const totalAmount =
      (createBillDto.monthlyRent || 0) +
      (createBillDto.electricityAmount || 0) +
      (createBillDto.waterAmount || 0) +
      (createBillDto.gasAmount || 0) +
      (createBillDto.managementFee || 0) +
      (createBillDto.cleaningFee || 0) +
      (createBillDto.lightingFee || 0) +
      (createBillDto.previousDebt || 0);

    // Create bill
    const bill = await this.prisma.bill.create({
      data: {
        ...createBillDto,
        billingPeriod: new Date(billingPeriod),
        dueDate: new Date(dueDate),
        totalAmount,
        status: BillStatus.PENDING,
      },
    });

    return bill;
  }

  async findAll(
    currentUser: User,
    query: FindAllBillsDto,
  ): Promise<{
    data: Bill[];
    pagination: PaginationMeta;
  }> {
    const { limit = 10, page = 1, roomId, status, billingPeriod } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BillWhereInput = {};

    // Apply filters
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;
    if (billingPeriod) {
      // billingPeriod is a "YYYY-MM" month; match any date inside it
      const [year, month] = billingPeriod.split('-').map(Number);
      where.billingPeriod = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    }

    // Authorization logic
    if (currentUser.role === UserRole.ADMIN) {
      // Admin can see all bills
    } else if (currentUser.role === UserRole.LANDLORD) {
      // Landlord can only see bills for their buildings
      where.room = {
        building: {
          landlordId: currentUser.id,
        },
      };
    } else if (currentUser.role === UserRole.TENANT) {
      // Tenant can only see bills for rooms they are renting
      where.room = {
        rentals: {
          some: {
            tenantId: currentUser.id,
            status: 'ACTIVE',
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        skip,
        take: limit,
        include: {
          room: {
            include: {
              building: true,
            },
          },
          payment: {
            include: {
              confirmation: true,
            },
          },
        },
        orderBy: {
          billingPeriod: 'desc',
        },
      }),
      this.prisma.bill.count({ where }),
    ]);

    return {
      data,
      pagination: buildPaginationMeta({ page, limit, total }),
    };
  }

  async findOne(currentUser: User, id: string): Promise<Bill> {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            building: true,
            rentals: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
        payment: {
          include: {
            confirmation: true,
          },
        },
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    // Check permissions
    if (currentUser.role === UserRole.TENANT) {
      const hasAccess = bill.room.rentals.some(
        (rental) => rental.tenantId === currentUser.id,
      );
      if (!hasAccess) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role === UserRole.LANDLORD) {
      if (bill.room.building.landlordId !== currentUser.id) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    return bill;
  }

  async update(
    currentUser: User,
    id: string,
    updateBillDto: UpdateBillDto,
  ): Promise<Bill> {
    // Verify access
    await this.findOne(currentUser, id);

    // Only Landlord and Admin can update bills
    if (currentUser.role === UserRole.TENANT) {
      throw new ForbiddenException('You cannot update bills');
    }

    return this.prisma.bill.update({
      where: { id },
      data: {
        ...updateBillDto,
        dueDate: updateBillDto.dueDate
          ? new Date(updateBillDto.dueDate)
          : undefined,
      },
    });
  }

  async confirmPayment(
    currentUser: User,
    id: string,
    confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<Bill> {
    const bill = await this.findOne(currentUser, id);

    // A payment must exist before it can be confirmed
    const payment = await this.prisma.payment.findUnique({
      where: { billId: id },
      include: { confirmation: true },
    });

    if (!payment) {
      throw new BadRequestException('No payment found for this bill');
    }

    // Get or create payment confirmation for this payment
    let confirmation = payment.confirmation;

    if (!confirmation) {
      // Get tenant from active rental
      const rental = await this.prisma.rental.findFirst({
        where: {
          roomId: bill.roomId,
          status: 'ACTIVE',
        },
      });

      if (!rental) {
        throw new BadRequestException('No active rental found for this room');
      }

      confirmation = await this.prisma.paymentConfirmation.create({
        data: {
          paymentId: payment.id,
          tenantId: rental.tenantId,
        },
      });
    }

    // Update confirmation based on user role
    const updateData: {
      tenantConfirmed?: boolean;
      tenantConfirmedAt?: Date;
      landlordConfirmed?: boolean;
      landlordConfirmedAt?: Date;
      proofImages?: string[];
      notes?: string;
    } = {};

    if (currentUser.role === UserRole.TENANT) {
      if (confirmation.tenantId !== currentUser.id) {
        throw new ForbiddenException(
          'You can only confirm payments for your own bills',
        );
      }
      updateData.tenantConfirmed = confirmPaymentDto.tenantConfirmed ?? true;
      updateData.tenantConfirmedAt = new Date();
    } else if (
      currentUser.role === UserRole.LANDLORD ||
      currentUser.role === UserRole.ADMIN
    ) {
      updateData.landlordConfirmed =
        confirmPaymentDto.landlordConfirmed ?? true;
      updateData.landlordConfirmedAt = new Date();
    }

    if (confirmPaymentDto.proofImages) {
      updateData.proofImages = confirmPaymentDto.proofImages;
    }

    if (confirmPaymentDto.notes) {
      updateData.notes = confirmPaymentDto.notes;
    }

    const updatedConfirmation = await this.prisma.paymentConfirmation.update({
      where: { paymentId: payment.id },
      data: updateData,
    });

    let billStatus: BillStatus = BillStatus.PENDING;
    if (
      updatedConfirmation.tenantConfirmed &&
      updatedConfirmation.landlordConfirmed
    ) {
      billStatus = BillStatus.LANDLORD_CONFIRMED;
    } else if (updatedConfirmation.tenantConfirmed) {
      billStatus = BillStatus.TENANT_CONFIRMED;
    }

    return this.prisma.bill.update({
      where: { id },
      data: { status: billStatus },
      include: {
        payment: {
          include: {
            confirmation: true,
          },
        },
      },
    });
  }

  async remove(currentUser: User, id: string): Promise<void> {
    await this.findOne(currentUser, id);

    // Only Landlord and Admin can delete bills
    if (currentUser.role === UserRole.TENANT) {
      throw new ForbiddenException('You cannot delete bills');
    }

    await this.prisma.bill.delete({
      where: { id },
    });
  }

  /**
   * Computes what a monthly bill run would produce, without writing anything.
   * This is the single source of truth used by both the preview and the
   * actual generation, so the numbers the user reviews are exactly the numbers
   * that get persisted.
   */
  private async buildGenerationPlan(
    currentUser: User,
    dto: GenerateBillsDto,
  ): Promise<GenerationPlan> {
    if (currentUser.role === UserRole.TENANT) {
      throw new ForbiddenException('Tenants cannot generate bills');
    }

    const building = await this.prisma.building.findUnique({
      where: { id: dto.buildingId },
      include: {
        rooms: {
          include: {
            rentals: {
              where: { status: 'ACTIVE' },
              take: 1,
              include: { tenant: { include: { profile: true } } },
            },
          },
          orderBy: { number: 'asc' },
        },
      },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    if (
      currentUser.role === UserRole.LANDLORD &&
      building.landlordId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You can only generate bills for your own buildings',
      );
    }

    const billingPeriodDate = startOfMonth(dto.billingPeriod);
    const dueDate = dto.dueDate
      ? new Date(dto.dueDate)
      : defaultDueDate(building.billingDate, billingPeriodDate);

    const roomIds = building.rooms.map((room) => room.id);

    // Batch lookups so the run stays O(1) queries regardless of room count.
    const [utilityRecords, debtGroups, existingBills] = await Promise.all([
      this.prisma.utilityRecord.findMany({
        where: {
          roomId: { in: roomIds },
          recordDate: { lt: billingPeriodDate },
        },
        orderBy: { recordDate: 'desc' },
      }),
      this.prisma.bill.groupBy({
        by: ['roomId'],
        where: {
          roomId: { in: roomIds },
          status: { not: BillStatus.PAID },
          billingPeriod: { lt: billingPeriodDate },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.bill.findMany({
        where: {
          roomId: { in: roomIds },
          billingPeriod: billingPeriodDate,
        },
        select: { id: true, roomId: true },
      }),
    ]);

    // Records are ordered newest-first, so the first hit per room+type wins.
    const latestReading = new Map<string, Prisma.Decimal>();
    for (const record of utilityRecords) {
      const key = `${record.roomId}|${record.utilityType}`;
      if (!latestReading.has(key)) {
        latestReading.set(key, record.currentReading);
      }
    }

    const debtByRoom = new Map<string, Prisma.Decimal>(
      debtGroups.map((group): [string, Prisma.Decimal] => [
        group.roomId,
        group._sum.totalAmount ?? new Prisma.Decimal(0),
      ]),
    );

    const existingBillByRoom = new Map<string, string>(
      existingBills.map((bill): [string, string] => [bill.roomId, bill.id]),
    );

    const readingsByRoomType = new Map<string, BillGenerationReadingDto>(
      (dto.readings ?? []).map(
        (reading): [string, BillGenerationReadingDto] => [
          `${reading.roomId}|${reading.utilityType}`,
          reading,
        ],
      ),
    );

    const rates = {
      electricityRate: building.electricityRate,
      waterRate: building.waterRate,
      gasRate: building.gasRate,
      managementFee: building.managementFee,
      cleaningFeePerPerson: building.cleaningFeePerPerson,
      lightingFee: building.lightingFee,
    };

    const rows: GenerationPlanRow[] = building.rooms.map((room) => {
      const rental = room.rentals[0] ?? null;
      const existingBillId = existingBillByRoom.get(room.id) ?? null;
      const warnings: string[] = [];

      const tenantName = rental?.tenant
        ? [rental.tenant.profile?.lastName, rental.tenant.profile?.firstName]
            .filter(Boolean)
            .join(' ')
            .trim() || rental.tenant.email
        : null;

      const base = {
        roomId: room.id,
        roomNumber: room.number,
        tenantId: rental?.tenantId ?? null,
        tenantName,
        roomType: room.roomType,
        existingBillId,
      };

      // A room without an active rental cannot be billed.
      if (!rental) {
        return {
          ...base,
          status: 'SKIPPED' as const,
          warnings: ['Phòng chưa có hợp đồng đang thuê'],
          calculation: this.emptyCalculation(),
          meters: [],
          readings: [],
        };
      }

      if (existingBillId) {
        warnings.push(
          dto.overwrite
            ? 'Đã có hóa đơn kỳ này — sẽ ghi đè'
            : 'Đã có hóa đơn kỳ này — sẽ bỏ qua',
        );
      }

      const plannedReadings: PlannedReading[] = [];
      const meters: PlannedMeter[] = [];
      const readings = {
        electricity: undefined as
          | { previousReading: Prisma.Decimal; currentReading: Prisma.Decimal }
          | undefined,
        water: undefined as
          | { previousReading: Prisma.Decimal; currentReading: Prisma.Decimal }
          | undefined,
        gas: undefined as
          | { previousReading: Prisma.Decimal; currentReading: Prisma.Decimal }
          | undefined,
      };

      if (room.roomType === RoomType.PARTIAL_RIGHTS) {
        for (const utilityType of METERED_UTILITY_TYPES) {
          const key = `${room.id}|${utilityType}`;
          const supplied = readingsByRoomType.get(key);
          const previous =
            supplied?.previousReading !== undefined
              ? new Prisma.Decimal(supplied.previousReading)
              : (latestReading.get(key) ?? new Prisma.Decimal(0));

          if (!supplied) {
            warnings.push(
              `Thiếu chỉ số ${UTILITY_LABELS[utilityType]} — tính 0`,
            );
            meters.push({
              utilityType,
              previousReading: previous,
              currentReading: null,
            });
            continue;
          }

          const current = new Prisma.Decimal(supplied.currentReading);
          const unitRate = new Prisma.Decimal(
            utilityType === UtilityType.ELECTRICITY
              ? rates.electricityRate
              : utilityType === UtilityType.WATER
                ? rates.waterRate
                : rates.gasRate,
          );

          const reading = {
            previousReading: previous,
            currentReading: current,
          };

          if (utilityType === UtilityType.ELECTRICITY)
            readings.electricity = reading;
          if (utilityType === UtilityType.WATER) readings.water = reading;
          if (utilityType === UtilityType.GAS) readings.gas = reading;

          plannedReadings.push({
            utilityType,
            previousReading: previous,
            currentReading: current,
            unitRate,
          });
          meters.push({
            utilityType,
            previousReading: previous,
            currentReading: current,
          });
        }
      }

      let calculation: BillCalculationResult;
      try {
        calculation = calculateBillForRoom({
          roomType: room.roomType,
          monthlyRent: rental.monthlyRent,
          numberOfTenants: rental.numberOfTenants,
          rates,
          readings,
          previousDebt: debtByRoom.get(room.id) ?? new Prisma.Decimal(0),
        });
      } catch (error) {
        // An invalid reading pair cannot be billed; surface it instead of
        // writing a wrong amount.
        if (error instanceof BillCalculationError) {
          return {
            ...base,
            status: 'SKIPPED' as const,
            warnings: [...warnings, error.message],
            calculation: this.emptyCalculation(),
            meters,
            readings: [],
          };
        }
        throw error;
      }

      const status: BillGenerationRowStatus =
        existingBillId && !dto.overwrite
          ? 'SKIPPED'
          : warnings.length > 0
            ? 'WARNING'
            : 'READY';

      return {
        ...base,
        status,
        warnings,
        calculation,
        meters,
        readings: plannedReadings,
      };
    });

    return {
      buildingId: building.id,
      buildingName: building.name,
      billingPeriodDate,
      dueDate,
      rows,
    };
  }

  private emptyCalculation(): BillCalculationResult {
    const zero = new Prisma.Decimal(0);
    return {
      monthlyRent: zero,
      electricityUsage: zero,
      electricityAmount: zero,
      waterUsage: zero,
      waterAmount: zero,
      gasUsage: zero,
      gasAmount: zero,
      managementFee: zero,
      cleaningFee: zero,
      lightingFee: zero,
      previousDebt: zero,
      totalAmount: zero,
    };
  }

  private toRowDto(row: GenerationPlanRow): BillGenerationRowDto {
    const { calculation } = row;
    return {
      roomId: row.roomId,
      roomNumber: row.roomNumber,
      tenantId: row.tenantId,
      tenantName: row.tenantName,
      roomType: row.roomType,
      status: row.status,
      warnings: row.warnings,
      existingBillId: row.existingBillId,
      meters: row.meters.map((meter) => ({
        utilityType: meter.utilityType,
        previousReading: meter.previousReading.toFixed(3),
        currentReading:
          meter.currentReading === null
            ? null
            : meter.currentReading.toFixed(3),
      })),
      monthlyRent: toAmount(calculation.monthlyRent),
      electricityUsage: calculation.electricityUsage.toFixed(3),
      electricityAmount: toAmount(calculation.electricityAmount),
      waterUsage: calculation.waterUsage.toFixed(3),
      waterAmount: toAmount(calculation.waterAmount),
      gasUsage: calculation.gasUsage.toFixed(3),
      gasAmount: toAmount(calculation.gasAmount),
      managementFee: toAmount(calculation.managementFee),
      cleaningFee: toAmount(calculation.cleaningFee),
      lightingFee: toAmount(calculation.lightingFee),
      previousDebt: toAmount(calculation.previousDebt),
      totalAmount: toAmount(calculation.totalAmount),
    };
  }

  async previewGeneration(
    currentUser: User,
    dto: GenerateBillsDto,
  ): Promise<BillGenerationPreviewDto> {
    const plan = await this.buildGenerationPlan(currentUser, dto);
    const rows = plan.rows.map((row) => this.toRowDto(row));

    const billable = plan.rows.filter((row) => row.status !== 'SKIPPED');

    return {
      buildingId: plan.buildingId,
      buildingName: plan.buildingName,
      billingPeriod: dto.billingPeriod,
      dueDate: plan.dueDate.toISOString(),
      rows,
      summary: {
        totalRooms: plan.rows.length,
        ready: plan.rows.filter((row) => row.status === 'READY').length,
        warnings: plan.rows.filter((row) => row.status === 'WARNING').length,
        skipped: plan.rows.filter((row) => row.status === 'SKIPPED').length,
        totalAmount: billable
          .reduce(
            (total, row) => total.plus(row.calculation.totalAmount),
            new Prisma.Decimal(0),
          )
          .toFixed(2),
      },
    };
  }

  async generateBills(
    currentUser: User,
    dto: GenerateBillsDto,
  ): Promise<BillGenerationResultDto> {
    const plan = await this.buildGenerationPlan(currentUser, dto);

    const billable = plan.rows.filter((row) => row.status !== 'SKIPPED');
    const failed: { roomId: string; roomNumber: string; reason: string }[] = [];

    const createdBills = await this.prisma.$transaction(async (tx) => {
      const bills: { billId: string; tenantId: string | null }[] = [];

      for (const row of billable) {
        const data = {
          roomId: row.roomId,
          billingPeriod: plan.billingPeriodDate,
          dueDate: plan.dueDate,
          ...row.calculation,
          status: BillStatus.PENDING,
        };

        try {
          // Persist the readings first so the next period can derive its
          // opening reading from them.
          for (const reading of row.readings) {
            const consumption = reading.currentReading.minus(
              reading.previousReading,
            );
            await tx.utilityRecord.upsert({
              where: {
                roomId_utilityType_recordDate: {
                  roomId: row.roomId,
                  utilityType: reading.utilityType,
                  recordDate: plan.billingPeriodDate,
                },
              },
              create: {
                roomId: row.roomId,
                utilityType: reading.utilityType,
                recordDate: plan.billingPeriodDate,
                previousReading: reading.previousReading,
                currentReading: reading.currentReading,
                consumption,
                unitRate: reading.unitRate,
              },
              update: {
                previousReading: reading.previousReading,
                currentReading: reading.currentReading,
                consumption,
                unitRate: reading.unitRate,
              },
            });
          }

          const bill =
            row.existingBillId && dto.overwrite
              ? await tx.bill.update({
                  where: { id: row.existingBillId },
                  data,
                })
              : await tx.bill.create({ data });

          bills.push({ billId: bill.id, tenantId: row.tenantId });
        } catch (error) {
          failed.push({
            roomId: row.roomId,
            roomNumber: row.roomNumber,
            reason:
              error instanceof Error ? error.message : 'Unknown write error',
          });
        }
      }

      return bills;
    });

    // Notifications are best-effort: a failure here must not undo the bills.
    await this.notifyGeneratedBills(
      currentUser,
      createdBills,
      dto.billingPeriod,
    );

    const totalAmount = billable
      .filter((row) => !failed.some((failure) => failure.roomId === row.roomId))
      .reduce(
        (total, row) => total.plus(row.calculation.totalAmount),
        new Prisma.Decimal(0),
      )
      .toFixed(2);

    return {
      created: createdBills.length,
      skipped: plan.rows.filter((row) => row.status === 'SKIPPED').length,
      failed,
      totalAmount,
    };
  }

  private async notifyGeneratedBills(
    currentUser: User,
    bills: { billId: string; tenantId: string | null }[],
    billingPeriod: string,
  ) {
    const [year, month] = billingPeriod.split('-');
    const periodLabel = `tháng ${Number(month)}/${year}`;

    for (const bill of bills) {
      if (!bill.tenantId) continue;

      try {
        await this.notificationsService.create(currentUser, {
          userId: bill.tenantId,
          title: 'Hóa đơn mới',
          message: `Bạn có hóa đơn ${periodLabel} cần thanh toán.`,
          type: NotificationType.BILL_GENERATED,
          relatedId: bill.billId,
          relatedType: RelatedEntityType.BILL,
        });
      } catch {
        // Ignore: the bill already exists and the tenant can still see it.
      }
    }
  }
}
