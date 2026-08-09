import { ApiProperty } from '@nestjs/swagger';

import { Prisma, RentalStatus, UserRole } from '../prisma/client';
import { Room } from './room.entity';
import { User } from './user.entity';

export class Rental {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
    type: () => User,
    required: false,
  })
  tenant?: User;
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
  startDate: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  endDate: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  noticeDate: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  monthlyRent: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  depositPaid: Prisma.Decimal;
  @ApiProperty({
    enum: RentalStatus,
    enumName: 'RentalStatus',
  })
  status: RentalStatus;
  @ApiProperty({
    type: 'string',
    isArray: true,
  })
  contractImages: string[];
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
