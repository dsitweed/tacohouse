import { faker } from '@faker-js/faker';
import type {
  Bill,
  Building,
  Payment,
  PaymentConfirmation,
  PrismaClient,
  Rental,
  Room,
} from '@tacohouse/shared';
import {
  BillStatus,
  PaymentMethod,
  PaymentStatus,
  RoomType,
} from '@tacohouse/shared';
import { UserWithRelations } from 'src/types';

type BillData = {
  roomId: string;
  billingPeriod: Date;
  dueDate: Date;
  monthlyRent: number;
  electricityUsage: number;
  electricityAmount: number;
  waterUsage: number;
  waterAmount: number;
  gasUsage: number;
  gasAmount: number;
  managementFee: number;
  cleaningFee: number;
  lightingFee: number;
  previousDebt: number;
  totalAmount: number;
  status: BillStatus;
};

type PaymentData = {
  billId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  bankTransferRef?: string;
  stripePaymentId?: string;
  status: PaymentStatus;
  receiptImage?: string;
};

type PaymentConfirmationData = {
  billId: string;
  tenantId: string;
  tenantConfirmed: boolean;
  tenantConfirmedAt?: Date;
  landlordConfirmed: boolean;
  landlordConfirmedAt?: Date;
  proofImages: string[];
  notes?: string;
};

const PAYMENT_IMAGES = [
  'https://unsplash.com/photos/MYbhN8KaaEc',
  'https://unsplash.com/photos/2FPjlAyMQTA',
  'https://unsplash.com/photos/q-W_WVW-eV0',
  'https://unsplash.com/photos/Dvv8EP8yGlk',
  'https://unsplash.com/photos/1T8x0-e7cWk',
];

export async function seedBills(
  prisma: PrismaClient,
  tenants: UserWithRelations[],
  rooms: Room[],
  rentals: Rental[],
): Promise<{
  bills: Bill[];
  payments: Payment[];
  paymentConfirmations: PaymentConfirmation[];
}> {
  console.log('💰 Seeding bills...');

  if (rentals.length === 0) {
    console.log('⚠️ No rentals found, skipping bills seed');
    return { bills: [], payments: [], paymentConfirmations: [] };
  }

  const billsData: BillData[] = [];

  // Store rental metadata for later use
  type RentalMetadata = {
    rental: Rental;
    room: Room;
    tenant: UserWithRelations;
    building: Building;
  };

  const rentalMetadata: RentalMetadata[] = [];

  // Collect all rental metadata
  for (const rental of rentals) {
    // Only generate bills for active rentals
    if (rental.status !== 'ACTIVE') continue;

    const room = rooms.find((r) => r.id === rental.roomId);
    if (!room) continue;

    const tenant = tenants.find((t) => t.tenant?.id === rental.tenantId);
    if (!tenant || !tenant.tenant) continue;

    // Get building to get utility rates
    const building = await prisma.building.findUnique({
      where: { id: room.buildingId },
    });
    if (!building) continue;

    rentalMetadata.push({ rental, room, tenant, building });
  }

  // Generate all bills data
  const monthsToGenerate = 3;

  for (const { rental, room, building } of rentalMetadata) {
    for (let i = monthsToGenerate; i >= 1; i--) {
      const billData = generateBillData(
        rental,
        room,
        building,
        i,
        monthsToGenerate,
      );
      billsData.push(billData);
    }
  }

  // Create all bills at once
  const bills = await Promise.all(
    billsData.map((data) => prisma.bill.create({ data })),
  );

  // Generate payments data for paid bills
  const paymentsData: PaymentData[] = [];
  const paidBills = bills.filter((bill) => bill.status === BillStatus.PAID);

  for (const bill of paidBills) {
    const billData = billsData.find((bd) => bd.roomId === bill.roomId);
    if (!billData) continue;

    const paymentData = generatePaymentData(
      bill,
      billData.billingPeriod,
      billData.dueDate,
    );
    paymentsData.push(paymentData);
  }

  // Create all payments at once
  const payments = await Promise.all(
    paymentsData.map((data) => prisma.payment.create({ data })),
  );

  // Generate payment confirmations data
  const confirmationsData: PaymentConfirmationData[] = [];

  for (const bill of bills) {
    const shouldCreateConfirmation =
      bill.status === BillStatus.PAID ||
      bill.status === BillStatus.TENANT_CONFIRMED ||
      bill.status === BillStatus.LANDLORD_CONFIRMED;

    if (!shouldCreateConfirmation) continue;

    const billData = billsData.find((bd) => bd.roomId === bill.roomId);
    if (!billData) continue;

    const metadata = rentalMetadata.find((rm) => rm.room.id === bill.roomId);
    if (!metadata || !metadata.tenant.tenant) continue;

    const confirmationData = generatePaymentConfirmationData(
      bill,
      metadata.tenant.tenant.id,
      billData.billingPeriod,
      bill.status === BillStatus.PAID,
    );
    confirmationsData.push(confirmationData);
  }

  // Create all payment confirmations at once
  const paymentConfirmations = await Promise.all(
    confirmationsData.map((data) =>
      prisma.paymentConfirmation.create({ data }),
    ),
  );

  console.log(
    `✅ Bills seeded: ${bills.length} bills, ${payments.length} payments, ${paymentConfirmations.length} confirmations`,
  );

  return { bills, payments, paymentConfirmations };
}

