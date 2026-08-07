import { ApiProperty } from '@nestjs/swagger';

import { Prisma, UserRole } from '../prisma/client';
import { ChatGroup } from './chatGroup.entity';
import { Room } from './room.entity';
import { User } from './user.entity';

export class Building {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  address: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  billingDate: number | null;
  @ApiProperty({
    type: 'string',
  })
  landlordId: string;
  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
  })
  landlordRole: UserRole;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  landlord?: User;
  @ApiProperty({
    type: () => Room,
    isArray: true,
    required: false,
  })
  rooms?: Room[];
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  electricityRate: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  waterRate: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  gasRate: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  managementFee: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  cleaningFeePerPerson: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  lightingFee: Prisma.Decimal;
  @ApiProperty({
    type: () => ChatGroup,
    required: false,
    nullable: true,
  })
  chatGroup?: ChatGroup | null;
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
