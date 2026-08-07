import { ApiProperty } from '@nestjs/swagger';

import { User } from './user.entity';

export class UserProfile {
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
  firstName: string;
  @ApiProperty({
    type: 'string',
  })
  lastName: string;
  @ApiProperty({
    type: 'string',
  })
  phone: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  avatar: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  dateOfBirth: Date;
  @ApiProperty({
    type: 'string',
  })
  occupation: string;
  @ApiProperty({
    type: 'string',
  })
  workplace: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  idCardFrontPhoto: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  idCardBackPhoto: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  portraitPhoto: string | null;
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
