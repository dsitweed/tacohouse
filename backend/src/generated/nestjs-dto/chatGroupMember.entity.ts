import { ApiProperty } from '@nestjs/swagger';

import { ChatGroup } from './chatGroup.entity';
import { User } from './user.entity';

export class ChatGroupMember {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  chatGroupId: string;
  @ApiProperty({
    type: () => ChatGroup,
    required: false,
  })
  chatGroup?: ChatGroup;
  @ApiProperty({
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    type: () => User,
    required: false,
  })
  user?: User;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  joinedAt: Date;
}
