import { Injectable } from '@nestjs/common';

import { Building, Prisma } from '@tacohouse/shared';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithProfile } from 'src/types';

import {
  CreateBuildingDto,
  FindAllBuildingsDto,
  UpdateBuildingDto,
} from './dto';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  create(createBuildingDto: CreateBuildingDto) {
    return 'This action adds a new building';
  }

  async findAll(
    currentUser: UserWithProfile,
    query: FindAllBuildingsDto,
  ): Promise<{
    data: Building[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
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

  findOne(id: number) {
    return `This action returns a #${id} building`;
  }

  update(id: number, updateBuildingDto: UpdateBuildingDto) {
    return `This action updates a #${id} building`;
  }

  remove(id: number) {
    return `This action removes a #${id} building`;
  }
}
