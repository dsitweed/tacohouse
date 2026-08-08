import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from 'common/decorators';
import { JwtRefreshGuard, LocalAuthGuard } from 'common/guards';
import type { User } from 'generated/prisma/client';

import { AuthService } from './auth.service';
import { LoginAuthDto, RegisterAuthDto } from './dto';

// TODO: Work with redis
@Public()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO: Need update logic save and clear token
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ operationId: 'authLogin', summary: 'User login' })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ operationId: 'authRegister', summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  // TODO: Need update logic save and clear refresh token
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({ operationId: 'authRefresh', summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  create(@CurrentUser() user: User) {
    return this.authService.refresh(user);
  }
}
