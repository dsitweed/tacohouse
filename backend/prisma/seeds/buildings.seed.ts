import { faker } from '@faker-js/faker';
import type { Building, PrismaClient } from '@prisma/client';
import { UserWithRelations } from 'src/types';

export async function seedBuildings(
  prisma: PrismaClient,
  landlords: UserWithRelations[],
): Promise<Building[]> {
  console.log('🏢 Seeding buildings...');

  const buildingsData: Array<{
    name: string;
    address: string;
    description: string;
    billingDate: number;
    landlordId: string;
    electricityRate: number;
    waterRate: number;
    gasRate: number;
    managementFee: number;
    cleaningFeePerPerson: number;
    lightingFee: number;
  }> = [];

  for (const landlord of landlords) {
    if (!landlord || !landlord.landlord) continue;

    const buildings = Array.from({ length: 5 }).map(() => ({
      name: `${faker.word.adjective()} ${faker.word.noun()} House`,
      address: faker.location.streetAddress({ useFullAddress: true }),
      description: faker.lorem.sentences(),
      billingDate: faker.number.int({ min: 15, max: 30 }),
      landlordId: landlord.landlord!.id, // Safe because of check above
      electricityRate: faker.number.int({ min: 3000, max: 4000 }),
      waterRate: faker.number.int({ min: 10000, max: 20000 }),
      gasRate: faker.number.int({ min: 15000, max: 25000 }),
      managementFee: faker.number.int({ min: 80000, max: 150000 }),
      cleaningFeePerPerson: faker.number.int({ min: 30000, max: 70000 }),
      lightingFee: faker.number.int({ min: 20000, max: 40000 }),
    }));

    buildingsData.push(...buildings);
  }

  const buildings = await Promise.all(
    buildingsData.map((data) => prisma.building.create({ data })),
  );

  console.log(`✅ Buildings seeded: ${buildings.length}`);

  return buildings;
}
