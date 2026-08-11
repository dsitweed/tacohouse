import { Injectable } from '@nestjs/common';
import { BillStatus } from 'generated/prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import {
  CreateDashboardDto,
  RevenueTrendQueryDto,
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

  create(createDashboardDto: CreateDashboardDto) {
    return 'This action adds a new dashboard';
  }

  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return `This action updates a #${id} dashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }
}
