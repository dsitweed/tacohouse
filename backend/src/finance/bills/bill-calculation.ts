import { Prisma } from 'generated/prisma/client';
import { RoomType } from 'generated/prisma/enums';

/**
 * Pure, side-effect-free billing math for a single room.
 *
 * Kept free of Prisma/DB access so it can be unit-tested exhaustively: the
 * pricing rules here are the most error-prone part of the billing flow.
 */

/** Anything a `Prisma.Decimal` can be built from. */
export type DecimalInput = string | number | Prisma.Decimal;

export type UtilityReadingInput = {
  previousReading: DecimalInput;
  currentReading: DecimalInput;
};

export type BillRatesInput = {
  electricityRate: DecimalInput;
  waterRate: DecimalInput;
  gasRate: DecimalInput;
  managementFee: DecimalInput;
  cleaningFeePerPerson: DecimalInput;
  lightingFee: DecimalInput;
};

export type BillCalculationInput = {
  roomType: RoomType;
  monthlyRent: DecimalInput;
  /** Defaults to 1 when omitted. */
  numberOfTenants?: number;
  rates: BillRatesInput;
  readings?: {
    electricity?: UtilityReadingInput;
    water?: UtilityReadingInput;
    gas?: UtilityReadingInput;
  };
  previousDebt?: DecimalInput;
};

export type BillCalculationResult = {
  monthlyRent: Prisma.Decimal;
  electricityUsage: Prisma.Decimal;
  electricityAmount: Prisma.Decimal;
  waterUsage: Prisma.Decimal;
  waterAmount: Prisma.Decimal;
  gasUsage: Prisma.Decimal;
  gasAmount: Prisma.Decimal;
  managementFee: Prisma.Decimal;
  cleaningFee: Prisma.Decimal;
  lightingFee: Prisma.Decimal;
  previousDebt: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
};

export class BillCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BillCalculationError';
  }
}

const ZERO = new Prisma.Decimal(0);

/** Money is stored as Decimal(14, 2). */
function toMoney(value: DecimalInput): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(2);
}

/** Usage is stored as Decimal(12, 3). */
function toUsage(value: DecimalInput): Prisma.Decimal {
  return new Prisma.Decimal(value).toDecimalPlaces(3);
}

function calculateUtility(
  readings: UtilityReadingInput | undefined,
  unitRate: DecimalInput,
  label: string,
): { usage: Prisma.Decimal; amount: Prisma.Decimal } {
  if (!readings) {
    return { usage: ZERO, amount: ZERO };
  }

  const previousReading = new Prisma.Decimal(readings.previousReading);
  const currentReading = new Prisma.Decimal(readings.currentReading);
  const usage = toUsage(currentReading.minus(previousReading));

  if (usage.isNegative()) {
    throw new BillCalculationError(
      `${label} currentReading (${currentReading.toString()}) must be greater than or equal to previousReading (${previousReading.toString()})`,
    );
  }

  return {
    usage,
    amount: toMoney(usage.times(new Prisma.Decimal(unitRate))),
  };
}

/**
 * Computes every charge of a monthly bill.
 *
 * Pricing rules:
 * - `FULL_RIGHTS` rooms are all-inclusive: utilities are never charged, even
 *   when meter readings are supplied.
 * - `PARTIAL_RIGHTS` rooms are charged for metered consumption.
 * - `cleaningFee` is charged per person (`cleaningFeePerPerson × numberOfTenants`).
 * - `previousDebt` is carried over from unpaid bills of earlier periods.
 */
export function calculateBillForRoom(
  input: BillCalculationInput,
): BillCalculationResult {
  const { rates } = input;

  const monthlyRent = toMoney(input.monthlyRent);
  const managementFee = toMoney(rates.managementFee);
  const lightingFee = toMoney(rates.lightingFee);
  const previousDebt = toMoney(input.previousDebt ?? 0);

  const numberOfTenants = Math.max(1, Math.trunc(input.numberOfTenants ?? 1));
  const cleaningFee = toMoney(
    new Prisma.Decimal(rates.cleaningFeePerPerson).times(numberOfTenants),
  );

  const chargesUtilities = input.roomType === RoomType.PARTIAL_RIGHTS;
  const electricity = chargesUtilities
    ? calculateUtility(
        input.readings?.electricity,
        rates.electricityRate,
        'electricity',
      )
    : { usage: ZERO, amount: ZERO };
  const water = chargesUtilities
    ? calculateUtility(input.readings?.water, rates.waterRate, 'water')
    : { usage: ZERO, amount: ZERO };
  const gas = chargesUtilities
    ? calculateUtility(input.readings?.gas, rates.gasRate, 'gas')
    : { usage: ZERO, amount: ZERO };

  const totalAmount = toMoney(
    monthlyRent
      .plus(electricity.amount)
      .plus(water.amount)
      .plus(gas.amount)
      .plus(managementFee)
      .plus(cleaningFee)
      .plus(lightingFee)
      .plus(previousDebt),
  );

  return {
    monthlyRent,
    electricityUsage: electricity.usage,
    electricityAmount: electricity.amount,
    waterUsage: water.usage,
    waterAmount: water.amount,
    gasUsage: gas.usage,
    gasAmount: gas.amount,
    managementFee,
    cleaningFee,
    lightingFee,
    previousDebt,
    totalAmount,
  };
}
