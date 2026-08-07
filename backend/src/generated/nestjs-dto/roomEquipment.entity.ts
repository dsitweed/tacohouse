import { ApiProperty } from '@nestjs/swagger';

import { EquipmentCondition } from '../prisma/client';

export class RoomEquipment {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  roomId: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  brand: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  model: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  installedDate: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  warrantyExpiryDate: Date | null;
  @ApiProperty({
    enum: EquipmentCondition,
    enumName: 'EquipmentCondition',
  })
  condition: EquipmentCondition;
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
