import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

import { seedBills } from './bills.seed';
import { seedBuildings } from './buildings.seed';
import { seedChatGroups } from './chat-groups.seed';
import { seedMaintenanceRequests } from './maintenance-requests.seed';
import { seedNotifications } from './notifications.seed';
import { seedPaymentConfirmations } from './payment-confirmations.seed';
import { seedPayments } from './payments.seed';
import { seedRentals } from './rentals.seed';
import { seedRoomEquipment } from './room-equipment.seed';
import { seedRooms } from './rooms.seed';
import { seedUsers } from './users.seed';
import { seedUtilityRecords } from './utility-records.seed';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  console.log('🌱 Starting seed...');

  try {
    // 1. Seed Users (Admin, Landlords, Tenants)
    const { adminUsers, landlordUsers, tenantUsers } = await seedUsers(prisma);

    // 2. Seed Buildings
    const buildings = await seedBuildings(prisma, landlordUsers);

    // 3. Seed Rooms
    const rooms = await seedRooms(prisma, buildings);

    // 4. Seed Room Equipment
    const roomEquipments = await seedRoomEquipment(prisma, rooms);

    // 5. Seed Rentals
    const rentals = await seedRentals(prisma, tenantUsers, rooms);

    // 6. Seed Utility Records
    const utilityRecords = await seedUtilityRecords(prisma, rooms);

    // 7. Seed Bills
    const bills = await seedBills(prisma, utilityRecords);

    // 8. Seed Payments

    const payments = await seedPayments(prisma, bills);

    // 9. Seed Payment Confirmations

    const paymentConfirmations = await seedPaymentConfirmations(
      prisma,
      payments,
    );

    // 10. Seed Chat Groups
    const { chatGroups, chatGroupMembers, messages } = await seedChatGroups(
      prisma,
      tenantUsers,
      landlordUsers,
      buildings,
    );

    // 11. Seed Maintenance Requests
    const maintenanceRequests = await seedMaintenanceRequests(prisma, rentals);

    // 12. Seed Notifications
    const notifications = await seedNotifications(
      prisma,
      tenantUsers,
      bills,
      maintenanceRequests,
    );

    // Summary
    console.log('\n📊 ===== SEEDING SUMMARY =====');
    console.log(
      `👥 Users: ${adminUsers.length + landlordUsers.length + tenantUsers.length} total`,
    );
    console.log(`   - Admins: ${adminUsers.length}`);
    console.log(`   - Landlords: ${landlordUsers.length}`);
    console.log(`   - Tenants: ${tenantUsers.length}`);
    console.log(`🏢 Buildings: ${buildings.length}`);
    console.log(`🚪 Rooms: ${rooms.length}`);
    console.log(`🛋️  Room Equipment: ${roomEquipments.length}`);
    console.log(`📝 Rentals: ${rentals.length}`);
    console.log(`⚡ Utility Records: ${utilityRecords.length}`);
    console.log(`💰 Bills: ${bills.length}`);
    console.log(`💳 Payments: ${payments.length}`);
    console.log(`✅ Payment Confirmations: ${paymentConfirmations.length}`);
    console.log(`💬 Chat Groups: ${chatGroups.length}`);
    console.log(`👤 Chat Group Members: ${chatGroupMembers.length}`);
    console.log(`📨 Messages: ${messages.length}`);
    console.log(`🔧 Maintenance Requests: ${maintenanceRequests.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    console.log('=============================\n');
    console.log('✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
