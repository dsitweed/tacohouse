import { ApiProperty } from '@nestjs/swagger';

export class Session {
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
  token: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  expiresAt: Date;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  ipAddress: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  userAgent: string | null;
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
