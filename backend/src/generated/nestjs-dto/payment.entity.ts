import { ApiProperty } from '@nestjs/swagger';

import { PaymentMethod, PaymentStatus, Prisma } from '../prisma/client';
import { Bill } from './bill.entity';
import { PaymentConfirmation } from './paymentConfirmation.entity';

export class Payment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  billId: string;
  @ApiProperty({
    type: () => Bill,
    required: false,
  })
  bill?: Bill;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  amount: Prisma.Decimal;
  @ApiProperty({
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
  })
  paymentMethod: PaymentMethod;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  paymentDate: Date;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  stripePaymentId: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  bankTransferRef: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  notes: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  receiptImage: string | null;
  @ApiProperty({
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
  })
  status: PaymentStatus;
  @ApiProperty({
    type: () => PaymentConfirmation,
    required: false,
    nullable: true,
  })
  confirmation?: PaymentConfirmation | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
