import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import {
  Bill,
  Building,
  MaintenanceRequest,
  Payment,
  PaymentConfirmation,
  Rental,
  Room,
  User,
  UserProfile,
} from 'generated/prisma/client';

export class CreateDashboardDto {}

export class UpdateDashboardDto {}

export class RevenueTrendQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  months = 6;
}

export class GetTenantDashboardQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  billsLimit = 12;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  billsPage = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  paymentsLimit = 10;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  paymentsPage = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maintenanceLimit = 10;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maintenancePage = 1;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  billStatus?: string;

  @IsOptional()
  paymentStatus?: string;

  @IsOptional()
  maintenanceStatus?: string;
}

export class PaymentMetricsDto {
  paymentScore: number; // 0-100
  totalPaid: number;
  totalOutstanding: number;
  consecutiveOnTimePayments: number;
  latePaymentCount: number;
  lastPaymentDate?: Date;
  paymentTrend: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

export class DocumentsDto {
  idCardFront?: string;
  idCardBack?: string;
  portrait?: string;
  contractImages: string[];
}

export class TenantDashboardResponseDto {
  tenant: User & { profile: UserProfile | null };

  // Current Rental Information
  currentRental?: Rental & {
    room: Room & {
      building: Building;
    };
  };

  rentalHistory: Rental[];

  // Bills for Current Rental
  bills: Bill[];

  // Payment History with Confirmations
  payments: (Payment & {
    paymentConfirmation?: PaymentConfirmation;
  })[];

  // Maintenance Requests by Tenant
  maintenanceRequests: MaintenanceRequest[];
  paymentMetrics: PaymentMetricsDto;
  documents: DocumentsDto;
}
