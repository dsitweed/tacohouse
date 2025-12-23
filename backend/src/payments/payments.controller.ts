import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { Payment, UserRole } from '@tacohouse/shared';
import { CurrentUser, Roles } from 'src/common/decorators';
import type { UserWithRelations } from 'src/types';

import { CreatePaymentDto, FindAllPaymentsDto } from './dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  create(
    @CurrentUser() currentUser: UserWithRelations,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.create(currentUser, createPaymentDto);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: UserWithRelations,
    @Query() query: FindAllPaymentsDto,
  ) {
    return this.paymentsService.findAll(currentUser, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: UserWithRelations,
    @Param('id') id: string,
  ): Promise<Payment> {
    return this.paymentsService.findOne(currentUser, id);
  }
}

