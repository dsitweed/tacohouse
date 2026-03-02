import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { MessageType, Prisma, UserRole } from '@prisma/client';
import type { ChatGroup, Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationType, UserWithRelations } from 'src/types';

import { SendMessageDto, FindAllMessagesDto } from './dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroups(currentUser: UserWithRelations): Promise<ChatGroup[]> {
    const where: Prisma.ChatGroupWhereInput = {};

    if (currentUser.role === UserRole.LANDLORD) {
      // Landlord can see groups for their buildings
      where.building = {
        landlordId: currentUser.landlord?.id,
      };
    } else if (currentUser.role === UserRole.TENANT) {
      // Tenant can see groups for buildings where they are renting
      where.members = {
        some: {
          userId: currentUser.id,
        },
      };
    }
    // Admin can see all groups

    return this.prisma.chatGroup.findMany({
      where,
      include: {
        building: true,
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });
  }

  async getGroup(
    currentUser: UserWithRelations,
    groupId: string,
  ): Promise<ChatGroup> {
    const group = await this.prisma.chatGroup.findUnique({
      where: { id: groupId },
      include: {
        building: true,
        members: {
          include: {
            building: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Chat group not found');
    }

    // Check permissions
    if (currentUser.role === UserRole.LANDLORD) {
      if (group.building.landlordId !== currentUser.landlord?.id) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role === UserRole.TENANT) {
      const isMember = group.members.some(
        (member) => member.userId === currentUser.id,
      );
      if (!isMember) {
        throw new ForbiddenException('You are not a member of this group');
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    return group;
  }

  async getMessages(
    currentUser: UserWithRelations,
    groupId: string,
    query: FindAllMessagesDto,
  ): Promise<{
    data: Message[];
    pagination: PaginationType;
  }> {
    const { limit = 50, page = 1, before } = query;
    const skip = before ? 0 : (page - 1) * limit;

    // Verify user has access to group
    await this.getGroup(currentUser, groupId);

    const where: Prisma.MessageWhereInput = {
      chatGroupId: groupId,
    };

    if (before) {
      where.id = { lt: before };
    }

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        include: {
          senderUser: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit!);

    return {
      data: data.reverse(), // Return in chronological order
      pagination: {
        page: page!,
        limit: limit!,
        total,
        totalPages,
        hasNext: before ? data.length === limit! : page! < totalPages,
        hasPrev: page! > 1,
      },
    };
  }

  async sendMessage(
    currentUser: UserWithRelations,
    groupId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    // Verify user has access to group
    const group = await this.getGroup(currentUser, groupId);

    // Check if user is member (for tenants)
    if (currentUser.role === UserRole.TENANT) {
      const groupWithDetails = await this.prisma.chatGroup.findUnique({
        where: { id: groupId },
        include: {
          members: true,
          building: true,
        },
      });
      const isMember = groupWithDetails?.members.some(
        (member) => member.userId === currentUser.id,
      );
      if (
        !isMember &&
        groupWithDetails?.building.landlordId !== currentUser.landlord?.id
      ) {
        throw new ForbiddenException('You are not a member of this group');
      }
    }

    return this.prisma.message.create({
      data: {
        senderId: currentUser.id,
        chatGroupId: groupId,
        content: sendMessageDto.content,
        messageType: sendMessageDto.messageType || MessageType.TEXT,
      },
      include: {
        senderUser: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async getDirectMessages(
    currentUser: UserWithRelations,
    userId: string,
    query: FindAllMessagesDto,
  ): Promise<{
    data: Message[];
    pagination: PaginationType;
  }> {
    const { limit = 50, page = 1, before } = query;
    const skip = before ? 0 : (page - 1) * limit;

    // Users can only see messages between themselves
    if (currentUser.id !== userId && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    const where: Prisma.MessageWhereInput = {
      OR: [
        { senderId: currentUser.id, recipientId: userId },
        { senderId: userId, recipientId: currentUser.id },
      ],
    };

    if (before) {
      where.id = { lt: before };
    }

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        include: {
          senderUser: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit!);

    return {
      data: data.reverse(),
      pagination: {
        page: page!,
        limit: limit!,
        total,
        totalPages,
        hasNext: before ? data.length === limit! : page! < totalPages,
        hasPrev: page! > 1,
      },
    };
  }

  async sendDirectMessage(
    currentUser: UserWithRelations,
    userId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    // Check if recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Users cannot message themselves
    if (currentUser.id === userId) {
      throw new BadRequestException('You cannot message yourself');
    }

    return this.prisma.message.create({
      data: {
        senderId: currentUser.id,
        recipientId: userId,
        content: sendMessageDto.content,
        messageType: sendMessageDto.messageType || MessageType.TEXT,
      },
      include: {
        senderUser: {
          include: {
            profile: true,
          },
        },
      },
    });
  }
}

