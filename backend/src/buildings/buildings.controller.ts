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

import { Building } from '@tacohouse/shared';
import { CurrentUser } from 'src/common/decorators';
import type { UserWithRelations } from 'src/types';

import { BuildingsService } from './buildings.service';
import { FindAllBuildingsDto } from './dto';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  create(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() createBuildingDto: CreateBuildingDto,
  ): Promise<Building> {
    return this.buildingsService.create(currentUser, createBuildingDto);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: UserWithRelations,
    @Query() query: FindAllBuildingsDto,
  ) {
    return this.buildingsService.findAll(currentUser, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<Building> {
    return this.buildingsService.findOne(currentUser, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingsService.update(+id, updateBuildingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buildingsService.remove(+id);
  }
}
