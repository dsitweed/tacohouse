import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from 'common/decorators';
import type { User } from 'generated/prisma/client';

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
  @ApiOperation({
    operationId: 'getCurrentUser',
    summary: 'Get current user profile',
  })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  @ApiOperation({
    operationId: 'updateProfile',
    summary: 'Update current user profile',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  update(
    @CurrentUser() currentUser: User,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateUserProfile(
      currentUser.id,
      updateUserProfileDto,
    );
  }

  @Post('me/change-password')
  @ApiOperation({
    operationId: 'changePassword',
    summary: 'Change user password',
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  changePassword(
    @CurrentUser() currentUser: User,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(currentUser.id, updatePassword);
  }
}
