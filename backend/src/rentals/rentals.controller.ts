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

import { Rental, UserRole } from '@tacohouse/shared';
import { CurrentUser, Roles } from 'src/common/decorators';
import type { UserWithRelations } from 'src/types';

import { CreateRentalDto, FindAllRentalsDto, UpdateRentalDto } from './dto';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  create(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() createRentalDto: CreateRentalDto,
  ): Promise<Rental> {
    return this.rentalsService.create(currentUser, createRentalDto);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: UserWithRelations,
    @Query() query: FindAllRentalsDto,
  ) {
    return this.rentalsService.findAll(currentUser, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<Rental> {
    return this.rentalsService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  update(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
    @Body() updateRentalDto: UpdateRentalDto,
  ): Promise<Rental> {
    return this.rentalsService.update(currentUser, id, updateRentalDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<Rental> {
    return this.rentalsService.remove(currentUser, id);
  }
}

