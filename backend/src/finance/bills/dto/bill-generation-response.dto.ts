import { ApiProperty } from '@nestjs/swagger';
import { RoomType, UtilityType } from 'generated/prisma/enums';

export const BILL_GENERATION_ROW_STATUS = [
  'READY',
  'WARNING',
  'SKIPPED',
] as const;
export type BillGenerationRowStatus =
  (typeof BILL_GENERATION_ROW_STATUS)[number];

/**
 * Resolved meter state for a metered room, used by the wizard to pre-fill the
 * opening reading and to show which readings are still missing.
 */
export class BillGenerationMeterDto {
  @ApiProperty({ enum: UtilityType })
  utilityType: UtilityType;

  /** Opening reading, derived from the latest record of the previous period. */
  @ApiProperty()
  previousReading: string;

  /** Closing reading supplied by the caller; null when not entered yet. */
  @ApiProperty({ nullable: true })
  currentReading: string | null;
}

/**
 * One room's computed bill inside a generation run. Amounts are serialized as
 * strings because they are `Decimal` values on the server.
 */
export class BillGenerationRowDto {
  @ApiProperty()
  roomId: string;

  @ApiProperty()
  roomNumber: string;

  @ApiProperty({ nullable: true })
  tenantId: string | null;

  @ApiProperty({ nullable: true })
  tenantName: string | null;

  @ApiProperty({ enum: RoomType })
  roomType: RoomType;

  @ApiProperty({ enum: BILL_GENERATION_ROW_STATUS })
  status: BillGenerationRowStatus;

  @ApiProperty({ type: [String] })
  warnings: string[];

  @ApiProperty({ nullable: true })
  existingBillId: string | null;

  @ApiProperty({ type: [BillGenerationMeterDto] })
  meters: BillGenerationMeterDto[];

  @ApiProperty() monthlyRent: string;
  @ApiProperty() electricityUsage: string;
  @ApiProperty() electricityAmount: string;
  @ApiProperty() waterUsage: string;
  @ApiProperty() waterAmount: string;
  @ApiProperty() gasUsage: string;
  @ApiProperty() gasAmount: string;
  @ApiProperty() managementFee: string;
  @ApiProperty() cleaningFee: string;
  @ApiProperty() lightingFee: string;
  @ApiProperty() previousDebt: string;
  @ApiProperty() totalAmount: string;
}

export class BillGenerationSummaryDto {
  @ApiProperty() totalRooms: number;
  @ApiProperty() ready: number;
  @ApiProperty() warnings: number;
  @ApiProperty() skipped: number;
  @ApiProperty() totalAmount: string;
}

/** Dry-run result: what would be created, without writing anything. */
export class BillGenerationPreviewDto {
  @ApiProperty() buildingId: string;
  @ApiProperty() buildingName: string;
  @ApiProperty() billingPeriod: string;
  @ApiProperty() dueDate: string;
  @ApiProperty({ type: [BillGenerationRowDto] })
  rows: BillGenerationRowDto[];
  @ApiProperty({ type: BillGenerationSummaryDto })
  summary: BillGenerationSummaryDto;
}

export class BillGenerationFailureDto {
  @ApiProperty() roomId: string;
  @ApiProperty() roomNumber: string;
  @ApiProperty() reason: string;
}

export class BillGenerationResultDto {
  @ApiProperty() created: number;
  @ApiProperty() skipped: number;
  @ApiProperty({ type: [BillGenerationFailureDto] })
  failed: BillGenerationFailureDto[];
  @ApiProperty() totalAmount: string;
}
