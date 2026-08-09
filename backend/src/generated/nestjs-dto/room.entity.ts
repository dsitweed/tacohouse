import { ApiProperty } from '@nestjs/swagger';

import { Prisma, RoomStatus, RoomType } from '../prisma/client';
import { Bill } from './bill.entity';
import { Building } from './building.entity';
import { MaintenanceRequest } from './maintenanceRequest.entity';
import { Rental } from './rental.entity';
import { RoomEquipment } from './roomEquipment.entity';
import { UtilityRecord } from './utilityRecord.entity';

export class Room {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  buildingId: string;
  @ApiProperty({
    type: () => Building,
    required: false,
  })
  building?: Building;
  @ApiProperty({
    type: 'string',
  })
  number: string;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  area: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  monthlyRent: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  deposit: Prisma.Decimal;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  maxTenants: number;
  @ApiProperty({
    enum: RoomType,
    enumName: 'RoomType',
  })
  roomType: RoomType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: 'string',
    isArray: true,
  })
  images: string[];
  @ApiProperty({
    enum: RoomStatus,
    enumName: 'RoomStatus',
  })
  status: RoomStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  availableFrom: Date | null;
  @ApiProperty({
    type: () => Rental,
    isArray: true,
    required: false,
  })
  rentals?: Rental[];
  @ApiProperty({
    type: () => RoomEquipment,
    isArray: true,
    required: false,
  })
  equipment?: RoomEquipment[];
  @ApiProperty({
    type: () => UtilityRecord,
    isArray: true,
    required: false,
  })
  utilityRecords?: UtilityRecord[];
  @ApiProperty({
    type: () => Bill,
    isArray: true,
    required: false,
  })
  bills?: Bill[];
  @ApiProperty({
    type: () => MaintenanceRequest,
    isArray: true,
    required: false,
  })
  maintenanceRequests?: MaintenanceRequest[];
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
