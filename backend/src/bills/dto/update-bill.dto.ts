import { BillStatus } from '@tacohouse/shared';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class UpdateBillDto {
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;
}
