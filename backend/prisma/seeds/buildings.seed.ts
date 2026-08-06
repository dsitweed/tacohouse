import { faker } from '@faker-js/faker';
import type { Building, PrismaClient, User } from 'generated/prisma/client';
import { BuildingCreateManyInput } from 'generated/prisma/models';

export async function seedBuildings(
  prisma: PrismaClient,
  landlords: User[],
): Promise<Building[]> {
  console.log('🏢 Seeding buildings...');

  const buildingsData: BuildingCreateManyInput[] = landlords.flatMap(
    (landlord) =>
      Array.from({ length: 5 }).map(() => ({
        name: `${faker.word.adjective()} ${faker.word.noun()} House`,
        address: faker.location.streetAddress({ useFullAddress: true }),
        description: faker.lorem.sentences(),
        billingDate: faker.number.int({ min: 15, max: 30 }),
        landlordId: landlord.id,
        electricityRate: faker.number.int({ min: 3000, max: 4000 }),
        waterRate: faker.number.int({ min: 10000, max: 20000 }),
        gasRate: faker.number.int({ min: 15000, max: 25000 }),
        managementFee: faker.number.int({ min: 80000, max: 150000 }),
        cleaningFeePerPerson: faker.number.int({ min: 30000, max: 70000 }),
        lightingFee: faker.number.int({ min: 20000, max: 40000 }),
      })),
  );

  const buildings = await prisma.building.createManyAndReturn({
    data: buildingsData,
    skipDuplicates: true,
  });

  console.log(`✅ Buildings seeded: ${buildings.length}`);

  return buildings;
}
