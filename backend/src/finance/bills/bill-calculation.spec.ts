import { RoomType } from 'generated/prisma/enums';

import {
  BillCalculationError,
  type BillCalculationInput,
  calculateBillForRoom,
} from './bill-calculation';

const RATES: BillCalculationInput['rates'] = {
  electricityRate: '3500',
  waterRate: '12000',
  gasRate: '20000',
  managementFee: '150000',
  cleaningFeePerPerson: '50000',
  lightingFee: '30000',
};

function buildInput(
  overrides: Partial<BillCalculationInput> = {},
): BillCalculationInput {
  return {
    roomType: RoomType.PARTIAL_RIGHTS,
    monthlyRent: '3000000',
    numberOfTenants: 2,
    rates: RATES,
    readings: {
      electricity: { previousReading: '1000', currentReading: '1150' },
      water: { previousReading: '100', currentReading: '108' },
      gas: { previousReading: '20', currentReading: '25' },
    },
    previousDebt: '0',
    ...overrides,
  };
}

describe('calculateBillForRoom', () => {
  describe('PARTIAL_RIGHTS', () => {
    it('charges metered utilities (usage × rate)', () => {
      const result = calculateBillForRoom(buildInput());

      expect(result.electricityUsage.toFixed(3)).toBe('150.000');
      expect(result.electricityAmount.toFixed(2)).toBe('525000.00');
      expect(result.waterUsage.toFixed(3)).toBe('8.000');
      expect(result.waterAmount.toFixed(2)).toBe('96000.00');
      expect(result.gasUsage.toFixed(3)).toBe('5.000');
      expect(result.gasAmount.toFixed(2)).toBe('100000.00');
    });

    it('charges the cleaning fee per person', () => {
      const result = calculateBillForRoom(buildInput({ numberOfTenants: 3 }));

      expect(result.cleaningFee.toFixed(2)).toBe('150000.00');
    });

    it('falls back to one tenant when numberOfTenants is missing', () => {
      const result = calculateBillForRoom(
        buildInput({ numberOfTenants: undefined }),
      );

      expect(result.cleaningFee.toFixed(2)).toBe('50000.00');
    });

    it('adds previous debt to the total', () => {
      const result = calculateBillForRoom(
        buildInput({ previousDebt: '250000' }),
      );

      expect(result.previousDebt.toFixed(2)).toBe('250000.00');
      expect(result.totalAmount.toFixed(2)).toBe('4251000.00');
    });

    it('computes the total as the sum of every charge', () => {
      const result = calculateBillForRoom(buildInput());

      // 3,000,000 + 525,000 + 96,000 + 100,000 + 150,000 + 100,000 + 30,000
      expect(result.totalAmount.toFixed(2)).toBe('4001000.00');
    });

    it('treats missing readings as zero usage', () => {
      const result = calculateBillForRoom(buildInput({ readings: undefined }));

      expect(result.electricityUsage.toFixed(3)).toBe('0.000');
      expect(result.electricityAmount.toFixed(2)).toBe('0.00');
      expect(result.waterAmount.toFixed(2)).toBe('0.00');
      expect(result.gasAmount.toFixed(2)).toBe('0.00');
    });

    it('throws when the current reading is lower than the previous one', () => {
      expect(() =>
        calculateBillForRoom(
          buildInput({
            readings: {
              electricity: { previousReading: '1500', currentReading: '1200' },
            },
          }),
        ),
      ).toThrow(BillCalculationError);
    });
  });

  describe('FULL_RIGHTS', () => {
    it('never charges utilities, even when readings are provided', () => {
      const result = calculateBillForRoom(
        buildInput({ roomType: RoomType.FULL_RIGHTS }),
      );

      expect(result.electricityUsage.toFixed(3)).toBe('0.000');
      expect(result.electricityAmount.toFixed(2)).toBe('0.00');
      expect(result.waterAmount.toFixed(2)).toBe('0.00');
      expect(result.gasAmount.toFixed(2)).toBe('0.00');
      // rent + management + cleaning + lighting only
      expect(result.totalAmount.toFixed(2)).toBe('3280000.00');
    });

    it('still charges fixed fees and previous debt', () => {
      const result = calculateBillForRoom(
        buildInput({
          roomType: RoomType.FULL_RIGHTS,
          numberOfTenants: 4,
          previousDebt: '100000',
        }),
      );

      expect(result.managementFee.toFixed(2)).toBe('150000.00');
      expect(result.cleaningFee.toFixed(2)).toBe('200000.00');
      expect(result.lightingFee.toFixed(2)).toBe('30000.00');
      expect(result.previousDebt.toFixed(2)).toBe('100000.00');
      expect(result.totalAmount.toFixed(2)).toBe('3480000.00');
    });
  });

  describe('rounding', () => {
    it('rounds money to 2 decimals and usage to 3', () => {
      const result = calculateBillForRoom(
        buildInput({
          monthlyRent: '3000000.005',
          readings: {
            electricity: {
              previousReading: '1000.0005',
              currentReading: '1150.12345',
            },
          },
        }),
      );

      expect(result.monthlyRent.toFixed(2)).toBe('3000000.01');
      expect(result.electricityUsage.toFixed(3)).toBe('150.123');
      expect(result.electricityAmount.toFixed(2)).toBe('525430.50');
    });
  });
});
