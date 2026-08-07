import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '../prisma/client';

export class PaymentConfirmation {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  paymentId: string;
  @ApiProperty({
    type: 'string',
  })
  tenantId: string;
  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
  })
  tenantRole: UserRole;
  @ApiProperty({
    type: 'boolean',
  })
  tenantConfirmed: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  tenantConfirmedAt: Date | null;
  @ApiProperty({
    type: 'boolean',
  })
  landlordConfirmed: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  landlordConfirmedAt: Date | null;
  @ApiProperty({
    type: 'string',
    isArray: true,
  })
  proofImages: string[];
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  notes: string | null;
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
