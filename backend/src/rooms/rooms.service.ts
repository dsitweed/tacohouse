import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Building, Prisma, Room, UserRole } from '@tacohouse/shared';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationType, UserWithRelations } from 'src/types';

import { FindAllRoomsDto } from './dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

type RoomWithLandlord = Room & {
  building: {
    landlordId: string;
  };
};

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  create(createRoomDto: CreateRoomDto) {
    return 'This action adds a new room';
  }

  async findAll(
    currentUser: UserWithRelations,
    query: FindAllRoomsDto,
  ): Promise<{
    data: Room[];
    pagination: PaginationType;
  }> {
    const { limit, page, landlordId, buildingId } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.RoomWhereInput = {};

    if (currentUser.admin) {
      where.buildingId = buildingId;
      where.building = { landlordId };
    } else if (currentUser.landlord) {
      where.buildingId = buildingId;
      where.building = { landlordId: currentUser.landlord.id };
    } else if (currentUser.tenant) {
      where.rentals = {
        some: {
          status: 'ACTIVE',
          tenantId: currentUser.tenant.id,
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.room.findMany({
        skip,
        take: limit,
        where,
        include: {
          building: true,
        },
      }),
      this.prisma.room.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(currentUser: UserWithRelations, id: string): Promise<Room> {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        building: {
          select: { landlordId: true },
        },
      },
    });
    if (!room) {
      throw new NotFoundException();
    }

    const canAccessRoom = await this.canAccessRoomResource(currentUser, room);
    if (!canAccessRoom) {
      throw new ForbiddenException();
    }

    return room;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }

  private async canAccessRoomResource(
    currentUser: UserWithRelations,
    room: RoomWithLandlord,
  ) {
    if (currentUser.role === UserRole.ADMIN) return true;

    if (currentUser.role === UserRole.LANDLORD) {
      return currentUser.landlord?.id === room.building.landlordId;
    }

    if (currentUser.role === UserRole.TENANT && currentUser.tenant) {
      const hasAccess = await this.prisma.rental.findFirst({
        where: {
          tenantId: currentUser.tenant.id,
          roomId: room.id,
          status: 'ACTIVE',
        },
      });

      return !!hasAccess;
    }

    return false;
  }
}
