import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBillDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsDateString()
  billingPeriod: string;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  waterUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  waterAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gasUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gasAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  managementFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cleaningFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lightingFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  previousDebt?: number;
}
