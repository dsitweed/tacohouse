import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from 'common/decorators';
import {
  ChatGroup as ChatGroupEntity,
  Message as MessageEntity,
} from 'generated/nestjs-dto';
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
  @ApiResponse({ status: 200, type: ChatGroupEntity, isArray: true })
  getGroups(@CurrentUser() currentUser: User): Promise<ChatGroup[]> {
    return this.chatService.getGroups(currentUser);
  }

  @Get('groups/:id')
  @ApiResponse({ status: 200, type: ChatGroupEntity })
  getGroup(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<ChatGroup> {
    return this.chatService.getGroup(currentUser, id);
  }

  @Get('groups/:id/messages')
  @ApiResponse({ status: 200, type: MessageEntity, isArray: true })
  getMessages(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Query() query: FindAllMessagesDto,
  ) {
    return this.chatService.getMessages(currentUser, id, query);
  }

  @Post('groups/:id/messages')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  @ApiResponse({ status: 201, type: MessageEntity })
  sendMessage(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    return this.chatService.sendMessage(currentUser, id, sendMessageDto);
  }

  @Get('direct/:userId')
  @ApiResponse({ status: 200, type: MessageEntity, isArray: true })
  getDirectMessages(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: string,
    @Query() query: FindAllMessagesDto,
  ) {
    return this.chatService.getDirectMessages(currentUser, userId, query);
  }

  @Post('direct/:userId')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  @ApiResponse({ status: 201, type: MessageEntity })
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
