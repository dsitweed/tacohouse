import { faker } from '@faker-js/faker';
import { PrismaClient, Room, RoomEquipment } from 'generated/prisma/client';
import { EquipmentCondition } from 'generated/prisma/enums';
import { RoomEquipmentCreateManyInput } from 'generated/prisma/models';

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

  const equipmentData: RoomEquipmentCreateManyInput[] = rooms.flatMap(
    (room) => {
      // Each room gets 2-5 random equipment items
      const equipmentCount = faker.number.int({ min: 2, max: 5 });
      const selectedEquipmentTypes = faker.helpers.arrayElements(
        EQUIPMENT_TYPES,
        equipmentCount,
      );

      return selectedEquipmentTypes.map((equipmentType) => {
        const brand = faker.helpers.arrayElement(equipmentType.brands);
        const installedDate = faker.date.past({ years: 2 });

        return {
          roomId: room.id,
          name: equipmentType.name,
          description: `${equipmentType.name} ${brand} ${faker.number.int({ min: 100, max: 500 })}L`,
          brand,
          model: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
          installedDate: installedDate,
          warrantyExpiryDate: faker.date.future({
            years: 2,
            refDate: installedDate,
          }),
          condition: faker.helpers.arrayElement(CONDITIONS),
        };
      });
    },
  );

  const equipments = await prisma.roomEquipment.createManyAndReturn({
    data: equipmentData,
    skipDuplicates: true,
  });

  console.log(`✅ Room equipment seeded: ${equipments.length}`);

  return equipments;
}
