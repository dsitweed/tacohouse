import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '@tacohouse/shared';

export class FindAllPaymentsDto {
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  billId?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

