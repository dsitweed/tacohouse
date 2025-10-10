import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Building, Prisma, UserRole } from '@tacohouse/shared';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationType, UserWithRelations } from 'src/types';

import {
  CreateBuildingDto,
  FindAllBuildingsDto,
  UpdateBuildingDto,
} from './dto';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async create(
    currentUser: UserWithRelations,
    createBuildingDto: CreateBuildingDto,
  ) {
    // LANDLORD can creates building for themselves
    // ADMIN can create building for any landlord
    const { landlordId } = createBuildingDto;
    const canAccessLandlord = await this.canAccessLandlordResource(
      currentUser,
      landlordId,
    );

    if (!canAccessLandlord) {
      throw new ForbiddenException();
    }

    return this.prisma.building.create({
      data: {
        ...createBuildingDto,
        landlordId,
      },
    });
  }

  async findAll(
    currentUser: UserWithRelations,
    query: FindAllBuildingsDto,
  ): Promise<{
    data: Building[];
    pagination: PaginationType;
  }> {
    const { limit, page, landlordId } = query;
    const skip = (page - 1) * limit;
    // Authorization logic:
    // - ADMIN: View all buildings (can filter by landlordId)
    // - LANDLORD: View only your buildings
    // - TENANT: View buildings where they are renting
    const where: Prisma.BuildingWhereInput = {};

    const userWithRole = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      include: {
        admin: true,
        landlord: true,
        tenant: true,
      },
    });

    if (userWithRole?.admin) {
      where.landlordId = landlordId;
    } else if (userWithRole?.landlord) {
      where.landlordId = userWithRole.landlord.id;
    } else if (userWithRole?.tenant) {
      where.rooms = {
        some: {
          rentals: {
            some: {
              tenantId: userWithRole.tenant.id,
              status: 'ACTIVE',
            },
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.building.findMany({
        where,
        skip,
        take: limit,
        include: {
          landlord: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  isActive: true,
                  deletedAt: true,
                  profile: true,
                },
              },
            },
          },
          _count: {
            select: {
              rooms: true,
            },
          },
        },
      }),
      this.prisma.building.count({ where }),
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

  async findOne(currentUser: UserWithRelations, id: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
    });
    if (!building) {
      throw new NotFoundException();
    }

    const canAccessBuilding = await this.canAccessBuildingResource(
      currentUser,
      building,
    );

    if (!canAccessBuilding) {
      throw new ForbiddenException();
    }

    return building;
  }

  async update(
    currentUser: UserWithRelations,
    id: string,
    updateBuildingDto: UpdateBuildingDto,
  ) {
    const building = await this.findOne(currentUser, id);

    const canAccessLandlord = await this.canAccessLandlordResource(
      currentUser,
      building.landlordId,
    );

    if (!canAccessLandlord) {
      throw new ForbiddenException();
    }

    return this.prisma.building.update({
      where: { id: building.id },
      data: updateBuildingDto,
    });
  }

  async remove(currentUser: UserWithRelations, id: string) {
    const building = await this.findOne(currentUser, id);
    const canAccessLandlord = await this.canAccessLandlordResource(
      currentUser,
      building.landlordId,
    );

    if (!canAccessLandlord) {
      throw new ForbiddenException();
    }

    return this.prisma.building.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Check access rights to resources related to landlord
   * - ADMIN users are always allowed.
   * - LANDLORD users are only allowed if the target landlordId matches their own landlord.id.
   * - All other roles are forbidden.
   * @param currentUser - The authenticated user
   * @param landlordId  - The ID of the landlord the action is being performed for
   */
  private async canAccessLandlordResource(
    currentUser: UserWithRelations,
    landlordId: string,
  ) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { id: landlordId },
    });
    if (!landlord) {
      throw new NotFoundException(`Landlord witdh ID ${landlordId} not found`);
    }

    if (currentUser.role === UserRole.ADMIN) return true;

    if (currentUser.role !== UserRole.LANDLORD) {
      throw new ForbiddenException();
    }

    return currentUser.landlord?.id === landlord.id;
  }

  /**
   * Check access rights to building resources
   * - ADMIN always has rights
   * - LANDLORD only has rights if the building belongs to him
   * - TENANT only has rights if he is renting a room in that building
   * - All other roles (in the future) are deined
   * @param currentUser - The authenticated user
   * @param building - The building need to be check permission
   */
  private async canAccessBuildingResource(
    currentUser: UserWithRelations,
    building: Building,
  ) {
    if (currentUser.role === UserRole.ADMIN) return true;

    if (currentUser.role === UserRole.LANDLORD) {
      return building.landlordId === currentUser.landlord?.id;
    }

    if (currentUser.role === UserRole.TENANT && currentUser.tenant) {
      const hasAccess = await this.prisma.rental.findFirst({
        where: {
          tenantId: currentUser.tenant.id,
          status: 'ACTIVE',
          room: {
            buildingId: building.id,
          },
        },
      });

      return !!hasAccess;
    }

    return false;
  }
}
