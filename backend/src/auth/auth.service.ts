import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { User } from '@tacohouse/shared';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithProfile } from 'src/types';
import { UserService } from 'src/user/user.service';
import { flattenUser } from 'src/utils';

import { LoginAuthDto, RegisterAuthDto } from './dto';
import { JwtPayload } from './strategies';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(user: UserWithProfile) {
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

  async register(registerAuthDto: RegisterAuthDto): Promise<User> {
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
      },
      include: { profile: true },
    });

    return flattenUser(newUser);
  }

  async refresh(user: UserWithProfile) {
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
  }: LoginAuthDto): Promise<Omit<UserWithProfile, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: { profile: true },
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
  ): Promise<Omit<UserWithProfile, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      include: { profile: true },
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
}
