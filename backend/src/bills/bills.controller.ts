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

import { Bill, UserRole } from '@tacohouse/shared';
import { CurrentUser, Roles } from 'src/common/decorators';
import type { UserWithRelations } from 'src/types';

import { BillsService } from './bills.service';
import {
  ConfirmPaymentDto,
  CreateBillDto,
  FindAllBillsDto,
  UpdateBillDto,
} from './dto';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() createBillDto: CreateBillDto,
  ): Promise<Bill> {
    return this.billsService.create(currentUser, createBillDto);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: UserWithRelations,
    @Query() query: FindAllBillsDto,
  ) {
    return this.billsService.findAll(currentUser, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<Bill> {
    return this.billsService.findOne(currentUser, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
    @Body() updateBillDto: UpdateBillDto,
  ): Promise<Bill> {
    return this.billsService.update(currentUser, id, updateBillDto);
  }

  @Post(':id/confirm')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  confirmPayment(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<Bill> {
    return this.billsService.confirmPayment(currentUser, id, confirmPaymentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async remove(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.billsService.remove(currentUser, id);
    return { message: 'Bill deleted successfully' };
  }
}
