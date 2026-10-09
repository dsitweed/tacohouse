import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { UtilityType } from 'generated/prisma/enums';

/** A meter reading supplied while generating bills for a room. */
export class BillGenerationReadingDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsEnum(UtilityType)
  utilityType: UtilityType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentReading: number;

  /** Derived from the latest reading of the same room + type when omitted. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  previousReading?: number;
}

export class GenerateBillsDto {
  @IsNotEmpty()
  @IsString()
  buildingId: string;

  /** Billing month in `YYYY-MM` format; stored as the first day of that month. */
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'billingPeriod must be in YYYY-MM format',
  })
  billingPeriod: string;

  /**
   * Payment due date. Defaults to the building's `billingDate` in the month
   * following the billing period.
   */
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillGenerationReadingDto)
  readings?: BillGenerationReadingDto[];

  /**
   * When true, an existing bill for the same room + period is replaced instead
   * of being skipped. Defaults to false (idempotent re-runs).
   */
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  overwrite?: boolean;
}
