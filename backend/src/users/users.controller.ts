import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/common/decorators';
import type { UserWithRelations } from 'src/types';
import { flattenUser } from 'src/utils';

import { UpdatePasswordDto, UpdateUserProfileDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard) // similar
  // @UseGuards(AuthGuard('jwt')) // similar
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  getCurrentUser(@CurrentUser() user: UserWithRelations) {
    return flattenUser(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  update(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.update(currentUser, updateUserProfileDto);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  changePassword(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(currentUser, updatePassword);
  }
}
