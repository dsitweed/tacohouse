import { ApiProperty } from '@nestjs/swagger';

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
    type: 'string',
  })
  userId: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  joinedAt: Date;
}
