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
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CurrentUser, Roles } from 'common/decorators';
import { type User, UserRole } from 'generated/prisma/client';

import {
  CreateDashboardDto,
  GetTenantDashboardQueryDto,
  RevenueTrendQueryDto,
  TenantDashboardResponseDto,
  UpdateDashboardDto,
} from './dashboard.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('revenue-trend')
  getRevenueTrend(
    @CurrentUser() currentUser: User,
    @Query() query: RevenueTrendQueryDto,
  ) {
    return this.dashboardService.revenueTrend(currentUser.id, query);
  }

  @Post()
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.create(createDashboardDto);
  }

  @Get()
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(+id, updateDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardService.remove(+id);
  }

  @Get('tenants/:tenantId')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({
    summary: 'Get tenant dashboard details',
    description:
      'Get comprehensive tenant information including rentals, bills, payments, and maintenance requests',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant user ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant dashboard details retrieved successfully',
    type: TenantDashboardResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  getTenantDashboard(
    @CurrentUser() currentUser: User,
    @Param('tenantId') tenantId: string,
    @Query() query: GetTenantDashboardQueryDto,
  ) {
    return this.dashboardService.getTenantDetails(currentUser, tenantId, query);
  }
}
