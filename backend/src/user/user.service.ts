import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithProfile } from 'src/types';
import { flattenUser } from 'src/utils';

import { UpdatePasswordDto, UpdateUserProfileDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<Omit<UserWithProfile, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return user;
  }

  async update(
    currentUser: UserWithProfile,
    updateUserDto: UpdateUserProfileDto,
  ) {
    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        profile: {
          update: updateUserDto,
        },
      },
      include: {
        profile: true,
      },
    });

    if (!updatedUser.profile) {
      throw new NotFoundException();
    }

    return flattenUser(updatedUser);
  }

  async updatePassword(
    currentUser: UserWithProfile,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const {
      currentPassword,
      confirmPassword,
      password: newPassword,
    } = updatePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new BadRequestException();
    }

    const isCurrentPasswordValid = await argon.verify(
      user.password,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException();
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException();
    }

    const hashedPassword = await argon.hash(newPassword);

  const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
      include: { profile: true },
    });

    return flattenUser(updatedUser);
  }
}
