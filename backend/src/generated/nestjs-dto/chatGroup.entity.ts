import { ApiProperty } from '@nestjs/swagger';

import { ChatGroupMember } from './chatGroupMember.entity';
import { Message } from './message.entity';

export class ChatGroup {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  buildingId: string;
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
    type: () => Message,
    isArray: true,
    required: false,
  })
  messages?: Message[];
  @ApiProperty({
    type: () => ChatGroupMember,
    isArray: true,
    required: false,
  })
  members?: ChatGroupMember[];
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
