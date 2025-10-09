import {
  Bill,
  MaintenanceRequest,
  Notification,
  NotificationType,
  PrismaClient,
} from '@tacohouse/shared';
import { UserWithRelations } from 'src/types';

type NotificationData = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: Date;
  relatedId?: string;
  relatedType?: string;
};

export async function seedNotifications(
  prisma: PrismaClient,
  users: UserWithRelations[],
  bills: Bill[],
  maintenanceRequests: MaintenanceRequest[],
): Promise<Notification[]> {
  console.log('🔔 Seeding notifications...');

  const tenants = users.filter((user) => user.tenant !== null);

  if (tenants.length === 0) {
    console.log('⚠️  Not enough users to seed notifications');
    return [];
  }

  const notificationsData: NotificationData[] = [];

  // 1. Generate BILL_GENERATED notifications for each bill
  for (const bill of bills) {
    const room = await prisma.room.findUnique({
      where: { id: bill.roomId },
      include: { rentals: { where: { status: 'ACTIVE' } } },
    });

    if (!room || room.rentals.length === 0) continue;

    const rental = room.rentals[0];
    const tenant = tenants.find((t) => t.tenant?.id === rental.tenantId);

    if (!tenant) continue;

    const billingMonth = new Date(bill.billingPeriod).toLocaleDateString(
      'vi-VN',
      {
        month: '2-digit',
        year: 'numeric',
      },
    );

    notificationsData.push({
      userId: tenant.id,
      title: 'Hóa đơn mới',
      message: `Hóa đơn tháng ${billingMonth} đã được tạo. Tổng số tiền: ${bill.totalAmount.toLocaleString()} VND`,
      type: NotificationType.BILL_GENERATED,
      isRead: bill.status === 'PAID' || bill.status === 'LANDLORD_CONFIRMED',
      readAt:
        bill.status === 'PAID' || bill.status === 'LANDLORD_CONFIRMED'
          ? new Date(bill.createdAt)
          : undefined,
      relatedId: bill.id,
      relatedType: 'Bill',
    });
  }

  // 2. Generate PAYMENT_REMINDER notifications for pending/overdue bills
  const unpaidBills = bills.filter(
    (bill) => bill.status === 'PENDING' || bill.status === 'OVERDUE',
  );

  for (const bill of unpaidBills) {
    const room = await prisma.room.findUnique({
      where: { id: bill.roomId },
      include: { rentals: { where: { status: 'ACTIVE' } } },
    });

    if (!room || room.rentals.length === 0) continue;

    const rental = room.rentals[0];
    const tenant = tenants.find((t) => t.tenant?.id === rental.tenantId);

    if (!tenant) continue;

    const billingMonth = new Date(bill.billingPeriod).toLocaleDateString(
      'vi-VN',
      {
        month: '2-digit',
        year: 'numeric',
      },
    );

    const dueDate = new Date(bill.dueDate).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });

    const isOverdue = bill.status === 'OVERDUE';

    notificationsData.push({
      userId: tenant.id,
      title: isOverdue ? 'Hóa đơn quá hạn' : 'Nhắc nhở thanh toán',
      message: isOverdue
        ? `Hóa đơn tháng ${billingMonth} đã quá hạn thanh toán. Vui lòng thanh toán sớm để tránh phát sinh phí.`
        : `Hóa đơn tháng ${billingMonth} sẽ đến hạn vào ngày ${dueDate}. Vui lòng thanh toán đúng hạn.`,
      type: NotificationType.PAYMENT_REMINDER,
      isRead: false,
      relatedId: bill.id,
      relatedType: 'Bill',
    });
  }

  // 3. Generate MAINTENANCE_UPDATE notifications for each maintenance request
  for (const request of maintenanceRequests) {
    const tenant = tenants.find((t) => t.id === request.tenantId);
    if (!tenant) continue;

    const room = await prisma.room.findUnique({
      where: { id: request.roomId },
      include: { building: { include: { landlord: true } } },
    });

    if (!room) continue;

    const landlord = users.find(
      (u) => u.landlord?.id === room.building.landlordId,
    );

    // Notification for tenant about their request
    notificationsData.push({
      userId: tenant.id,
      title: 'Yêu cầu bảo trì được cập nhật',
      message: `Yêu cầu bảo trì "${request.title}" ${
        request.status === 'COMPLETED'
          ? 'đã hoàn thành'
          : request.status === 'IN_PROGRESS'
            ? 'đang được xử lý'
            : request.status === 'CANCELLED'
              ? 'đã bị hủy'
              : 'đang chờ xử lý'
      }`,
      type: NotificationType.MAINTENANCE_UPDATE,
      isRead: request.status === 'COMPLETED' || request.status === 'CANCELLED',
      readAt:
        request.status === 'COMPLETED' || request.status === 'CANCELLED'
          ? request.completedAt || undefined
          : undefined,
      relatedId: request.id,
      relatedType: 'MaintenanceRequest',
    });

    // Notification for landlord about new/pending requests
    if (landlord && request.status === 'PENDING') {
      notificationsData.push({
        userId: landlord.id,
        title: 'Yêu cầu bảo trì mới',
        message: `Có yêu cầu bảo trì mới từ phòng ${room.number} - ${request.title}`,
        type: NotificationType.MAINTENANCE_UPDATE,
        isRead: false,
        relatedId: request.id,
        relatedType: 'MaintenanceRequest',
      });
    }
  }

  // 4. Generate system ANNOUNCEMENT notifications
  const announcementDate = new Date();
  announcementDate.setDate(announcementDate.getDate() + 8); // 8 days from now

  const announcementDateString = announcementDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });

  for (const tenant of tenants.slice(0, Math.min(20, tenants.length))) {
    notificationsData.push({
      userId: tenant.id,
      title: 'Thông báo bảo trì hệ thống',
      message: `Hệ thống sẽ bảo trì vào ngày ${announcementDateString} từ 8h-12h. Vui lòng sắp xếp thời gian phù hợp.`,
      type: NotificationType.ANNOUNCEMENT,
      isRead: false,
    });
  }

  // 5. Generate payment confirmation notifications for landlords
  const confirmedBills = bills.filter(
    (bill) => bill.status === 'TENANT_CONFIRMED' || bill.status === 'PAID',
  );

  for (const bill of confirmedBills) {
    const room = await prisma.room.findUnique({
      where: { id: bill.roomId },
      include: { building: { include: { landlord: true } } },
    });

    if (!room) continue;

    const landlord = users.find(
      (u) => u.landlord?.id === room.building.landlordId,
    );

    if (!landlord) continue;

    const billingMonth = new Date(bill.billingPeriod).toLocaleDateString(
      'vi-VN',
      {
        month: '2-digit',
        year: 'numeric',
      },
    );

    notificationsData.push({
      userId: landlord.id,
      title: 'Xác nhận thanh toán',
      message: `Phòng ${room.number} đã xác nhận thanh toán hóa đơn tháng ${billingMonth}`,
      type: NotificationType.SYSTEM,
      isRead: bill.status === 'PAID',
      readAt: bill.status === 'PAID' ? new Date(bill.updatedAt) : undefined,
      relatedId: bill.id,
      relatedType: 'Bill',
    });
  }

  await prisma.notification.createMany({
    data: notificationsData,
  });

  const notifications = await Promise.all(
    notificationsData.map((data) => prisma.notification.create({ data })),
  );

  console.log(`✅ Notifications seeded: ${notifications.length}`);

  return notifications;
}
