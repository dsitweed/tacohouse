import { ApiProperty } from '@nestjs/swagger';

import { NotificationType, RelatedEntityType } from '../prisma/client';

export class Notification {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  message: string;
  @ApiProperty({
    enum: NotificationType,
    enumName: 'NotificationType',
  })
  type: NotificationType;
  @ApiProperty({
    type: 'boolean',
  })
  isRead: boolean;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  readAt: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  relatedId: string | null;
  @ApiProperty({
    enum: RelatedEntityType,
    enumName: 'RelatedEntityType',
    nullable: true,
  })
  relatedType: RelatedEntityType | null;
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
