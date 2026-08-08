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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from 'common/decorators';
import { Rental as RentalEntity } from 'generated/nestjs-dto';
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
  @ApiOperation({ operationId: 'createRental' })
  @ApiResponse({ status: 201, type: RentalEntity })
  create(
    @CurrentUser() currentUser: User,
    @Body() createRentalDto: CreateRentalDto,
  ): Promise<Rental> {
    return this.rentalsService.create(currentUser, createRentalDto);
  }

  @Get()
  @ApiOperation({ operationId: 'getRentals' })
  @ApiResponse({ status: 200, type: RentalEntity, isArray: true })
  findAll(@CurrentUser() currentUser: User, @Query() query: FindAllRentalsDto) {
    return this.rentalsService.findAll(currentUser, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getRental' })
  @ApiResponse({ status: 200, type: RentalEntity })
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Rental> {
    return this.rentalsService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  @ApiOperation({ operationId: 'updateRental' })
  @ApiResponse({ status: 200, type: RentalEntity })
  update(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() updateRentalDto: UpdateRentalDto,
  ): Promise<Rental> {
    return this.rentalsService.update(currentUser, id, updateRentalDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ operationId: 'deleteRental' })
  @ApiResponse({ status: 200, type: RentalEntity })
  remove(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Rental> {
    return this.rentalsService.remove(currentUser, id);
  }
}
