import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsOptional()
  @IsBoolean()
  tenantConfirmed?: boolean;

  @IsOptional()
  @IsBoolean()
  landlordConfirmed?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proofImages?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
