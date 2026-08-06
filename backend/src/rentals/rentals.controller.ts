import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser, Roles } from 'common/decorators';
import type { Rental, User } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import { CreateRentalDto, FindAllRentalsDto, UpdateRentalDto } from './dto';
import { RentalsService } from './rentals.service';

@ApiTags('Rentals')
@ApiBearerAuth('JWT-auth')
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  create(
    @CurrentUser() currentUser: User,
    @Body() createRentalDto: CreateRentalDto,
  ): Promise<Rental> {
    return this.rentalsService.create(currentUser, createRentalDto);
  }

  @Get()
  findAll(@CurrentUser() currentUser: User, @Query() query: FindAllRentalsDto) {
    return this.rentalsService.findAll(currentUser, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Rental> {
    return this.rentalsService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  update(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() updateRentalDto: UpdateRentalDto,
  ): Promise<Rental> {
    return this.rentalsService.update(currentUser, id, updateRentalDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Rental> {
    return this.rentalsService.remove(currentUser, id);
  }
}
