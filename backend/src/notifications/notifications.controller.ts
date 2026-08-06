import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from 'common/decorators';
import type { Notification, User } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import { CreateNotificationDto, FindAllNotificationsDto } from './dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ operationId: 'createNotification' })
  create(
    @CurrentUser() currentUser: User,
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create(currentUser, createNotificationDto);
  }

  @Get()
  @ApiOperation({ operationId: 'getNotifications' })
  findAll(
    @CurrentUser() currentUser: User,
    @Query() query: FindAllNotificationsDto,
  ) {
    return this.notificationsService.findAll(currentUser, query);
  }

  @Get('unread/count')
  @ApiOperation({ operationId: 'getUnreadNotificationCount' })
  getUnreadCount(@CurrentUser() currentUser: User): Promise<number> {
    return this.notificationsService.getUnreadCount(currentUser);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getNotification' })
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Notification> {
    return this.notificationsService.findOne(currentUser, id);
  }

  @Patch(':id/read')
  @ApiOperation({ operationId: 'markNotificationAsRead' })
  markAsRead(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(currentUser, id);
  }

  @Patch('read/all')
  @ApiOperation({ operationId: 'markAllNotificationsAsRead' })
  markAllAsRead(@CurrentUser() currentUser: User) {
    return this.notificationsService.markAllAsRead(currentUser);
  }
}
