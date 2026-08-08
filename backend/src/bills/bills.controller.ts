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
import { Bill as BillEntity } from 'generated/nestjs-dto';
import type { Bill, User } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import { BillsService } from './bills.service';
import {
  ConfirmPaymentDto,
  CreateBillDto,
  FindAllBillsDto,
  UpdateBillDto,
} from './dto';

@ApiTags('Bills')
@ApiBearerAuth('JWT-auth')
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ operationId: 'createBill', summary: 'Create a new bill' })
  @ApiResponse({
    status: 201,
    description: 'Bill created successfully',
    type: BillEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @CurrentUser() currentUser: User,
    @Body() createBillDto: CreateBillDto,
  ): Promise<Bill> {
    return this.billsService.create(currentUser, createBillDto);
  }

  @Get()
  @ApiOperation({ operationId: 'getBills', summary: 'Get all bills' })
  @ApiResponse({
    status: 200,
    description: 'List of bills',
    type: BillEntity,
    isArray: true,
  })
  findAll(@CurrentUser() currentUser: User, @Query() query: FindAllBillsDto) {
    return this.billsService.findAll(currentUser, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getBill', summary: 'Get a bill by ID' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({ status: 200, description: 'Bill found', type: BillEntity })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Bill> {
    return this.billsService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ operationId: 'updateBill', summary: 'Update a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({
    status: 200,
    description: 'Bill updated successfully',
    type: BillEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  update(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() updateBillDto: UpdateBillDto,
  ): Promise<Bill> {
    return this.billsService.update(currentUser, id, updateBillDto);
  }

  @Post(':id/confirm')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  @ApiOperation({
    operationId: 'confirmBillPayment',
    summary: 'Confirm payment for a bill',
  })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully',
    type: BillEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  confirmPayment(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<Bill> {
    return this.billsService.confirmPayment(currentUser, id, confirmPaymentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ operationId: 'deleteBill', summary: 'Delete a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({ status: 200, description: 'Bill deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async remove(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.billsService.remove(currentUser, id);
    return { message: 'Bill deleted successfully' };
  }
}
