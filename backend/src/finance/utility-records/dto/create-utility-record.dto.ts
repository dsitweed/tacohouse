import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { UtilityType } from 'generated/prisma/enums';

export class CreateUtilityRecordDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsEnum(UtilityType)
  utilityType: UtilityType;

  /** Any date inside the billing month; normalized to the first day of that month. */
  @IsDateString()
  recordDate: string;

  /** When omitted, it is derived from the latest reading of the same room + type. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  previousReading?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentReading: number;

  /** When omitted, it is taken from the building rate for this utility type. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitRate?: number;
}
