import {
  Bill,
  MaintenanceRequest,
  Notification,
  NotificationType,
  PrismaClient,
  User,
} from 'generated/prisma/client';
import { NotificationCreateManyInput } from 'generated/prisma/models';

export async function seedNotifications(
  prisma: PrismaClient,
  tenants: User[],
  bills: Bill[],
  maintenanceRequests: MaintenanceRequest[],
): Promise<Notification[]> {
  console.log('🔔 Seeding notifications...');

  if (tenants.length === 0) {
    console.log('⚠️  Not enough tenants to seed notifications');
    return [];
  }

  const notificationsData: NotificationCreateManyInput[] = [];

  const billsFull = await prisma.bill.findMany({
    where: {
      id: { in: bills.map((bill) => bill.id) },
    },
    include: {
      room: {
        include: {
          rentals: {
            where: {
              status: 'ACTIVE',
            },
          },
          building: true,
        },
      },
    },
  });

  // 1. Generate BILL_GENERATED notifications for each bill
  for (const bill of billsFull) {
    const firstRental = bill.room.rentals[0];
    if (!firstRental) continue;

    const billingMonth = new Date(bill.billingPeriod).toLocaleDateString(
      'vi-VN',
      {
        month: '2-digit',
        year: 'numeric',
      },
    );

    notificationsData.push({
      userId: firstRental.tenantId,
      title: 'Hóa đơn mới',
      message: `Hóa đơn tháng ${billingMonth} đã được tạo. Tổng số tiền: ${bill.totalAmount.toLocaleString()} VND`,
      type: NotificationType.BILL_GENERATED,
      isRead: bill.status === 'PAID' || bill.status === 'LANDLORD_CONFIRMED',
      readAt:
        bill.status === 'PAID' || bill.status === 'LANDLORD_CONFIRMED'
          ? new Date(bill.createdAt)
          : undefined,
      relatedId: bill.id,
      relatedType: 'BILL',
    });
  }

  // 2. Generate PAYMENT_REMINDER notifications for pending/overdue bills
  const unpaidBills = billsFull.filter(
    (bill) => bill.status === 'PENDING' || bill.status === 'OVERDUE',
  );

  for (const bill of unpaidBills) {
    const firstRental = bill.room.rentals[0];
    if (!firstRental) continue;

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
      userId: firstRental.tenantId,
      title: isOverdue ? 'Hóa đơn quá hạn' : 'Nhắc nhở thanh toán',
      message: isOverdue
        ? `Hóa đơn tháng ${billingMonth} đã quá hạn thanh toán. Vui lòng thanh toán sớm để tránh phát sinh phí.`
        : `Hóa đơn tháng ${billingMonth} sẽ đến hạn vào ngày ${dueDate}. Vui lòng thanh toán đúng hạn.`,
      type: NotificationType.PAYMENT_REMINDER,
      isRead: false,
      relatedId: bill.id,
      relatedType: 'BILL',
    });
  }

  // 3. Generate MAINTENANCE_UPDATE notifications for each maintenance request
  const maintenanceRequestsFull = await prisma.maintenanceRequest.findMany({
    where: { id: { in: maintenanceRequests.map((request) => request.id) } },
    include: {
      room: {
        include: {
          building: true,
        },
      },
    },
  });

  for (const request of maintenanceRequestsFull) {
    // Notification for tenant about their request
    notificationsData.push({
      userId: request.tenantId,
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
      relatedType: 'MAINTENANCE_REQUEST',
    });

    // Notification for landlord about new/pending requests
    if (request.status === 'PENDING') {
      notificationsData.push({
        userId: request.room.building.landlordId,
        title: 'Yêu cầu bảo trì mới',
        message: `Có yêu cầu bảo trì mới từ phòng ${request.room.number} - ${request.title}`,
        type: NotificationType.MAINTENANCE_UPDATE,
        isRead: false,
        relatedId: request.id,
        relatedType: 'MAINTENANCE_REQUEST',
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
  const confirmedBills = billsFull.filter(
    (bill) => bill.status === 'TENANT_CONFIRMED' || bill.status === 'PAID',
  );

  for (const bill of confirmedBills) {
    const billingMonth = new Date(bill.billingPeriod).toLocaleDateString(
      'vi-VN',
      {
        month: '2-digit',
        year: 'numeric',
      },
    );

    notificationsData.push({
      userId: bill.room.building.landlordId,
      title: 'Xác nhận thanh toán',
      message: `Phòng ${bill.room.number} đã xác nhận thanh toán hóa đơn tháng ${billingMonth}`,
      type: NotificationType.SYSTEM,
      isRead: bill.status === 'PAID',
      readAt: bill.status === 'PAID' ? new Date(bill.updatedAt) : undefined,
      relatedId: bill.id,
      relatedType: 'BILL',
    });
  }

  await prisma.notification.createMany({
    data: notificationsData,
  });

  const notifications = await prisma.notification.createManyAndReturn({
    data: notificationsData,
    skipDuplicates: true,
  });

  console.log(`✅ Notifications seeded: ${notifications.length}`);

  return notifications;
}
