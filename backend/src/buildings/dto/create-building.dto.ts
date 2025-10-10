import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBuildingDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  billingDate?: number;

  @IsNotEmpty()
  @IsString()
  landlordId: string;

  @IsOptional()
  @IsNumber()
  electricityRate?: number;

  @IsOptional()
  @IsNumber()
  waterRate?: number;

  @IsOptional()
  @IsNumber()
  gasRate?: number;

  @IsOptional()
  @IsNumber()
  managementFee?: number;

  @IsOptional()
  @IsNumber()
  cleaningFeePerPerson?: number;

  @IsOptional()
  @IsNumber()
  lightingFee?: number;
}
