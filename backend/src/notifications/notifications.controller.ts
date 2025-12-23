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

import { Notification, UserRole } from '@tacohouse/shared';
import { CurrentUser, Roles } from 'src/common/decorators';
import type { UserWithRelations } from 'src/types';

import {
  CreateNotificationDto,
  FindAllNotificationsDto,
} from './dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create(
      currentUser,
      createNotificationDto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: UserWithRelations,
    @Query() query: FindAllNotificationsDto,
  ) {
    return this.notificationsService.findAll(currentUser, query);
  }

  @Get('unread/count')
  getUnreadCount(@CurrentUser() currentUser: UserWithRelations): Promise<number> {
    return this.notificationsService.getUnreadCount(currentUser);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<Notification> {
    return this.notificationsService.findOne(currentUser, id);
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(currentUser, id);
  }

  @Patch('read/all')
  markAllAsRead(@CurrentUser() currentUser: UserWithRelations) {
    return this.notificationsService.markAllAsRead(currentUser);
  }
}

