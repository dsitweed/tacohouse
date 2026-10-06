import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { buildPaginationMeta } from 'core/common/utils/pagination.util';
import { PrismaService } from 'core/prisma/prisma.service';
import type { Rental, User } from 'generated/prisma/client';
import { Prisma } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';
import { PaginationMeta } from 'types';

import { CreateRentalDto, FindAllRentalsDto, UpdateRentalDto } from './dto';

/**
 * Window used to flag a contract as "expiring soon".
 * Derived purely from `endDate` — unrelated to the rental status lifecycle.
 */
const EXPIRING_SOON_DAYS = 30;

/**
 * Minimum advance notice (in days) a tenant must give before moving out.
 * Only governs the `NOTICE_GIVEN` flow — it has nothing to do with how close
 * a contract is to its `endDate`.
 */
const NOTICE_PERIOD_DAYS = 30;

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
    const {
      limit = 10,
      page = 1,
      roomId,
      buildingId,
      tenantId,
      status,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RentalWhereInput = {};
    const roomFilter: Prisma.RoomWhereInput = {};

    // Apply filters
    if (roomId) where.roomId = roomId;
    if (buildingId) roomFilter.buildingId = buildingId;
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;
    if (search?.trim()) {
      const searchTerm = search.trim();
      where.AND = [
        {
          OR: [
            {
              tenant: {
                email: { contains: searchTerm, mode: 'insensitive' },
              },
            },
            {
              tenant: {
                profile: {
                  firstName: { contains: searchTerm, mode: 'insensitive' },
                },
              },
            },
            {
              tenant: {
                profile: {
                  lastName: { contains: searchTerm, mode: 'insensitive' },
                },
              },
            },
            {
              room: {
                number: { contains: searchTerm, mode: 'insensitive' },
              },
            },
            {
              room: {
                building: {
                  name: { contains: searchTerm, mode: 'insensitive' },
                },
              },
            },
          ],
        },
      ];
    }

    // Authorization logic
    if (currentUser.role === UserRole.ADMIN) {
      // Admin can see all rentals
    } else if (currentUser.role === UserRole.LANDLORD) {
      // Landlord can only see rentals in their buildings
      roomFilter.building = {
        landlordId: currentUser.id,
      };
    } else if (currentUser.role === UserRole.TENANT) {
      // Tenant can only see their own rentals
      where.tenantId = currentUser.id;
    }

    if (Object.keys(roomFilter).length > 0) {
      where.room = roomFilter;
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

    return {
      data,
      pagination: buildPaginationMeta({ page, limit, total }),
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
        minNoticeDate.setDate(minNoticeDate.getDate() + NOTICE_PERIOD_DAYS);

        if (noticeDate < minNoticeDate) {
          throw new BadRequestException(
            `Notice date must be at least ${NOTICE_PERIOD_DAYS} days from now`,
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

  async getStats(currentUser: User) {
    const rentalAccessWhere: Prisma.RentalWhereInput =
      currentUser.role === UserRole.LANDLORD
        ? {
            room: {
              building: {
                landlordId: currentUser.id,
              },
            },
          }
        : {};

    const now = new Date();
    const expiringSoonLimit = new Date(now);
    expiringSoonLimit.setDate(expiringSoonLimit.getDate() + EXPIRING_SOON_DAYS);

    const rentals = await this.prisma.rental.findMany({
      where: {
        ...rentalAccessWhere,
      },
      select: {
        startDate: true,
        endDate: true,
        monthlyRent: true,
        status: true,
      },
    });
    const activeRentals = rentals.filter(
      (rental) => rental.status === 'ACTIVE',
    );
    const activeCount = activeRentals.length;

    // Tenant-driven event: the tenant notified the landlord they are leaving.
    const noticeGivenCount = rentals.filter(
      (rental) => rental.status === 'NOTICE_GIVEN',
    ).length;

    // Time-derived condition: an active contract ends soon and the tenant has
    // not given notice yet, so the landlord should follow up.
    const expiringSoonCount = activeRentals.filter(
      (rental) =>
        rental.endDate !== null &&
        rental.endDate.getTime() >= now.getTime() &&
        rental.endDate.getTime() <= expiringSoonLimit.getTime(),
    ).length;

    const totalRentalDurationMs = rentals.reduce((total, rental) => {
      const endDate = rental.endDate ?? now;
      return total + endDate.getTime() - rental.startDate.getTime();
    }, 0);
    const millisecondsPerMonth = 30.44 * 24 * 60 * 60 * 1000;
    const averageTerm =
      rentals.length === 0
        ? 0
        : Math.round(
            (totalRentalDurationMs / rentals.length / millisecondsPerMonth) *
              10,
          ) / 10;

    const monthlyRevenue = rentals
      .reduce(
        (total, rental) => total.plus(rental.monthlyRent),
        new Prisma.Decimal(0),
      )
      .toFixed(2);

    return {
      activeCount,
      noticeGivenCount,
      expiringSoonCount,
      averageTerm,
      monthlyRevenue,
    };
  }
}
