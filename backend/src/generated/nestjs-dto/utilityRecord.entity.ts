import { ApiProperty } from '@nestjs/swagger';

import { Prisma, UtilityType } from '../prisma/client';
import { Room } from './room.entity';

export class UtilityRecord {
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
  recordDate: Date;
  @ApiProperty({
    enum: UtilityType,
    enumName: 'UtilityType',
  })
  utilityType: UtilityType;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  previousReading: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  currentReading: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  consumption: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  unitRate: Prisma.Decimal;
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
