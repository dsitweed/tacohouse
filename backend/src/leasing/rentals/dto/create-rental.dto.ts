import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRentalDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositPaid?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contractImages?: string[];
}
