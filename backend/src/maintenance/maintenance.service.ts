import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MaintenanceRequest, User } from 'generated/prisma/client';
import { Prisma } from 'generated/prisma/client';
import { MaintenanceStatus, UserRole } from 'generated/prisma/enums';
import {
  MaintenanceRequestUpdateInput,
  RoomWhereInput,
} from 'generated/prisma/models';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationMeta } from 'types';

import {
  CreateMaintenanceDto,
  FindAllMaintenanceDto,
  RespondMaintenanceDto,
  UpdateMaintenanceDto,
} from './dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    currentUser: User,
    createMaintenanceDto: CreateMaintenanceDto,
  ): Promise<MaintenanceRequest> {
    const { roomId } = createMaintenanceDto;

    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        building: true,
        rentals: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Only tenants can create maintenance requests
    if (currentUser.role !== UserRole.TENANT) {
      throw new ForbiddenException(
        'Only tenants can create maintenance requests',
      );
    }

    // Check if tenant is renting this room
    const hasAccess = room.rentals.some(
      (rental) => rental.tenantId === currentUser.id,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You can only create maintenance requests for rooms you are renting',
      );
    }

    return this.prisma.maintenanceRequest.create({
      data: {
        ...createMaintenanceDto,
        tenantId: currentUser.id,
      },
    });
  }

  async findAll(
    currentUser: User,
    query: FindAllMaintenanceDto,
  ): Promise<{
    data: MaintenanceRequest[];
    pagination: PaginationMeta;
  }> {
    const {
      limit = 10,
      page = 1,
      tenantId,
      roomId,
      buildingId,
      status,
      priority,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceRequestWhereInput = {};

    // Apply filters
    if (tenantId) where.tenantId = tenantId;
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (buildingId)
      where.room = {
        buildingId: buildingId,
      };

    // Authorization logic
    if (currentUser.role === UserRole.ADMIN) {
      // Admin can see all requests
    } else if (currentUser.role === UserRole.LANDLORD) {
      // Landlord can only see requests for their buildings
      where.room = {
        ...(where.room as RoomWhereInput),
        building: {
          landlordId: currentUser.id,
        },
      };
    } else if (currentUser.role === UserRole.TENANT) {
      // Tenant can only see their own requests
      where.tenantId = currentUser.id;
    }

    const [data, total] = await Promise.all([
      this.prisma.maintenanceRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          room: {
            include: {
              building: true,
            },
          },
          tenant: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.maintenanceRequest.count({ where }),
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

  async findOne(currentUser: User, id: string): Promise<MaintenanceRequest> {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            building: true,
          },
        },
        tenant: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    // Check permissions
    if (currentUser.role === UserRole.TENANT) {
      if (request.tenantId !== currentUser.id) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role === UserRole.LANDLORD) {
      if (request.room.building.landlordId !== currentUser.id) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    return request;
  }

  async update(
    currentUser: User,
    id: string,
    updateMaintenanceDto: UpdateMaintenanceDto,
  ): Promise<MaintenanceRequest> {
    const request = await this.findOne(currentUser, id);

    // Tenants can only update their own requests if status is PENDING
    if (currentUser.role === UserRole.TENANT) {
      if (request.tenantId !== currentUser.id) {
        throw new ForbiddenException();
      }
      if (request.status !== MaintenanceStatus.PENDING) {
        throw new ForbiddenException(
          'You can only update pending maintenance requests',
        );
      }
      // Tenants cannot change status
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, ...tenantUpdateData } = updateMaintenanceDto;
      return this.prisma.maintenanceRequest.update({
        where: { id },
        data: tenantUpdateData,
      });
    }

    // Landlord and Admin can update all fields
    const updateData: MaintenanceRequestUpdateInput = {
      ...updateMaintenanceDto,
    };
    if (updateMaintenanceDto.status === MaintenanceStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
    });
  }

  async respond(
    currentUser: User,
    id: string,
    respondDto: RespondMaintenanceDto,
  ): Promise<MaintenanceRequest> {
    const request = await this.findOne(currentUser, id);

    // Only Landlord and Admin can respond
    if (currentUser.role === UserRole.TENANT) {
      throw new ForbiddenException(
        'You cannot respond to maintenance requests',
      );
    }

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        completionNote: respondDto.response,
        status: MaintenanceStatus.IN_PROGRESS,
      },
    });
  }
}
