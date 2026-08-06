import { faker } from '@faker-js/faker';
import { PrismaClient, Rental, Room, User } from 'generated/prisma/client';
import { RentalStatus } from 'generated/prisma/enums';
import { RentalCreateManyInput } from 'generated/prisma/models';

const CONTRACT_IMAGES = [
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
  'https://images.unsplash.com/photo-1603796846097-bee99e4a601f',
  'https://images.unsplash.com/photo-1627518788331-b3b7fdaa382f',
  'https://plus.unsplash.com/premium_photo-1661402064910-17871fea6755',
  'https://images.unsplash.com/photo-1646617747547-96b7abce1857',
  'https://images.unsplash.com/photo-1643224781823-5a6ed8e0835c',
  'https://plus.unsplash.com/premium_photo-1661373484357-021a4e6fb0f4',
];

export async function seedRentals(
  prisma: PrismaClient,
  tenants: User[],
  rooms: Room[],
): Promise<Rental[]> {
  console.log('📝 Seeding rentals...');

  if (tenants.length === 0) {
    console.log('⚠️ No tenants found, skipping rentals seed');
    return [];
  }

  // Take up to 80% of rooms for rentals (some rooms should be available)
  const roomsToRent = faker.helpers.arrayElements(
    rooms,
    Math.min(Math.ceil(rooms.length * 0.8), tenants.length),
  );

  const rentalsData: RentalCreateManyInput[] = roomsToRent.map(
    (room, index) => {
      const tenant = tenants[index % tenants.length];

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

      return {
        tenantId: tenant.id,
        roomId: room.id,
        startDate: faker.date.past({ years: 1 }),
        endDate,
        noticeDate,
        monthlyRent: room.monthlyRent,
        depositPaid: Number(room.monthlyRent) * 2,
        status,
        contractImages: faker.helpers.arrayElements(CONTRACT_IMAGES, {
          min: 1,
          max: 2,
        }),
      };
    },
  );

  const rentals = await prisma.rental.createManyAndReturn({
    data: rentalsData,
    skipDuplicates: true,
  });

  console.log(`✅ Rentals seeded: ${rentals.length}`);

  return rentals;
}
