import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Bill, Prisma, User } from 'generated/prisma/client';
import { BillStatus, UserRole } from 'generated/prisma/enums';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationMeta } from 'types';

import {
  ConfirmPaymentDto,
  CreateBillDto,
  FindAllBillsDto,
  UpdateBillDto,
} from './dto';

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const { limit = 10, page = 1, roomId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BillWhereInput = {};

    // Apply filters
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;

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

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
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
}
