import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { BillStatus } from 'generated/prisma/enums';

export class UpdateBillDto {
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;
}
