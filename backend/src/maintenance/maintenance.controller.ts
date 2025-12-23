import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { MaintenanceRequest, UserRole } from '@tacohouse/shared';
import { CurrentUser, Roles } from 'src/common/decorators';
import type { UserWithRelations } from 'src/types';

import {
  CreateMaintenanceDto,
  FindAllMaintenanceDto,
  UpdateMaintenanceDto,
  RespondMaintenanceDto,
} from './dto';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(UserRole.TENANT)
  create(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() createMaintenanceDto: CreateMaintenanceDto,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.create(currentUser, createMaintenanceDto);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: UserWithRelations,
    @Query() query: FindAllMaintenanceDto,
  ) {
    return this.maintenanceService.findAll(currentUser, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  update(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.update(
      currentUser,
      id,
      updateMaintenanceDto,
    );
  }

  @Post(':id/respond')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  respond(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
    @Body() respondDto: RespondMaintenanceDto,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.respond(currentUser, id, respondDto);
  }
}

