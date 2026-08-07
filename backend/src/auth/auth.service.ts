import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import * as argon from 'argon2';
import { User } from 'generated/prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { LoginAuthDto, RegisterAuthDto } from './dto';
import { JwtPayload } from './strategies';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = await this.getAuthTokens(payload);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async register(registerAuthDto: RegisterAuthDto) {
    const { email, password, role, ...userProfileDto } = registerAuthDto;

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
        role,
        profile: {
          create: {
            ...userProfileDto,
          },
        },
      },
    });

    // Create a credential account for password authentication
    await this.prisma.account.create({
      data: {
        userId: newUser.id,
        providerId: 'credential',
        accountId: newUser.id,
        password: hashedPassword,
      },
    });

    return newUser;
  }

  async refresh(user: User) {
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
  }: LoginAuthDto): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        accounts: {
          where: {
            providerId: 'credential',
          },
        },
      },
    });

    if (!user || user.accounts.length !== 1 || !user.accounts[0].password) {
      return null;
    }

    if (await argon.verify(user.accounts[0].password, password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { accounts, ...userData } = user;

      return { ...userData };
    }

    return null;
  }

  async validateJwtUser(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  private async getAuthTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get(
          'JWT_EXPIRES_IN',
          '15m',
        ) as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get(
            'JWT_REFRESH_EXPIRES_IN',
            '7d',
          ) as JwtSignOptions['expiresIn'],
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
