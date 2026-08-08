import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Rental, User } from 'generated/prisma/client';
import { Prisma } from 'generated/prisma/client';
import { RentalStatus, UserRole } from 'generated/prisma/enums';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationMeta } from 'types';

import { CreateRentalDto, FindAllRentalsDto, UpdateRentalDto } from './dto';

@Injectable()
export class RentalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    currentUser: User,
    createRentalDto: CreateRentalDto,
  ): Promise<Rental> {
    const { roomId, tenantId, startDate } = createRentalDto;

    // Check if room exists and user has access
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { building: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check permissions
    if (currentUser.role === UserRole.TENANT) {
      if (currentUser.id !== tenantId) {
        throw new ForbiddenException(
          'You can only create rentals for yourself',
        );
      }
    } else if (currentUser.role === UserRole.LANDLORD) {
      if (room.building.landlordId !== currentUser.id) {
        throw new ForbiddenException(
          'You can only create rentals for your buildings',
        );
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    // Check if room is available
    if (room.status !== 'AVAILABLE' && room.status !== 'PENDING_CHECKOUT') {
      throw new BadRequestException('Room is not available for rental');
    }

    // Check if tenant already has an active rental
    const activeRental = await this.prisma.rental.findFirst({
      where: {
        tenantId,
        status: 'ACTIVE',
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
    });

    if (activeRental) {
      throw new BadRequestException('Tenant already has an active rental');
    }

    // Create rental
    const rental = await this.prisma.rental.create({
      data: {
        ...createRentalDto,
        startDate: new Date(startDate),
        endDate: createRentalDto.endDate
          ? new Date(createRentalDto.endDate)
          : null,
        depositPaid: createRentalDto.depositPaid || 0,
      },
    });

    // Update room status
    await this.prisma.room.update({
      where: { id: roomId },
      data: { status: 'OCCUPIED' },
    });

    return rental;
  }

  async findAll(
    currentUser: User,
    query: FindAllRentalsDto,
  ): Promise<{
    data: Rental[];
    pagination: PaginationMeta;
  }> {
    const { limit = 10, page = 1, roomId, tenantId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RentalWhereInput = {};

    // Apply filters
    if (roomId) where.roomId = roomId;
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    // Authorization logic
    if (currentUser.role === UserRole.ADMIN) {
      // Admin can see all rentals
    } else if (currentUser.role === UserRole.LANDLORD) {
      // Landlord can only see rentals in their buildings
      where.room = {
        building: {
          landlordId: currentUser.id,
        },
      };
    } else if (currentUser.role === UserRole.TENANT) {
      // Tenant can only see their own rentals
      where.tenantId = currentUser.id;
    }

    const [data, total] = await Promise.all([
      this.prisma.rental.findMany({
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
      this.prisma.rental.count({ where }),
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

  async findOne(currentUser: User, id: string): Promise<Rental> {
    const rental = await this.prisma.rental.findUnique({
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

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    // Check permissions
    if (currentUser.role === UserRole.TENANT) {
      if (rental.tenantId !== currentUser.id) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role === UserRole.LANDLORD) {
      if (rental.room.building.landlordId !== currentUser.id) {
        throw new ForbiddenException();
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException();
    }

    return rental;
  }

  async update(
    currentUser: User,
    id: string,
    updateRentalDto: UpdateRentalDto,
  ): Promise<Rental> {
    const rental = await this.findOne(currentUser, id);

    // Check permissions
    if (currentUser.role === UserRole.TENANT) {
      // Tenant can only update noticeDate
      if (updateRentalDto.noticeDate) {
        const noticeDate = new Date(updateRentalDto.noticeDate);
        const minNoticeDate = new Date();
        minNoticeDate.setMonth(minNoticeDate.getMonth() + 1); // 30 days from now

        if (noticeDate < minNoticeDate) {
          throw new BadRequestException(
            'Notice date must be at least 30 days from now',
          );
        }

        // Update room status to PENDING_CHECKOUT
        await this.prisma.room.update({
          where: { id: rental.roomId },
          data: {
            status: 'PENDING_CHECKOUT',
            availableFrom: noticeDate,
          },
        });

        return this.prisma.rental.update({
          where: { id },
          data: {
            noticeDate,
            status: 'NOTICE_GIVEN',
          },
        });
      }
      throw new ForbiddenException('You can only update notice date');
    }

    // Landlord and Admin can update all fields
    return this.prisma.rental.update({
      where: { id },
      data: {
        ...updateRentalDto,
        endDate: updateRentalDto.endDate
          ? new Date(updateRentalDto.endDate)
          : undefined,
        noticeDate: updateRentalDto.noticeDate
          ? new Date(updateRentalDto.noticeDate)
          : undefined,
      },
    });
  }

  async remove(currentUser: User, id: string): Promise<Rental> {
    const rental = await this.findOne(currentUser, id);

    // Only Admin and Landlord can terminate rentals
    if (currentUser.role === UserRole.TENANT) {
      throw new ForbiddenException('You cannot terminate rentals');
    }

    // Update room status back to available
    await this.prisma.room.update({
      where: { id: rental.roomId },
      data: { status: 'AVAILABLE', availableFrom: null },
    });

    return this.prisma.rental.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        endDate: new Date(),
      },
    });
  }
}
