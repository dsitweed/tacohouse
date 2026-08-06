import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from 'common/decorators';
import type { ChatGroup, Message, User } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import { ChatService } from './chat.service';
import { FindAllMessagesDto, SendMessageDto } from './dto';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('groups')
  getGroups(@CurrentUser() currentUser: User): Promise<ChatGroup[]> {
    return this.chatService.getGroups(currentUser);
  }

  @Get('groups/:id')
  getGroup(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<ChatGroup> {
    return this.chatService.getGroup(currentUser, id);
  }

  @Get('groups/:id/messages')
  getMessages(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Query() query: FindAllMessagesDto,
  ) {
    return this.chatService.getMessages(currentUser, id, query);
  }

  @Post('groups/:id/messages')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  sendMessage(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    return this.chatService.sendMessage(currentUser, id, sendMessageDto);
  }

  @Get('direct/:userId')
  getDirectMessages(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: string,
    @Query() query: FindAllMessagesDto,
  ) {
    return this.chatService.getDirectMessages(currentUser, userId, query);
  }

  @Post('direct/:userId')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  sendDirectMessage(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    return this.chatService.sendDirectMessage(
      currentUser,
      userId,
      sendMessageDto,
    );
  }
}
