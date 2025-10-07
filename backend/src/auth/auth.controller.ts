import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { User } from '@tacohouse/shared';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import type { UserWithProfile } from 'src/types';

import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@CurrentUser() user: UserWithProfile) {
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  register(@Body() registerAuthDto: RegisterAuthDto): Promise<User> {
    return this.authService.register(registerAuthDto);
  }

  @Post('refresh')
  create(@CurrentUser() user: UserWithProfile) {
    return this.authService.refresh(user);
  }
}
