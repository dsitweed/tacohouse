import { faker } from '@faker-js/faker';
import { RentalStatus } from '@prisma/client';
import type { PrismaClient, Rental, Room } from '@prisma/client';
import { UserWithRelations } from 'src/types';

const CONTRACT_IMAGES = [
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
  'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=800',
  'https://images.unsplash.com/photo-1627518788331-b3b7fdaa382f?w=800',
  'https://plus.unsplash.com/premium_photo-1661402064910-17871fea6755?w=800',
  'https://images.unsplash.com/photo-1646617747547-96b7abce1857?w=800',
  'https://images.unsplash.com/photo-1643224781823-5a6ed8e0835c?w=800',
  'https://plus.unsplash.com/premium_photo-1661373484357-021a4e6fb0f4?w=800',
];

export async function seedRentals(
  prisma: PrismaClient,
  users: UserWithRelations[],
  rooms: Room[],
): Promise<Rental[]> {
  console.log('📝 Seeding rentals...');

  // Filter users with tenant role
  const tenants = users.filter((user) => user.tenant !== null);

  if (tenants.length === 0) {
    console.log('⚠️ No tenants found, skipping rentals seed');
    return [];
  }

  const rentalsData: Array<{
    tenantId: string;
    roomId: string;
    startDate: Date;
    endDate?: Date;
    noticeDate?: Date;
    monthlyRent: number;
    depositPaid: number;
    status: RentalStatus;
    contractImages: string[];
  }> = [];

  // Take up to 80% of rooms for rentals (some rooms should be available)
  const roomsToRent = faker.helpers.arrayElements(
    rooms,
    Math.min(Math.ceil(rooms.length * 0.8), tenants.length),
  );

  for (let i = 0; i < roomsToRent.length; i++) {
    const room = roomsToRent[i];
    const tenant = tenants[i % tenants.length]; // Cycle through tenants if more rooms than tenants

    const startDate = faker.date.past({ years: 1 });
    const monthlyRent = Number(room.monthlyRent);
    const depositPaid = monthlyRent * faker.number.int({ min: 1, max: 3 }); // 1-3 months deposit

    // 20% chance of NOTICE_GIVEN status, 10% TERMINATED, rest ACTIVE
    const statusRoll = faker.number.float({ min: 0, max: 1 });
    let status: RentalStatus;
    let endDate: Date | undefined;
    let noticeDate: Date | undefined;

    if (statusRoll < 0.1) {
      status = RentalStatus.TERMINATED;
      endDate = faker.date.past({ years: 0.5, refDate: new Date() });
    } else if (statusRoll < 0.3) {
      status = RentalStatus.NOTICE_GIVEN;
      noticeDate = faker.date.recent({ days: 30 });
      endDate = faker.date.soon({ days: 30 });
    } else {
      status = RentalStatus.ACTIVE;
    }

    rentalsData.push({
      tenantId: tenant.tenant!.id,
      roomId: room.id,
      startDate,
      endDate,
      noticeDate,
      monthlyRent,
      depositPaid,
      status,
      contractImages: faker.helpers.arrayElements(CONTRACT_IMAGES, {
        min: 1,
        max: 2,
      }),
    });
  }

  const rentals = await Promise.all(
    rentalsData.map((data) => prisma.rental.create({ data })),
  );

  console.log(`✅ Rentals seeded: ${rentals.length}`);

  return rentals;
}
