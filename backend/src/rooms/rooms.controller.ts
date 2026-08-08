import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Public, Roles } from 'common/decorators';
import { Room as RoomEntity } from 'generated/nestjs-dto';
import type { Room, User } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import { CreateRoomDto, FindAllRoomsDto, UpdateRoomDto } from './dto';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('available')
  @Public()
  @ApiOperation({
    operationId: 'getAvailableRooms',
    summary: 'Get available rooms (Public)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available rooms',
    type: RoomEntity,
    isArray: true,
  })
  getAvailableRooms(): Promise<Room[]> {
    return this.roomsService.getAvailableRooms();
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ operationId: 'createRoom' })
  @ApiResponse({ status: 201, type: RoomEntity })
  create(
    @CurrentUser() currentUser: User,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<Room> {
    return this.roomsService.create(currentUser, createRoomDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ operationId: 'getRooms' })
  @ApiResponse({ status: 200, type: RoomEntity, isArray: true })
  findAll(@CurrentUser() currentUser: User, @Query() query: FindAllRoomsDto) {
    return this.roomsService.findAll(currentUser, query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ operationId: 'getRoom' })
  @ApiResponse({ status: 200, type: RoomEntity })
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Room> {
    return this.roomsService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ operationId: 'updateRoom' })
  @ApiResponse({ status: 200, type: RoomEntity })
  update(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    return this.roomsService.update(currentUser, id, updateRoomDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ operationId: 'deleteRoom' })
  @ApiResponse({ status: 200, type: RoomEntity })
  remove(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Room> {
    return this.roomsService.remove(currentUser, id);
  }
}
