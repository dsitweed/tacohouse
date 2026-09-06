import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Bill,
  BillStatus,
  Payment,
  PaymentConfirmation,
  Rental,
  User,
  UserProfile,
  UserRole,
} from 'generated/prisma/client';
import { BillWhereInput } from 'generated/prisma/models';
import { PrismaService } from 'prisma/prisma.service';

import {
  CreateDashboardDto,
  DocumentsDto,
  GetTenantDashboardQueryDto,
  RevenueTrendQueryDto,
  TenantDashboardResponseDto,
  UpdateDashboardDto,
} from './dashboard.dto';

// TODO: replace RevenueTrendResponse to suitable file
type RevenueTrendResponse = {
  month: string;
  total: number;
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async revenueTrend(
    userId: string,
    query: RevenueTrendQueryDto,
  ): Promise<RevenueTrendResponse[]> {
    const { months } = query;
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1 - months,
      1,
    );

    const bills = await this.prisma.bill.findMany({
      take: months,
      where: {
        room: {
          building: {
            landlordId: userId,
          },
        },
        billingPeriod: {
          gte: startDate,
        },
        status: BillStatus.PAID,
      },
      select: {
        billingPeriod: true,
        totalAmount: true,
      },
      orderBy: {
        billingPeriod: 'asc',
      },
    });

    return Array.from({ length: months }).map((_, index) => {
      const currentDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1 - (months - index),
        1,
      );
      const total = bills
        .filter((bill) => {
          const billDate = new Date(bill.billingPeriod);

          return (
            billDate.getFullYear() === currentDate.getFullYear() &&
            billDate.getMonth() === currentDate.getMonth()
          );
        })
        .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
      return {
        month: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
        total,
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createDashboardDto: CreateDashboardDto) {
    return 'This action adds a new dashboard';
  }

  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return `This action updates a #${id} dashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }

  async getTenantDetails(
    currentUser: User,
    tenantId: string,
    query: GetTenantDashboardQueryDto,
  ): Promise<TenantDashboardResponseDto> {
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.LANDLORD
    ) {
      throw new ForbiddenException(
        'Only admins or landlords can access this route',
      );
    }

    if (currentUser.role === UserRole.LANDLORD) {
      const landlordBuilding = await this.prisma.rental.findFirst({
        where: {
          tenantId,
          room: {
            building: {
              landlordId: currentUser.id,
            },
          },
        },
      });

      if (!landlordBuilding) {
        throw new ForbiddenException(
          "You do not have access to this tenant's details",
        );
      }
    }

    const tenant = await this.prisma.user.findUnique({
      where: { id: tenantId, role: UserRole.TENANT },
      include: { profile: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const rentals = await this.prisma.rental.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
    });

    // TODO: What if return more than one current rental? Should we handle multiple active rentals?
    const currentRental = await this.prisma.rental.findFirst({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
      include: {
        room: {
          include: { building: true },
        },
      },
    });

    // Fetch bills for current rental (or last rental if no active)
    const billsQuery: BillWhereInput | null = currentRental
      ? {
          roomId: currentRental.roomId,
        }
      : rentals.length > 0
        ? {
            roomId: rentals[0].roomId,
          }
        : null;

    const bills = billsQuery
      ? await this.prisma.bill.findMany({
          where: billsQuery,
          take: query.billsLimit,
          skip: (query.billsPage - 1) * query.billsLimit,
          orderBy: { billingPeriod: 'desc' },
        })
      : [];

    // Fetch payments for the bills (not directly for tenant)
    // Get all bill IDs from the bills
    const billIds = bills.map((bill) => bill.id);

    const payments =
      billIds.length > 0
        ? await this.prisma.payment.findMany({
            where: { billId: { in: billIds } },
            include: { confirmation: true },
            take: query.paymentsLimit,
            skip: (query.paymentsPage - 1) * query.paymentsLimit,
            orderBy: { paymentDate: 'desc' },
          })
        : [];

    const maintenanceRequests = await this.prisma.maintenanceRequest.findMany({
      where: {
        tenantId,
      },
      take: query.maintenanceLimit,
      skip: (query.maintenancePage - 1) * query.maintenanceLimit,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate payment metrics
    const paymentMetrics = this.calculatePaymentMetrics(
      bills,
      payments as (Payment & { paymentConfirmation?: PaymentConfirmation })[],
    );

    // Collect documents
    const documents = this.collectDocuments(
      tenant as User & { profile: UserProfile },
      rentals,
    );

    return {
      tenant,
      currentRental: currentRental || undefined,
      rentalHistory: rentals,
      bills,
      payments,
      maintenanceRequests,
      paymentMetrics,
      documents,
    };
  }

  private calculatePaymentMetrics(
    bills: Bill[],
    payments: (Payment & { confirmation?: PaymentConfirmation })[],
  ) {
    // Calculate total paid (payments with COMPLETED status)
    const totalPaid =
      payments
        .filter((payment) => payment.status === 'COMPLETED')
        .reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

    // Calculate total outstanding (bills that are not paid)
    const totalOutstanding =
      bills
        .filter((bill) => bill.status !== 'PAID')
        .reduce((sum, bill) => sum + Number(bill.totalAmount), 0) || 0;

    // Count consecutive on-time payments
    // A payment is on-time if it was confirmed by both tenant and landlord
    const sortedPayments = payments.sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    );
    let consecutiveOnTime = 0;

    for (const payment of sortedPayments) {
      if (
        payment.status === 'COMPLETED' &&
        payment.confirmation?.tenantConfirmed &&
        payment.confirmation.landlordConfirmed
      ) {
        consecutiveOnTime++;
      } else {
        break;
      }
    }

    // Count failed/refunded payments (considered late)
    const latePaymentCount = payments.filter(
      (payment) => payment.status === 'FAILED' || payment.status === 'REFUNDED',
    ).length;

    // Get last payment date
    const lastPaymentDate =
      sortedPayments.find((p) => p.status === 'COMPLETED')?.paymentDate ||
      undefined;

    // Determine payment trend
    let paymentTrend: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'FAIR';
    if (consecutiveOnTime >= 12) {
      paymentTrend = 'EXCELLENT';
    } else if (consecutiveOnTime >= 6) {
      paymentTrend = 'GOOD';
    } else if (latePaymentCount > 2) {
      paymentTrend = 'POOR';
    }

    // Calculate score (0-100)
    let paymentScore = 80; // base score
    paymentScore += Math.min(consecutiveOnTime * 2, 20); // up to 2- point
    paymentScore -= latePaymentCount * 5; // -5 per late payment
    paymentScore += Math.max(0, Math.min(100, paymentScore));

    return {
      paymentScore: Math.round(paymentScore),
      totalPaid,
      totalOutstanding,
      consecutiveOnTimePayments: consecutiveOnTime,
      latePaymentCount,
      lastPaymentDate,
      paymentTrend,
    };
  }

  private collectDocuments(
    tenant: User & { profile: UserProfile },
    rentals: Rental[],
  ): DocumentsDto {
    const documents: DocumentsDto = {
      idCardFront: tenant.profile.idCardFrontPhoto || undefined,
      idCardBack: tenant.profile.idCardBackPhoto || undefined,
      portrait: tenant.profile.portraitPhoto || undefined,
      contractImages: [],
    };

    // Collect contract images from all rentals
    for (const rental of rentals) {
      if (rental.contractImages && Array.isArray(rental.contractImages)) {
        documents.contractImages.push(...rental.contractImages);
      }
    }

    // Remove duplicates
    documents.contractImages = [...new Set(documents.contractImages)];

    return documents;
  }
}
