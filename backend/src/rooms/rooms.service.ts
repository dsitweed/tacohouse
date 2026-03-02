import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, UserRole } from '@prisma/client';
import type { Room } from '@prisma/client';
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

  async create(
    currentUser: UserWithRelations,
    createRoomDto: CreateRoomDto,
  ): Promise<Room> {
    // LANDLORD can creates room for themselves
    // ADMIN can create room for any landlord
    const { buildingId } = createRoomDto;
    const canAccessBuilding = await this.canAccessBuildingResource(
      currentUser,
      buildingId,
    );

    if (!canAccessBuilding) {
      throw new ForbiddenException();
    }

    return await this.prisma.room.create({
      data: createRoomDto,
    });
  }

  async getAvailableRooms(): Promise<Room[]> {
    return this.prisma.room.findMany({
      where: {
        status: 'AVAILABLE',
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });
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

  async update(
    currentUser: UserWithRelations,
    id: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    const room = await this.findOne(currentUser, id);
    const { buildingId } = updateRoomDto;
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException();
    }

    const canAccessBuilding = await this.canAccessBuildingResource(
      currentUser,
      room.buildingId,
    );

    if (!canAccessBuilding) {
      throw new ForbiddenException();
    }

    return this.prisma.room.update({
      where: { id: room.id },
      data: updateRoomDto,
    });
  }

  async remove(currentUser: UserWithRelations, id: string): Promise<Room> {
    const room = await this.findOne(currentUser, id);
    const canAccessBuilding = await this.canAccessBuildingResource(
      currentUser,
      room.buildingId,
    );

    if (!canAccessBuilding) {
      throw new ForbiddenException();
    }

    return this.prisma.room.delete({
      where: { id },
    });
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

  private async canAccessBuildingResource(
    currentUser: UserWithRelations,
    buildingId: string,
  ) {
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });
    if (!building) {
      throw new NotFoundException();
    }

    if (currentUser.role === UserRole.ADMIN) return true;
    if (currentUser.role !== UserRole.LANDLORD) {
      throw new ForbiddenException();
    }

    return currentUser.landlord?.id === building.landlordId;
  }
}
