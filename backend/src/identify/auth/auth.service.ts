import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as argon from 'argon2';
import { EmailService } from 'communication/email/email.service';
import { PrismaService } from 'core/prisma/prisma.service';
import { createHash } from 'crypto';
import { User } from 'generated/prisma/client';
import { ACTIVE_USER_WHERE } from 'identify/users/users.constants';

import {
  LoginAuthDto,
  RegisterAuthDto,
  RequestEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto';
import { JwtPayload } from './strategies';
import {
  VerificationIdentifier,
  VerificationIdentifierType,
} from './verification-identifier';

export enum AUTH_TOKEN_TYPE {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken, refreshTokenId } =
      await this.getAuthTokens(payload);

    await this.createSession(user.id, refreshTokenId);

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

    const verification = await this.createVerification(
      VerificationIdentifier.create(
        VerificationIdentifierType.VERIFY,
        newUser.email,
      ),
    );
    // FIXME: Need to implement actual email sending logic for production environment
    const developmentToken = await this.emailService.sendVerificationEmail(
      newUser.email,
      verification.token,
    );

    return { ...newUser, ...(developmentToken ?? {}) };
  }

  async requestEmailVerification(requestEmailDto: RequestEmailDto) {
    const { email } = requestEmailDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    const replyMessage =
      'If the account exists, a verification email has been sent. Please check your inbox';

    if (!user || user.emailVerifiedAt || !user.isActive || user.deletedAt) {
      return {
        message: replyMessage,
      };
    }

    const verification = await this.createVerification(
      VerificationIdentifier.create(VerificationIdentifierType.VERIFY, email),
    );
    const developmentToken = await this.emailService.sendVerificationEmail(
      email,
      verification.token,
    );

    return {
      message: replyMessage,
      ...(developmentToken ?? {}),
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    const verification = await this.consumeVerificationToken(
      token,
      VerificationIdentifierType.VERIFY,
    );
    const { email } = VerificationIdentifier.parse(verification.identifier);

    await this.prisma.user.update({
      where: { email },
      data: { emailVerifiedAt: new Date() },
    });

    return { message: 'Email verified successfully' };
  }

  async requestPasswordReset(requestEmailDto: RequestEmailDto) {
    const { email } = requestEmailDto;

    const replyMessage =
      'If the account exists, a reset email was sent. Please check your inbox.';
    const user = await this.prisma.user.findUnique({
      where: { email, ...ACTIVE_USER_WHERE },
    });

    if (!user) {
      return { message: replyMessage };
    }

    const verification = await this.createVerification(
      VerificationIdentifier.create(VerificationIdentifierType.RESET, email),
    );
    const developmentToken = await this.emailService.sendPasswordResetEmail(
      email,
      verification.token,
    );

    return { message: replyMessage, ...(developmentToken ?? {}) };
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const verification = await this.consumeVerificationToken(
      token,
      VerificationIdentifierType.RESET,
    );
    const { email } = VerificationIdentifier.parse(verification.identifier);
    const hashedPassword = await argon.hash(password);
    const user = await this.prisma.user.findUnique({
      where: { email, ...ACTIVE_USER_WHERE },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid password reset token');
    }

    const account = await this.prisma.account.findUnique({
      where: {
        providerId_accountId: {
          providerId: 'credential',
          accountId: user.id,
        },
      },
    });

    if (!account) {
      throw new UnauthorizedException('Credential account not found');
    }

    await this.prisma.$transaction([
      this.prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword },
      }),
      this.prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async refresh(user: User & { refreshTokenId?: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    if (!user.refreshTokenId) {
      throw new UnauthorizedException('Invalid refresh session');
    }

    await this.revokeSession(user.refreshTokenId);

    const { accessToken, refreshToken, refreshTokenId } =
      await this.getAuthTokens(payload);
    await this.createSession(user.id, refreshTokenId);

    return { accessToken, refreshToken };
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

  async logout(userId: string, refreshTokenId?: string) {
    if (refreshTokenId) {
      await this.revokeSession(refreshTokenId);
      return;
    }

    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async validateJwtUser(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        ...ACTIVE_USER_WHERE,
      },
    });

    return user;
  }

  async validateRefreshSession(userId: string, refreshTokenId: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: refreshTokenId,
        userId,
        expiresAt: { gt: new Date() },
        token: this.hashSessionToken(refreshTokenId),
        user: {
          ...ACTIVE_USER_WHERE,
        },
      },
      include: { user: true },
    });

    return session?.user ? session.user : null;
  }

  private async createSession(userId: string, refreshTokenId: string) {
    const expiresAt = new Date();
    // session expires = refresh token expiration (7 days)
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        id: refreshTokenId,
        userId,
        token: this.hashSessionToken(refreshTokenId),
        expiresAt,
      },
    });
  }

  private async revokeSession(refreshTokenId: string) {
    await this.prisma.session.deleteMany({ where: { id: refreshTokenId } });
  }

  private hashSessionToken(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private async createVerification(identifier: string) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    await this.prisma.verification.deleteMany({ where: { identifier } });
    await this.prisma.verification.create({
      data: {
        identifier,
        value: this.hashSessionToken(token),
        expiresAt,
      },
    });

    return { token };
  }

  // TODO: Implement with Prisma TransactionClient to ensure just delete the verification when it has been successfully consumed
  private async consumeVerificationToken(
    token: string,
    type: VerificationIdentifierType,
  ) {
    const verification = await this.prisma.verification.findFirst({
      where: {
        identifier: { startsWith: VerificationIdentifier.prefix(type) },
        value: this.hashSessionToken(token),
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    await this.prisma.verification.delete({ where: { id: verification.id } });
    return verification;
  }

  private async getAuthTokens(payload: JwtPayload) {
    const refreshTokenId = crypto.randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get(
          'JWT_EXPIRES_IN',
          '15m',
        ) as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(
        { ...payload, type: AUTH_TOKEN_TYPE.REFRESH },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get(
            'JWT_REFRESH_EXPIRES_IN',
            '7d',
          ) as JwtSignOptions['expiresIn'],
          jwtid: refreshTokenId, // JWT ID - unique identifier
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      refreshTokenId,
    };
  }
}
