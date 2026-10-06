import { BadgeVariantType } from '@/components/ui';
import { Room } from '@/generated/model';

import type { BillStatus, PaymentMethod, PaymentStatus } from './EnumsTypes';

export const BILL_STATUS_MAP: Record<
  BillStatus,
  {
    label: string;
    badgeVariant: BadgeVariantType;
  }
> = {
  PENDING: {
    label: 'Chờ thanh toán',
    badgeVariant: 'pending',
  },
  PAID: {
    label: 'Đã thanh toán',
    badgeVariant: 'success',
  },
  TENANT_CONFIRMED: {
    label: 'Người thuê đã xác nhận',
    badgeVariant: 'secondary',
  },
  LANDLORD_CONFIRMED: {
    label: 'Đã xác nhận',
    badgeVariant: 'success',
  },
  OVERDUE: {
    label: 'Quá hạn',
    badgeVariant: 'destructive',
  },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  STRIPE: 'Stripe',
};

export interface PaymentConfirmation {
  id: string;
  billId: string;
  tenantId: string;
  tenantConfirmed: boolean;
  tenantConfirmedAt?: string | null;
  landlordConfirmed: boolean;
  landlordConfirmedAt?: string | null;
  proofImages: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  billId: string;
  bill?: Bill;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  stripePaymentId?: string | null;
  bankTransferRef?: string | null;
  notes?: string | null;
  receiptImage?: string | null;
  status: PaymentStatus;
  transactionId?: string | null; // FE-only convenience field
  createdAt?: string;
  updatedAt?: string;
}

export interface Bill {
  id: string;
  roomId: string;
  room?: Room;
  billingPeriod: string;
  dueDate: string;
  monthlyRent: number;

  electricityUsage: number;
  electricityAmount: number;
  waterUsage: number;
  waterAmount: number;
  gasUsage: number;
  gasAmount: number;
  managementFee: number;
  cleaningFee: number;
  lightingFee: number;
  previousDebt: number;
  totalAmount: number;

  status: BillStatus;
  payment?: Payment | null;
  confirmation?: PaymentConfirmation | null;
  billNumber?: string | null; // FE-only convenience field
  createdAt: string;
  updatedAt: string;
}
