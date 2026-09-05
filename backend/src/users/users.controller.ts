import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from 'common/decorators';
import { JwtAuthGuard, RolesGuard } from 'common/guards';
import { User as UserEntity } from 'generated/nestjs-dto';
import { type User, UserRole } from 'generated/prisma/client';

import { UpdatePasswordDto, UpdateUserProfileDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard) // similar
  // @UseGuards(AuthGuard('jwt')) // similar
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: UserEntity,
  })
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: UserEntity,
  })
  getUserById(@CurrentUser() currentUser: User, @Param('id') id: string) {
    return this.usersService.findOne(currentUser, id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserEntity,
  })
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
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  changePassword(
    @CurrentUser() currentUser: User,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(currentUser.id, updatePassword);
  }
}
