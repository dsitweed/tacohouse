import { Body, Controller, Get, Patch, Post } from '@nestjs/common';

import { CurrentUser } from 'src/common/decorators';
import type { UserWithProfile } from 'src/types';
import { flattenUser } from 'src/utils';

import { UpdatePasswordDto, UpdateUserProfileDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(JwtAuthGuard) // similar
  // @UseGuards(AuthGuard('jwt')) // similar
  @Get('me')
  getCurrentUser(@CurrentUser() user: UserWithProfile) {
    return flattenUser(user);
  }

  @Patch('me')
  update(
    @CurrentUser() currentUser: UserWithProfile,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userService.update(currentUser, updateUserProfileDto);
  }

  @Post('me/change-password')
  changePassword(
    @CurrentUser() currentUser: UserWithProfile,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(currentUser, updatePassword);
  }
}
