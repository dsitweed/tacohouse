import { faker } from '@faker-js/faker';
import { RoomStatus, RoomType } from '@prisma/client';
import type { Building, PrismaClient, Room } from '@prisma/client';

// Real room images from Unsplash
const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
  'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
];

const ROOM_STATUSES = Object.values(RoomStatus);

const ROOM_TYPES = Object.values(RoomType);

export async function seedRooms(
  prisma: PrismaClient,
  buildings: Building[],
): Promise<Room[]> {
  console.log('🚪 Seeding rooms...');

  const roomsData: Array<{
    number: string;
    buildingId: string;
    area: number;
    monthlyRent: number;
    deposit: number;
    maxTenants: number;
    roomType: RoomType;
    description: string;
    images: string[];
    status: RoomStatus;
    availableFrom: Date;
  }> = [];

  let roomCounter = 0;

  for (const building of buildings) {
    // Each building has 3-5 rooms
    const numberOfRooms = faker.number.int({ min: 3, max: 5 });

    for (let i = 0; i < numberOfRooms; i++) {
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

      roomsData.push({
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
          from: '2025-01-01',
          to: '2025-12-31',
        }),
      });
    }
  }

  const rooms = await Promise.all(
    roomsData.map((data) => prisma.room.create({ data })),
  );

  console.log(`✅ Rooms seeded: ${rooms.length}`);

  return rooms;
}
