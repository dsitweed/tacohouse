import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from 'core/common/decorators';
import {
  JwtAuthGuard,
  JwtRefreshGuard,
  LocalAuthGuard,
} from 'core/common/guards';
import type { CookieOptions, Response } from 'express';
import type { User } from 'generated/prisma/client';

import {
  ACCESS_TOKEN_COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from './auth.constants';
import { AuthService } from './auth.service';
import {
  LoginAuthDto,
  RegisterAuthDto,
  RequestEmailDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto';

// TODO: Work with redis
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO: Need update logic save and clear token
  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {
      accessToken,
      refreshToken,
      user: returnUser,
    } = await this.authService.login(user);

    setAuthCookies(res, accessToken, refreshToken);

    return { user: returnUser };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @Public()
  @Post('verify-email/request')
  requestEmailVerification(@Body() requestEmailDto: RequestEmailDto) {
    return this.authService.requestEmailVerification(requestEmailDto);
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Post('password/forgot')
  requestPasswordReset(@Body() requestEmailDto: RequestEmailDto) {
    return this.authService.requestPasswordReset(requestEmailDto);
  }

  @Public()
  @Post('password/reset')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Public()
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refresh(user);

    setAuthCookies(res, accessToken, refreshToken);

    return { message: 'Token refreshed successfully' };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);
    clearAuthCookies(res);

    return { message: 'Logout successful' };
  }
}

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie('accessToken', accessToken, {
    ...authCookieOptions,
    maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
  });
  res.cookie('refreshToken', refreshToken, {
    ...authCookieOptions,
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}
