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
import { Building as BuildingEntity } from 'generated/nestjs-dto';
import { Building, type User, UserRole } from 'generated/prisma/client';

import { BuildingsService } from './buildings.service';
import { FindAllBuildingsDto } from './dto';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@ApiTags('Buildings')
@ApiBearerAuth('JWT-auth')
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Create a new building' })
  @ApiResponse({
    status: 201,
    description: 'Building created successfully',
    type: BuildingEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @CurrentUser() currentUser: User,
    @Body() createBuildingDto: CreateBuildingDto,
  ): Promise<Building> {
    return this.buildingsService.create(currentUser, createBuildingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all buildings' })
  @ApiResponse({
    status: 200,
    description: 'List of buildings',
    type: BuildingEntity,
    isArray: true,
  })
  findAll(
    @CurrentUser() currentUser: User,
    @Query() query: FindAllBuildingsDto,
  ) {
    return this.buildingsService.findAll(currentUser, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a building by ID' })
  @ApiParam({ name: 'id', description: 'Building ID' })
  @ApiResponse({
    status: 200,
    description: 'Building found',
    type: BuildingEntity,
  })
  @ApiResponse({ status: 404, description: 'Building not found' })
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Building> {
    return this.buildingsService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Update a building' })
  @ApiParam({ name: 'id', description: 'Building ID' })
  @ApiResponse({
    status: 200,
    description: 'Building updated successfully',
    type: BuildingEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  update(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    return this.buildingsService.update(currentUser, id, updateBuildingDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Delete a building' })
  @ApiParam({ name: 'id', description: 'Building ID' })
  @ApiResponse({
    status: 200,
    description: 'Building deleted successfully',
    type: BuildingEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  remove(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Building> {
    return this.buildingsService.remove(currentUser, id);
  }
}
