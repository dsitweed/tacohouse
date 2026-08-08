import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from 'common/decorators';
import { Payment as PaymentEntity } from 'generated/nestjs-dto';
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
  @ApiOperation({ operationId: 'createPayment' })
  @ApiResponse({ status: 201, type: PaymentEntity })
  create(
    @CurrentUser() currentUser: User,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.create(currentUser, createPaymentDto);
  }

  @Get()
  @ApiOperation({ operationId: 'getPayments' })
  @ApiResponse({ status: 200, type: PaymentEntity, isArray: true })
  findAll(
    @CurrentUser() currentUser: User,
    @Query() query: FindAllPaymentsDto,
  ) {
    return this.paymentsService.findAll(currentUser, query);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getPayment' })
  @ApiResponse({ status: 200, type: PaymentEntity })
  findOne(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ): Promise<Payment> {
    return this.paymentsService.findOne(currentUser, id);
  }
}
