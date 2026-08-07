import { ApiProperty } from '@nestjs/swagger';

import {
  MaintenanceCategory,
  MaintenanceStatus,
  PriorityType,
  UserRole,
} from '../prisma/client';

export class MaintenanceRequest {
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
    type: 'string',
  })
  roomId: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    enum: PriorityType,
    enumName: 'PriorityType',
  })
  priority: PriorityType;
  @ApiProperty({
    enum: MaintenanceCategory,
    enumName: 'MaintenanceCategory',
  })
  category: MaintenanceCategory;
  @ApiProperty({
    type: 'string',
    isArray: true,
  })
  images: string[];
  @ApiProperty({
    enum: MaintenanceStatus,
    enumName: 'MaintenanceStatus',
  })
  status: MaintenanceStatus;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  completedAt: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  completionNote: string | null;
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
