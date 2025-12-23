import { BillStatus } from '@tacohouse/shared';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

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
}
