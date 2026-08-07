import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '../prisma/client';
import { Account } from './account.entity';
import { Building } from './building.entity';
import { ChatGroupMember } from './chatGroupMember.entity';
import { MaintenanceRequest } from './maintenanceRequest.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';
import { PaymentConfirmation } from './paymentConfirmation.entity';
import { Rental } from './rental.entity';
import { Session } from './session.entity';
import { UserProfile } from './userProfile.entity';

export class User {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  email: string;
  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
  })
  role: UserRole;
  @ApiProperty({
    type: 'boolean',
  })
  isActive: boolean;
  @ApiProperty({
    type: () => UserProfile,
    required: false,
    nullable: true,
  })
  profile?: UserProfile | null;
  @ApiProperty({
    type: () => Session,
    isArray: true,
    required: false,
  })
  sessions?: Session[];
  @ApiProperty({
    type: () => Account,
    isArray: true,
    required: false,
  })
  accounts?: Account[];
  @ApiProperty({
    type: () => Building,
    isArray: true,
    required: false,
  })
  buildings?: Building[];
  @ApiProperty({
    type: () => Rental,
    isArray: true,
    required: false,
  })
  rentals?: Rental[];
  @ApiProperty({
    type: () => MaintenanceRequest,
    isArray: true,
    required: false,
  })
  maintenanceRequests?: MaintenanceRequest[];
  @ApiProperty({
    type: () => PaymentConfirmation,
    isArray: true,
    required: false,
  })
  paymentConfirmations?: PaymentConfirmation[];
  @ApiProperty({
    type: () => Message,
    isArray: true,
    required: false,
  })
  sentMessages?: Message[];
  @ApiProperty({
    type: () => Message,
    isArray: true,
    required: false,
  })
  receivedMessages?: Message[];
  @ApiProperty({
    type: () => Notification,
    isArray: true,
    required: false,
  })
  notifications?: Notification[];
  @ApiProperty({
    type: () => ChatGroupMember,
    isArray: true,
    required: false,
  })
  chatGroupMember?: ChatGroupMember[];
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
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
