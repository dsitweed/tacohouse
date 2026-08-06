import { faker } from '@faker-js/faker';
import {
  Building,
  PrismaClient,
  Room,
  RoomStatus,
  RoomType,
} from 'generated/prisma/client';
import { RoomCreateManyInput } from 'generated/prisma/models';

// Real room images from Unsplash
const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
  'https://images.unsplash.com/photo-1556020685-ae41abfc9365',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0',
];

const ROOM_STATUSES = Object.values(RoomStatus);

const ROOM_TYPES = Object.values(RoomType);

export async function seedRooms(
  prisma: PrismaClient,
  buildings: Building[],
): Promise<Room[]> {
  console.log('🚪 Seeding rooms...');

  let roomCounter = 0;

  const roomData: RoomCreateManyInput[] = buildings.flatMap((building) =>
    // Each building has 3-5 rooms
    Array.from({ length: faker.number.int({ min: 3, max: 5 }) }).map(() => {
      roomCounter++;
      const floor = Math.floor(roomCounter / 10) + 1;
      const roomNum = (roomCounter % 10) + 1;
      const area = faker.number.int({ min: 15, max: 35 });
      const monthlyRent = faker.number.int({ min: 2000000, max: 5000000 });

      // Random number of images (0-3 images per room)
      const numberOfImages = faker.number.int({ min: 0, max: 3 });
      const images = faker.helpers
        .shuffle(ROOM_IMAGES)
        .slice(0, numberOfImages);

      return {
        number: `${floor}0${roomNum}`,
        buildingId: building.id,
        area,
        monthlyRent,
        deposit: monthlyRent * 2, // Deposit is 2x monthly rent
        maxTenants: area > 25 ? 3 : area > 20 ? 2 : 1,
        roomType: faker.helpers.arrayElement(ROOM_TYPES),
        description: faker.lorem.sentence(),
        images,
        status: faker.helpers.arrayElement(ROOM_STATUSES),
        availableFrom: faker.date.between({
          from: '2026-01-01',
          to: '2026-12-31',
        }),
      };
    }),
  );

  const rooms = await prisma.room.createManyAndReturn({
    data: roomData,
    skipDuplicates: true,
  });

  console.log(`✅ Rooms seeded: ${rooms.length}`);

  return rooms;
}
