import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles } from 'common/decorators';
import type { MaintenanceRequest, User } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import {
  CreateMaintenanceDto,
  FindAllMaintenanceDto,
  RespondMaintenanceDto,
  UpdateMaintenanceDto,
} from './dto';
import { MaintenanceService } from './maintenance.service';

@ApiTags('Maintenance')
@ApiBearerAuth('JWT-auth')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(UserRole.TENANT)
  @ApiOperation({ operationId: 'createMaintenanceRequest' })
  create(
    @CurrentUser() currentUser: User,
    @Body() createMaintenanceDto: CreateMaintenanceDto,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.create(currentUser, createMaintenanceDto);
  }

  @Get()
  @ApiOperation({ operationId: 'getMaintenanceRequests' })
  findAll(
    @CurrentUser() currentUser: User,
    @Query() query: FindAllMaintenanceDto,
  ) {
    return this.maintenanceService.findAll(currentUser, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getMaintenanceRequest' })
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  @ApiOperation({ operationId: 'updateMaintenanceRequest' })
  update(
    @CurrentUser() currentUser: User,
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
  @ApiOperation({ operationId: 'respondMaintenanceRequest' })
  respond(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() respondDto: RespondMaintenanceDto,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.respond(currentUser, id, respondDto);
  }
}
