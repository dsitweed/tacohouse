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

import { Room, UserRole } from '@tacohouse/shared';
import { CurrentUser, Public, Roles } from 'src/common/decorators';
import type { UserWithRelations } from 'src/types';

import { CreateRoomDto, FindAllRoomsDto, UpdateRoomDto } from './dto';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('available')
  @Public()
  @ApiOperation({ summary: 'Get available rooms (Public)' })
  @ApiResponse({ status: 200, description: 'List of available rooms' })
  getAvailableRooms(): Promise<Room[]> {
    return this.roomsService.getAvailableRooms();
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<Room> {
    return this.roomsService.create(currentUser, createRoomDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  findAll(
    @CurrentUser() currentUser: UserWithRelations,
    @Query() query: FindAllRoomsDto,
  ) {
    return this.roomsService.findAll(currentUser, query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  findOne(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<Room> {
    return this.roomsService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    return this.roomsService.update(currentUser, id, updateRoomDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<Room> {
    return this.roomsService.remove(currentUser, id);
  }
}
