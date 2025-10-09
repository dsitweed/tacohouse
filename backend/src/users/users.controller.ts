import { Body, Controller, Get, Patch, Post } from '@nestjs/common';

import { CurrentUser } from 'src/common/decorators';
import type { UserWithRelations } from 'src/types';
import { flattenUser } from 'src/utils';

import { UpdatePasswordDto, UpdateUserProfileDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard) // similar
  // @UseGuards(AuthGuard('jwt')) // similar
  @Get('me')
  getCurrentUser(@CurrentUser() user: UserWithRelations) {
    return flattenUser(user);
  }

  @Patch('me')
  update(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.update(currentUser, updateUserProfileDto);
  }

  @Post('me/change-password')
  changePassword(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(currentUser, updatePassword);
  }
}
