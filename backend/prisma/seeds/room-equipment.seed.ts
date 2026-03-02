import { faker } from '@faker-js/faker';
import { EquipmentCondition } from '@prisma/client';
import type { PrismaClient, Room, RoomEquipment } from '@prisma/client';

const EQUIPMENT_TYPES = [
  { name: 'Tủ lạnh', brands: ['Samsung', 'Panasonic', 'Hitachi', 'LG'] },
  { name: 'Máy lạnh', brands: ['Daikin', 'Panasonic', 'Mitsubishi', 'LG'] },
  { name: 'Máy giặt', brands: ['LG', 'Samsung', 'Electrolux', 'Toshiba'] },
  { name: 'Smart TV', brands: ['Samsung', 'LG', 'Sony', 'TCL'] },
  { name: 'Quạt trần', brands: ['Asia', 'Panasonic', 'KDK'] },
  { name: 'Bàn học', brands: ['IKEA', 'Nội thất Hòa Phát'] },
  { name: 'Tủ quần áo', brands: ['IKEA', 'Nội thất Hòa Phát'] },
  { name: 'Giường', brands: ['IKEA', 'Nội thất Hòa Phát'] },
];

const CONDITIONS = Object.values(EquipmentCondition);

export async function seedRoomEquipment(
  prisma: PrismaClient,
  rooms: Room[],
): Promise<RoomEquipment[]> {
  console.log('🛋️ Seeding room equipment...');

  const equipmentData: Array<{
    roomId: string;
    name: string;
    description?: string;
    brand?: string;
    model?: string;
    installedDate?: Date;
    warrantyExpiryDate?: Date;
    condition: EquipmentCondition;
  }> = [];

  // Generate equipment for each room
  for (const room of rooms) {
    // Each room gets 2-5 random equipment items
    const equipmentCount = faker.number.int({ min: 2, max: 5 });
    const selectedEquipmentTypes = faker.helpers.arrayElements(
      EQUIPMENT_TYPES,
      equipmentCount,
    );

    for (const equipmentType of selectedEquipmentTypes) {
      const brand = faker.helpers.arrayElement(equipmentType.brands);
      const installedDate = faker.date.past({ years: 2 });

      equipmentData.push({
        roomId: room.id,
        name: equipmentType.name,
        description: `${equipmentType.name} ${brand} ${faker.number.int({ min: 100, max: 500 })}L`,
        brand,
        model: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
        installedDate,
        warrantyExpiryDate: faker.date.future({
          years: 2,
          refDate: installedDate,
        }),
        condition: faker.helpers.arrayElement(CONDITIONS),
      });
    }
  }

  const equipments = await Promise.all(
    equipmentData.map((data) => prisma.roomEquipment.create({ data })),
  );

  console.log(`✅ Room equipment seeded: ${equipments.length}`);

  return equipments;
}
