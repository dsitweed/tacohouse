import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { RentalStatus } from '@tacohouse/shared';

export class UpdateRentalDto {
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  noticeDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRent?: number;

  @IsOptional()
  @IsEnum(RentalStatus)
  status?: RentalStatus;
}

