import type { DateTimeString, DecimalLike } from './PrimitivesTypes';
import type {
  BillStatus,
  PaymentMethod,
  PaymentStatus,
} from './EnumsTypes';
import type { Room } from './RoomTypes';

export interface PaymentConfirmation {
  id: string;
  billId: string;
  tenantId: string;
  tenantConfirmed: boolean;
  tenantConfirmedAt?: DateTimeString | null;
  landlordConfirmed: boolean;
  landlordConfirmedAt?: DateTimeString | null;
  proofImages: string[];
  notes?: string | null;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface Payment {
  id: string;
  billId: string;
  bill?: Bill;
  amount: DecimalLike;
  paymentMethod: PaymentMethod;
  paymentDate: DateTimeString;
  stripePaymentId?: string | null;
  bankTransferRef?: string | null;
  notes?: string | null;
  receiptImage?: string | null;
  status: PaymentStatus;
  transactionId?: string | null; // FE-only convenience field
  createdAt?: DateTimeString;
  updatedAt?: DateTimeString;
}

export interface Bill {
  id: string;
  roomId: string;
  room?: Room;
  billingPeriod: DateTimeString;
  dueDate: DateTimeString;
  monthlyRent: DecimalLike;

  electricityUsage: DecimalLike;
  electricityAmount: DecimalLike;
  waterUsage: DecimalLike;
  waterAmount: DecimalLike;
  gasUsage: DecimalLike;
  gasAmount: DecimalLike;
  managementFee: DecimalLike;
  cleaningFee: DecimalLike;
  lightingFee: DecimalLike;
  previousDebt: DecimalLike;
  totalAmount: DecimalLike;

  status: BillStatus;
  payment?: Payment | null;
  confirmation?: PaymentConfirmation | null;
  billNumber?: string | null; // FE-only convenience field
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}
