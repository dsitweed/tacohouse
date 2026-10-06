import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from 'core/common/decorators';
import { UtilityRecord as UtilityRecordEntity } from 'generated/nestjs-dto';
import type { User, UtilityRecord } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import {
  BulkCreateUtilityRecordsDto,
  CreateUtilityRecordDto,
  FindAllUtilityRecordsDto,
  FindLatestUtilityRecordsDto,
} from './dto';
import { UtilityRecordsService } from './utility-records.service';

@ApiTags('Utility Records')
@ApiBearerAuth('JWT-auth')
@Controller('utility-records')
export class UtilityRecordsController {
  constructor(private readonly utilityRecordsService: UtilityRecordsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Record a utility meter reading' })
  @ApiResponse({ status: 201, type: UtilityRecordEntity })
  create(
    @CurrentUser() currentUser: User,
    @Body() createUtilityRecordDto: CreateUtilityRecordDto,
  ): Promise<UtilityRecord> {
    return this.utilityRecordsService.create(
      currentUser,
      createUtilityRecordDto,
    );
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({
    summary: 'Record many utility meter readings at once',
    description:
      'Upserts readings for a whole building/period. previousReading and unitRate are derived automatically when omitted.',
  })
  @ApiResponse({ status: 201, type: UtilityRecordEntity, isArray: true })
  createBulk(
    @CurrentUser() currentUser: User,
    @Body() bulkCreateDto: BulkCreateUtilityRecordsDto,
  ): Promise<UtilityRecord[]> {
    return this.utilityRecordsService.createMany(
      currentUser,
      bulkCreateDto.records,
    );
  }

  @Get('latest')
  @ApiOperation({
    summary: 'Get the latest reading per utility type',
    description:
      'Pass `period` (YYYY-MM) to get the readings from before that month, which seed the next billing period.',
  })
  @ApiResponse({ status: 200, type: UtilityRecordEntity, isArray: true })
  findLatest(
    @CurrentUser() currentUser: User,
    @Query() query: FindLatestUtilityRecordsDto,
  ): Promise<UtilityRecord[]> {
    return this.utilityRecordsService.findLatest(currentUser, query);
  }

  @Get()
  @ApiOperation({ summary: 'List utility meter readings' })
  @ApiResponse({ status: 200, type: UtilityRecordEntity, isArray: true })
  findAll(
    @CurrentUser() currentUser: User,
    @Query() query: FindAllUtilityRecordsDto,
  ): Promise<UtilityRecord[]> {
    return this.utilityRecordsService.findAll(currentUser, query);
  }
}
