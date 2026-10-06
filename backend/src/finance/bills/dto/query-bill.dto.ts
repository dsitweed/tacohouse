import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { BillStatus } from 'generated/prisma/enums';

export class FindAllBillsDto {
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  rentalId?: string;

  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'billingPeriod must be in YYYY-MM format',
  })
  billingPeriod?: string;
}
