import { ApiProperty } from '@nestjs/swagger';

export class Verification {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  identifier: string;
  @ApiProperty({
    type: 'string',
  })
  value: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  expiresAt: Date;
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
