import { ApiProperty } from '@nestjs/swagger';

import { User } from './user.entity';

export class Account {
  @ApiProperty({
    type: 'string',
  })
  id: string;
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
  })
  providerId: string;
  @ApiProperty({
    type: 'string',
  })
  accountId: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  password: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  accessToken: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  refreshToken: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  idToken: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  accessTokenExpiresAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  refreshTokenExpiresAt: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  scope: string | null;
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
