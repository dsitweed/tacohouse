import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser, Roles } from 'common/decorators';
import type { Payment, User } from 'generated/prisma/client';
import { UserRole } from 'generated/prisma/enums';

import { CreatePaymentDto, FindAllPaymentsDto } from './dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  create(
    @CurrentUser() currentUser: User,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.create(currentUser, createPaymentDto);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: User,
    @Query() query: FindAllPaymentsDto,
  ) {
    return this.paymentsService.findAll(currentUser, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Payment> {
    return this.paymentsService.findOne(currentUser, id);
  }
}
