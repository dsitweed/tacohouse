import { faker } from '@faker-js/faker';
import {
  Bill,
  BillStatus,
  Building,
  PrismaClient,
  Room,
  UtilityRecord,
  UtilityType,
} from 'generated/prisma/client';
import { BillCreateManyInput } from 'generated/prisma/models';

export async function seedBills(
  prisma: PrismaClient,
  utilityRecords: UtilityRecord[],
): Promise<Bill[]> {
  console.log('💰 Seeding bills...');

  if (utilityRecords.length === 0) {
    console.log('⚠️ No utility records found, skipping bills seed');
    return [];
  }

  const utilityRecordGroupByRoomId = new Map<string, UtilityRecord[]>();
  const billsData: BillCreateManyInput[] = [];

  const rooms = await prisma.room.findMany({ include: { building: true } });

  for (const utilityRecord of utilityRecords) {
    const key = `${utilityRecord.roomId}|${utilityRecord.recordDate.getFullYear()}-${utilityRecord.recordDate.getMonth()}`;
    if (!utilityRecordGroupByRoomId.has(key)) {
      utilityRecordGroupByRoomId.set(key, []);
    }

    utilityRecordGroupByRoomId.get(key)?.push(utilityRecord);
  }

  for (const room of rooms) {
    const utilityRecords = utilityRecordGroupByRoomId.get(room.id);
    if (utilityRecords) {
      const extracted = extractUtilityRecords(utilityRecords);
      if (!extracted) continue;

      const { electricityRecord, waterRecord, gasRecord } = extracted;
      const billData = generateBillData(
        room,
        room.building,
        electricityRecord,
        waterRecord,
        gasRecord,
      );

      billsData.push(billData);
    } else {
      const billData = generateBillData(room, room.building);

      billsData.push(billData);
    }
  }

  const bills = await prisma.bill.createManyAndReturn({
    data: billsData,
    skipDuplicates: true,
  });

  console.log(`✅ Bills seeded: ${bills.length} bills`);

  return bills;
}

function extractUtilityRecords(utilityRecords: UtilityRecord[]) {
  const byType = new Map(
    utilityRecords.map((record) => [record.utilityType, record]),
  );

  const electricityRecord = byType.get(UtilityType.ELECTRICITY);
  const waterRecord = byType.get(UtilityType.WATER);
  const gasRecord = byType.get(UtilityType.GAS);

  if (!electricityRecord || !waterRecord || !gasRecord) return null;

  return { electricityRecord, waterRecord, gasRecord };
}

function generateBillData(
  room: Room,
  building: Building,
  electricityRecord?: UtilityRecord,
  waterRecord?: UtilityRecord,
  gasRecord?: UtilityRecord,
): BillCreateManyInput {
  const billingPeriod = new Date(electricityRecord?.recordDate ?? Date.now());
  billingPeriod.setDate(building.billingDate || 1);

  const dueDate = new Date(billingPeriod);
  dueDate.setDate(billingPeriod.getDate() + 10);

  const monthlyRent = Number(room.monthlyRent);
  const managementFee = Number(building.managementFee);
  // FIXME: have to x actual number of people in the room
  const cleaningFee = Number(building.cleaningFeePerPerson) * room.maxTenants;
  const lightingFee = Number(building.lightingFee);

  // 10% chance of having previous debt
  const previousDebt = faker.datatype.boolean({ probability: 0.1 })
    ? faker.number.int({ min: 100000, max: 1000000 })
    : 0;

  const electricityUsage = Number(electricityRecord?.consumption ?? 0);
  const electricityAmount =
    electricityUsage * Number(electricityRecord?.unitRate ?? 0);
  const waterUsage = Number(waterRecord?.consumption ?? 0);
  const waterAmount = waterUsage * Number(waterRecord?.unitRate ?? 0);
  const gasUsage = Number(gasRecord?.consumption ?? 0);
  const gasAmount = gasUsage * Number(gasRecord?.unitRate ?? 0);
  const status = faker.helpers.arrayElement(Object.values(BillStatus));

  const totalAmount =
    monthlyRent +
    electricityAmount +
    waterAmount +
    gasAmount +
    managementFee +
    cleaningFee +
    lightingFee +
    previousDebt;

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
    lightingFee,
    cleaningFee,
    previousDebt,
    totalAmount,
    status,
  };
}
