import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { UtilityType } from 'generated/prisma/enums';

export class FindAllUtilityRecordsDto {
  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  buildingId?: string;

  @IsOptional()
  @IsEnum(UtilityType)
  utilityType?: UtilityType;

  /** Month to filter by, in `YYYY-MM` format. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'period must be in YYYY-MM format',
  })
  period?: string;
}

export class FindLatestUtilityRecordsDto {
  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  buildingId?: string;

  /**
   * When provided, returns the latest reading *before* this month (`YYYY-MM`),
   * which is the value used to seed the next billing period.
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'period must be in YYYY-MM format',
  })
  period?: string;
}
