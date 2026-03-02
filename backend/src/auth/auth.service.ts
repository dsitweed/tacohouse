import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Prisma, UserRole } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithRelations } from 'src/types';
import { flattenUser } from 'src/utils';

import { LoginAuthDto, RegisterAuthDto } from './dto';
import { JwtPayload } from './strategies';

type RoleData =
  | { admin?: Prisma.AdminCreateNestedOneWithoutUserInput }
  | { landlord?: Prisma.LandlordCreateNestedOneWithoutUserInput }
  | { tenant?: Prisma.TenantCreateNestedOneWithoutUserInput }
  | Record<string, never>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(user: UserWithRelations) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = await this.getAuthTokens(payload);

    return {
      accessToken,
      refreshToken,
      user: flattenUser(user),
    };
  }

  async register(registerAuthDto: RegisterAuthDto) {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      avatar,
      dateOfBirth,
      occupation,
      workplace,
    } = registerAuthDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await argon.hash(password);
    const roleData = this.setRoleData(role, registerAuthDto);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
            avatar,
            dateOfBirth,
            occupation,
            workplace,
          },
        },
        ...roleData,
      },
      include: { profile: true, admin: true, landlord: true, tenant: true },
    });

    return flattenUser(newUser);
  }

  async refresh(user: UserWithRelations) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.getAuthTokens(payload);
  }

  async validateLocalUser({
    email,
    password,
  }: LoginAuthDto): Promise<Omit<UserWithRelations, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: { profile: true, admin: true, landlord: true, tenant: true },
    });

    if (user && (await argon.verify(user.password, password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }

  async validateJwtUser(
    payload: JwtPayload,
  ): Promise<Omit<UserWithRelations, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      include: { profile: true, admin: true, landlord: true, tenant: true },
    });

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }

  private async getAuthTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
          jwtid: crypto.randomUUID(), // JWT ID - unique identifier
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private setRoleData(
    role: UserRole,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    registerAuthDto: RegisterAuthDto,
  ): RoleData {
    switch (role) {
      case UserRole.ADMIN:
        return { admin: { create: {} } };
      case UserRole.LANDLORD:
        return { landlord: { create: {} } };
      case UserRole.TENANT:
        return { tenant: { create: {} } };
      default:
        return {};
    }
  }
}