// Generate bill data for a rental
function generateBillData(
  rental: Rental,
  room: Room,
  building: Building,
  monthIndex: number,
  totalMonths: number,
): BillData {
  const billingPeriod = faker.date.recent({
    days: 90,
    refDate: rental.startDate,
  });
  billingPeriod.setMonth(billingPeriod.getMonth() - monthIndex);
  billingPeriod.setDate(building.billingDate || 1);

  const dueDate = new Date(billingPeriod);
  dueDate.setDate(dueDate.getDate() + 10); // Due 10 days after billing date

  const monthlyRent = Number(room.monthlyRent);

  // Initialize bill data
  let electricityUsage = 0;
  let electricityAmount = 0;
  let waterUsage = 0;
  let waterAmount = 0;
  let gasUsage = 0;
  let gasAmount = 0;

  // Only add utilities for PARTIAL_RIGHTS rooms
  if (room.roomType === RoomType.PARTIAL_RIGHTS) {
    electricityUsage = faker.number.int({ min: 100, max: 250 });
    electricityAmount = electricityUsage * Number(building.electricityRate);

    waterUsage = faker.number.int({ min: 3, max: 10 });
    waterAmount = waterUsage * Number(building.waterRate);

    gasUsage = faker.number.int({ min: 5, max: 15 });
    gasAmount = gasUsage * Number(building.gasRate);
  }

  const managementFee = Number(building.managementFee);
  const cleaningFee = Number(building.cleaningFeePerPerson);
  const lightingFee = Number(building.lightingFee);

  // If rental has ended, bill paid
  const isRentalEnded = rental.endDate && billingPeriod > rental.endDate;

  // 10% chance of having previous debt
  const previousDebt = faker.datatype.boolean({ probability: 0.1 })
    ? faker.number.int({ min: 100000, max: 500000 })
    : 0;

  const totalAmount =
    monthlyRent +
    electricityAmount +
    waterAmount +
    gasAmount +
    managementFee +
    cleaningFee +
    lightingFee +
    previousDebt;

  // Determine bill status based on which month
  let status: BillStatus;
  if (isRentalEnded) {
    // Ended rentals should have paid bills
    status = BillStatus.PAID;
  } else if (monthIndex === totalMonths) {
    // Oldest bill - likely paid
    status = faker.helpers.arrayElement([
      BillStatus.PAID,
      BillStatus.PAID,
      BillStatus.PAID,
      BillStatus.LANDLORD_CONFIRMED,
    ]);
  } else if (monthIndex === totalMonths - 1) {
    // Middle bill - various states
    status = faker.helpers.arrayElement([
      BillStatus.PAID,
      BillStatus.TENANT_CONFIRMED,
      BillStatus.LANDLORD_CONFIRMED,
      BillStatus.PENDING,
    ]);
  } else {
    // Most recent bill - likely pending or just confirmed
    status = faker.helpers.arrayElement([
      BillStatus.PENDING,
      BillStatus.PENDING,
      BillStatus.TENANT_CONFIRMED,
      BillStatus.OVERDUE,
    ]);
  }

  return {
    roomId: room.id,
    billingPeriod,
    dueDate,
    monthlyRent,
    electricityUsage,
    electricityAmount,
    waterUsage,
    waterAmount,
    gasUsage,
    gasAmount,
    managementFee,
    cleaningFee,
    lightingFee,
    previousDebt,
    totalAmount,
    status,
  };
}

// Generate payment data for a paid bill
function generatePaymentData(
  bill: Bill,
  billingPeriod: Date,
  dueDate: Date,
): PaymentData {
  const paymentMethod = faker.helpers.arrayElement(
    Object.values(PaymentMethod),
  );

  const paymentDate = faker.date.between({
    from: billingPeriod,
    to: dueDate,
  });

  return {
    billId: bill.id,
    amount: Number(bill.totalAmount),
    paymentMethod,
    paymentDate,
    bankTransferRef:
      paymentMethod === PaymentMethod.BANK_TRANSFER
        ? `TRANSFER-${faker.string.alphanumeric(12).toUpperCase()}`
        : undefined,
    stripePaymentId:
      paymentMethod === PaymentMethod.STRIPE
        ? `pi_${faker.string.alphanumeric(24)}`
        : undefined,
    status: PaymentStatus.COMPLETED,
    receiptImage: faker.helpers.arrayElement(PAYMENT_IMAGES),
  };
}

// Generate payment confirmation data
function generatePaymentConfirmationData(
  bill: Bill,
  tenantId: string,
  billingPeriod: Date,
  isPaid: boolean,
): PaymentConfirmationData {
  const tenantConfirmedAt = faker.date.between({
    from: billingPeriod,
    to: new Date(),
  });

  const isLandlordConfirmed =
    isPaid || bill.status === BillStatus.LANDLORD_CONFIRMED;

  return {
    billId: bill.id,
    tenantId,
    tenantConfirmed: true,
    tenantConfirmedAt,
    landlordConfirmed: isLandlordConfirmed,
    landlordConfirmedAt: isLandlordConfirmed
      ? faker.date.between({
          from: tenantConfirmedAt,
          to: new Date(),
        })
      : undefined,
    proofImages: faker.helpers.arrayElements(PAYMENT_IMAGES, {
      min: 1,
      max: 2,
    }),
    notes:
      !isPaid && faker.datatype.boolean({ probability: 0.3 })
        ? faker.helpers.arrayElement([
            'Đã chuyển khoản',
            'Đã thanh toán qua ngân hàng',
            'Payment completed',
            'Chuyển khoản thành công',
          ])
        : undefined,
  };
}
