import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
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
  @IsNumber()
  @Min(0)
  @Max(100)
  paymentScore: number;

  @IsNumber()
  @Min(0)
  totalPaid: number;

  @IsNumber()
  @Min(0)
  totalOutstanding: number;

  @IsNumber()
  @Min(0)
  consecutiveOnTimePayments: number;

  @IsNumber()
  @Min(0)
  latePaymentCount: number;

  @IsOptional()
  @IsDateString()
  lastPaymentDate?: Date;

  @IsOptional()
  @IsString()
  paymentTrend: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

export class DocumentsDto {
  @IsOptional()
  @IsString()
  idCardFront?: string;
  @IsOptional()
  @IsString()
  idCardBack?: string;

  @IsOptional()
  @IsString()
  portrait?: string;

  @IsArray()
  @IsString({ each: true })
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

  @IsArray()
  rentalHistory: Rental[];

  // Bills for Current Rental
  @IsArray()
  bills: Bill[];

  // Payment History with Confirmations
  payments: (Payment & {
    paymentConfirmation?: PaymentConfirmation;
  })[];

  // Maintenance Requests by Tenant
  @IsArray()
  maintenanceRequests: MaintenanceRequest[];
  paymentMetrics: PaymentMetricsDto;
  documents: DocumentsDto;
}
