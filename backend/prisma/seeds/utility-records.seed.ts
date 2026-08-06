import { faker } from '@faker-js/faker';
import { PrismaClient, Room, UtilityRecord } from 'generated/prisma/client';
import { RoomType, UtilityType } from 'generated/prisma/enums';
import { UtilityRecordCreateManyInput } from 'generated/prisma/models';

const UTILITY_TYPES = Object.values(UtilityType);

export async function seedUtilityRecords(
  prisma: PrismaClient,
  rooms: Room[],
): Promise<UtilityRecord[]> {
  console.log('⚡ Seeding utility records...');

  const utilityRecordsData: UtilityRecordCreateManyInput[] = [];

  // Only PARTIAL_RIGHTS rooms need utility tracking
  const partialRightsRooms = rooms.filter(
    (room) => room.roomType === RoomType.PARTIAL_RIGHTS,
  );

  if (partialRightsRooms.length === 0) {
    console.log(
      '⚠️ No PARTIAL_RIGHTS rooms found, skipping utility records seed',
    );
    return [];
  }

  // Generate utility records for the last 6 months for each room
  const monthsToGenerate = 6;

  // Base unit rates
  const unitRates = {
    [UtilityType.ELECTRICITY]: faker.number.int({ min: 3000, max: 4000 }),
    [UtilityType.WATER]: faker.number.int({ min: 10000, max: 20000 }),
    [UtilityType.GAS]: faker.number.int({ min: 15000, max: 25000 }),
  };

  // Base consumption per month
  const baseConsumption = {
    [UtilityType.ELECTRICITY]: faker.number.int({ min: 100, max: 200 }), // kWh
    [UtilityType.WATER]: faker.number.int({ min: 3, max: 8 }), // cubic meter
    [UtilityType.GAS]: faker.number.int({ min: 5, max: 15 }), // cubic meter
  };

  for (const room of partialRightsRooms) {
    for (const utilityType of UTILITY_TYPES) {
      // Initialize starting readings
      let previousReading = 0;

      // Set initial reading based on utility type
      switch (utilityType) {
        case UtilityType.ELECTRICITY:
          previousReading = faker.number.int({ min: 1000, max: 5000 });
          break;
        case UtilityType.WATER:
          previousReading = faker.number.int({ min: 50, max: 200 });
          break;
        case UtilityType.GAS:
          previousReading = faker.number.int({ min: 10, max: 50 });
          break;
      }

      // Generate records for each month
      for (let i = monthsToGenerate; i >= 1; i--) {
        const recordDate = new Date();
        recordDate.setMonth(recordDate.getMonth() - i);
        recordDate.setDate(1); // First day of the month

        // Add some variance to consumption (50% - 120% of base)
        const variance = faker.number.float({ min: 0.5, max: 1.2 });
        const consumption = Math.round(baseConsumption[utilityType] * variance);
        const currentReading = previousReading + consumption;

        utilityRecordsData.push({
          roomId: room.id,
          recordDate,
          utilityType,
          previousReading,
          currentReading,
          consumption,
          unitRate: unitRates[utilityType],
        });

        // Update previous reading for next month
        previousReading = currentReading;
      }
    }
  }

  const utilityRecords = await prisma.utilityRecord.createManyAndReturn({
    data: utilityRecordsData,
    skipDuplicates: true,
  });

  console.log(`✅ Utility records seeded: ${utilityRecords.length}`);

  return utilityRecords;
}
