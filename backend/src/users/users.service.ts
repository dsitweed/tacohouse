import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { User } from 'generated/prisma/client';
import { UserWhereUniqueInput } from 'generated/prisma/models';
import { PrismaService } from 'prisma/prisma.service';

import { UpdatePasswordDto, UpdateUserProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(currentUser: User, id: string): Promise<User | null> {
    if (currentUser.id === id) {
      throw new BadRequestException(
        'Use GET /users/me to retrieve your own profile',
      );
    }

    let findUserCondition: UserWhereUniqueInput | null = null;

    if (currentUser.role === 'ADMIN') {
      findUserCondition = { id };
    }

    if (currentUser.role === 'LANDLORD') {
      findUserCondition = {
        id,
        rentals: {
          some: {
            status: 'ACTIVE',
            room: {
              building: {
                landlordId: currentUser.id,
              },
            },
          },
        },
      };
    }

    if (currentUser.role === 'TENANT' || !findUserCondition) {
      throw new UnauthorizedException(
        'You do not have permission to view this user',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: findUserCondition,
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserProfile(
    id: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        profile: {
          update: updateUserProfileDto,
        },
      },
      include: { profile: true },
    });

    if (!updatedUser.profile) {
      throw new NotFoundException();
    }

    return updatedUser;
  }

  // TODO: [OPTIONAL] Cancel old token or request re-login
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const {
      currentPassword,
      confirmPassword,
      password: newPassword,
    } = updatePasswordDto;

    const account = await this.prisma.account.findUnique({
      where: {
        providerId_accountId: {
          providerId: 'credential',
          accountId: userId,
        },
      },
    });

    if (!account || !account.password) {
      throw new BadRequestException();
    }

    const isCurrentPasswordValid = await argon.verify(
      account.password,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException();
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException();
    }

    const hashedPassword = await argon.hash(newPassword);

    // Only return a confirmation, never the Account record (it holds the password hash)
    await this.prisma.account.update({
      where: {
        providerId_accountId: {
          providerId: 'credential',
          accountId: userId,
        },
      },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password updated successfully' };
  }
}
