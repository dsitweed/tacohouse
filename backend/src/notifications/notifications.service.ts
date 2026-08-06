import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from 'generated/prisma/client';
import type { Notification, User } from 'generated/prisma/client';
import { NotificationType, UserRole } from 'generated/prisma/enums';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationMeta } from 'types';

import { CreateNotificationDto, FindAllNotificationsDto } from './dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    currentUser: User,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    // Only Admin and Landlord can create notifications
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.LANDLORD
    ) {
      throw new ForbiddenException(
        'Only admins and landlords can create notifications',
      );
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createNotificationDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Landlords can only notify tenants in their buildings
    if (currentUser.role === UserRole.LANDLORD) {
      // This would require checking if user is a tenant in landlord's buildings
      // For now, we'll allow it but could add more validation
    }

    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async findAll(
    currentUser: User,
    query: FindAllNotificationsDto,
  ): Promise<{
    data: Notification[];
    pagination: PaginationMeta;
  }> {
    const { limit = 20, page = 1, isRead, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId: currentUser.id, // Users can only see their own notifications
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page: page,
        limit: limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(currentUser: User, id: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Users can only see their own notifications
    if (notification.userId !== currentUser.id) {
      throw new ForbiddenException();
    }

    return notification;
  }

  async markAsRead(currentUser: User, id: string): Promise<Notification> {
    const notification = await this.findOne(currentUser, id);

    if (notification.isRead) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(currentUser: User): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  async getUnreadCount(currentUser: User): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
    });
  }
}
