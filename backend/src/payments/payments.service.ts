import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PaymentStatus, Prisma, UserRole } from '@prisma/client';
import type { Payment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationType, UserWithRelations } from 'src/types';

import { CreatePaymentDto, FindAllPaymentsDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    currentUser: UserWithRelations,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    const { billId, amount } = createPaymentDto;

    // Check if bill exists
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
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
        payment: true,
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    // Check permissions
    if (currentUser.role === UserRole.TENANT) {
      const hasAccess = bill.room.rentals.some(
        (rental) => rental.tenantId === currentUser.tenant?.id,
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'You can only create payments for your own bills',
        );
      }
    } else if (currentUser.role === UserRole.LANDLORD) {
      if (bill.room.building.landlordId !== currentUser.landlord?.id) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    // Check if payment already exists
    if (bill.payment) {
      throw new BadRequestException('Payment already exists for this bill');
    }

    // Validate amount
    if (amount > Number(bill.totalAmount)) {
      throw new BadRequestException(
        'Payment amount cannot exceed bill total amount',
      );
    }

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        status:
          createPaymentDto.paymentMethod === 'STRIPE'
            ? PaymentStatus.COMPLETED
            : PaymentStatus.PENDING,
      },
    });

    // Update bill status if payment is completed
    if (payment.status === PaymentStatus.COMPLETED) {
      await this.prisma.bill.update({
        where: { id: billId },
        data: { status: 'PAID' },
      });
    }

    return payment;
  }

  async findAll(
    currentUser: UserWithRelations,
    query: FindAllPaymentsDto,
  ): Promise<{
    data: Payment[];
    pagination: PaginationType;
  }> {
    const { limit = 10, page = 1, billId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};

    // Apply filters
    if (billId) where.billId = billId;
    if (status) where.status = status;

    // Authorization logic
    if (currentUser.role === UserRole.ADMIN) {
      // Admin can see all payments
    } else if (currentUser.role === UserRole.LANDLORD) {
      // Landlord can only see payments for their buildings
      where.bill = {
        room: {
          building: {
            landlordId: currentUser.landlord?.id,
          },
        },
      };
    } else if (currentUser.role === UserRole.TENANT) {
      // Tenant can only see payments for their bills
      where.bill = {
        room: {
          rentals: {
            some: {
              tenantId: currentUser.tenant?.id,
              status: 'ACTIVE',
            },
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          bill: {
            include: {
              room: {
                include: {
                  building: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page: page,
        limit: limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(currentUser: UserWithRelations, id: string): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        bill: {
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
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check permissions
    if (currentUser.role === UserRole.TENANT) {
      const hasAccess = payment.bill.room.rentals.some(
        (rental) => rental.tenantId === currentUser.tenant?.id,
      );
      if (!hasAccess) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role === UserRole.LANDLORD) {
      if (payment.bill.room.building.landlordId !== currentUser.landlord?.id) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    return payment;
  }
}
