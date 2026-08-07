import { ApiProperty } from '@nestjs/swagger';

import { MessageType } from '../prisma/client';
import { ChatGroup } from './chatGroup.entity';
import { User } from './user.entity';

export class Message {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  senderId: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  senderUser?: User;
  @ApiProperty({
    type: 'string',
  })
  content: string;
  @ApiProperty({
    enum: MessageType,
    enumName: 'MessageType',
  })
  messageType: MessageType;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  attachmentUrl: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  attachmentName: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  attachmentSize: number | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  chatGroupId: string | null;
  @ApiProperty({
    type: () => ChatGroup,
    required: false,
    nullable: true,
  })
  chatGroup?: ChatGroup | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  recipientId: string | null;
  @ApiProperty({
    type: () => User,
    required: false,
    nullable: true,
  })
  recipientUser?: User | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  readAt: Date | null;
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
