import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

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
  create(
    @CurrentUser() currentUser: User,
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create(currentUser, createNotificationDto);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: User,
    @Query() query: FindAllNotificationsDto,
  ) {
    return this.notificationsService.findAll(currentUser, query);
  }

  @Get('unread/count')
  getUnreadCount(@CurrentUser() currentUser: User): Promise<number> {
    return this.notificationsService.getUnreadCount(currentUser);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Notification> {
    return this.notificationsService.findOne(currentUser, id);
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(currentUser, id);
  }

  @Patch('read/all')
  markAllAsRead(@CurrentUser() currentUser: User) {
    return this.notificationsService.markAllAsRead(currentUser);
  }
}
