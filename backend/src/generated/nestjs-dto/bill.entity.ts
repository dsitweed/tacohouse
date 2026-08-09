import { ApiProperty } from '@nestjs/swagger';

import { BillStatus, Prisma } from '../prisma/client';
import { Payment } from './payment.entity';
import { Room } from './room.entity';

export class Bill {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  roomId: string;
  @ApiProperty({
    type: () => Room,
    required: false,
  })
  room?: Room;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  billingPeriod: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  dueDate: Date;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  monthlyRent: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  electricityUsage: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  electricityAmount: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  waterUsage: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  waterAmount: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  gasUsage: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  gasAmount: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  managementFee: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  cleaningFee: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  lightingFee: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  previousDebt: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  totalAmount: Prisma.Decimal;
  @ApiProperty({
    enum: BillStatus,
    enumName: 'BillStatus',
  })
  status: BillStatus;
  @ApiProperty({
    type: () => Payment,
    required: false,
    nullable: true,
  })
  payment?: Payment | null;
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
