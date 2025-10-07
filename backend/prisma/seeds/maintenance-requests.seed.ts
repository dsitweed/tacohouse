import { faker } from '@faker-js/faker';
import type {
  MaintenanceRequest,
  PrismaClient,
  Rental,
  Room,
} from '@tacohouse/shared';
import {
  MaintenanceCategory,
  MaintenanceStatus,
  PriorityType,
} from '@tacohouse/shared';
import { UserWithRoles } from 'src/types';

type MaintenanceRequestData = {
  tenantId: string;
  roomId: string;
  title: string;
  description: string;
  priority: PriorityType;
  category: MaintenanceCategory;
  images: string[];
  status: MaintenanceStatus;
  completedAt?: Date;
  completionNote?: string;
};

function getMaintenanceImageUrl(category: MaintenanceCategory): string {
  const urls = {
    [MaintenanceCategory.PLUMBING]:
      'https://plus.unsplash.com/premium_photo-1664301972519-506636f0245d?q=80&w=1196',
    [MaintenanceCategory.ELECTRICAL]:
      'https://images.unsplash.com/photo-1509390673020-a5b2450e33f1?q=80&w=1170',
    [MaintenanceCategory.APPLIANCE]:
      'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?q=80&w=1170',
    [MaintenanceCategory.FURNITURE]:
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4',
    [MaintenanceCategory.CLEANING]:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    [MaintenanceCategory.OTHER]:
      'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
  };

  return urls[category] || urls[MaintenanceCategory.OTHER];
}

const MAINTENANCE_ISSUES = {
  [MaintenanceCategory.PLUMBING]: [
    {
      title: 'Vòi nước rò rỉ',
      description: 'Vòi nước trong nhà vệ sinh bị rò rỉ nhỏ giọt',
      priority: PriorityType.MEDIUM,
    },
    {
      title: 'Bồn cầu bị tắc',
      description: 'Bồn cầu bị tắc, nước không chảy xuống được',
      priority: PriorityType.HIGH,
    },
    {
      title: 'Bồn rửa bát thoát nước chậm',
      description: 'Nước thoát ở bồn rửa bát rất chậm',
      priority: PriorityType.LOW,
    },
  ],
  [MaintenanceCategory.ELECTRICAL]: [
    {
      title: 'Bóng đèn hỏng',
      description: 'Bóng đèn trong phòng ngủ đã hỏng, cần thay mới',
      priority: PriorityType.LOW,
    },
    {
      title: 'Công tắc điện không hoạt động',
      description: 'Công tắc điện phòng khách không bật tắt được',
      priority: PriorityType.MEDIUM,
    },
    {
      title: 'Cầu dao bị nhảy',
      description: 'Cầu dao tự động nhảy khi bật nhiều thiết bị',
      priority: PriorityType.HIGH,
    },
  ],
  [MaintenanceCategory.APPLIANCE]: [
    {
      title: 'Máy lạnh không mát',
      description:
        'Máy lạnh trong phòng không còn làm mát được, có thể cần bảo dưỡng hoặc nạp gas',
      priority: PriorityType.HIGH,
    },
    {
      title: 'Tủ lạnh kêu ồn',
      description: 'Tủ lạnh phát ra tiếng động lạ khi hoạt động',
      priority: PriorityType.MEDIUM,
    },
    {
      title: 'Máy giặt không vắt',
      description: 'Máy giặt giặt bình thường nhưng không vắt khô quần áo',
      priority: PriorityType.MEDIUM,
    },
  ],
  [MaintenanceCategory.FURNITURE]: [
    {
      title: 'Máy lạnh cần bảo dưỡng',
      description: 'Máy lạnh hoạt động bình thường nhưng đã lâu chưa bảo dưỡng',
      priority: PriorityType.MEDIUM,
    },
    {
      title: 'Quạt trần kêu ồn',
      description: 'Quạt trần phát ra tiếng kêu khi quay',
      priority: PriorityType.LOW,
    },
    {
      title: 'Trần nhà bị thấm nước',
      description: 'Trần phòng ngủ có dấu hiệu thấm nước từ trên xuống',
      priority: PriorityType.HIGH,
    },
    {
      title: 'Cửa sổ khó đóng mở',
      description: 'Cửa sổ phòng khách bị kẹt, khó đóng mở',
      priority: PriorityType.MEDIUM,
    },
    {
      title: 'Gạch lát bị nứt',
      description: 'Gạch lát nền phòng tắm bị nứt vài viên',
      priority: PriorityType.LOW,
    },
  ],
  [MaintenanceCategory.CLEANING]: [
    {
      title: 'Dọn dẹp sau sửa chữa',
      description: 'Cần dọn dẹp phòng sau khi thợ sửa chữa',
      priority: PriorityType.LOW,
    },
    {
      title: 'Vệ sinh máy lạnh',
      description: 'Máy lạnh cần được vệ sinh định kỳ',
      priority: PriorityType.MEDIUM,
    },
  ],
  [MaintenanceCategory.OTHER]: [
    {
      title: 'Khóa cửa bị hỏng',
      description: 'Khóa cửa phòng bị kẹt, khó mở',
      priority: PriorityType.HIGH,
    },
    {
      title: 'Rèm cửa cần sửa',
      description: 'Rèm cửa bị tuột ray, cần sửa chữa',
      priority: PriorityType.LOW,
    },
  ],
};

export async function seedMaintenanceRequests(
  prisma: PrismaClient,
  tenants: UserWithRoles[],
  rooms: Room[],
  rentals: Rental[],
): Promise<MaintenanceRequest[]> {
  console.log('🔧 Seeding maintenance requests...');

  if (rentals.length === 0) {
    console.log('⚠️ No rentals found, skipping maintenance requests seed');
    return [];
  }

  const maintenanceRequestData: MaintenanceRequestData[] = [];

  // only create maintenance requests for active rentals
  const activeRentals = rentals.filter((rental) => rental.status === 'ACTIVE');

  for (const rental of activeRentals) {
    const tenantUser = tenants.find((t) => t.tenant?.id === rental.tenantId);
    if (!tenantUser || !tenantUser.tenant) continue;

    const room = rooms.find((r) => r.id === rental.roomId);
    if (!room) continue;

    // each active rental has 0-3 maintenande requests
    const requestCount = faker.number.int({ min: 0, max: 3 });

    for (let i = 0; i < requestCount; i++) {
      const category = faker.helpers.arrayElement(
        Object.values(MaintenanceCategory),
      );

      const issueTemplate = faker.helpers.arrayElement(
        MAINTENANCE_ISSUES[category],
      );

      // Status distribution
      const statusRoll = faker.number.float({ min: 0, max: 1 });
      let status: MaintenanceStatus;
      let completedAt: Date | undefined;
      let completionNote: string | undefined;

      if (statusRoll < 0.3) {
        // 30% COMPLETED
        status = MaintenanceStatus.COMPLETED;
        completedAt = faker.date.recent({ days: 30 });
        completionNote = faker.helpers.arrayElement([
          'Đã sửa xong',
          'Đã thay thế thiết bị mới',
          'Đã bảo dưỡng xong',
          'Đã xử lý vấn đề',
          'Hoàn thành công việc',
        ]);
      } else if (statusRoll < 0.7) {
        // 40% IN_PROGRESS
        status = MaintenanceStatus.IN_PROGRESS;
      } else if (statusRoll < 0.85) {
        // 15% PENDING
        status = MaintenanceStatus.PENDING;
      } else {
        // 15% CANCELLED
        status = MaintenanceStatus.CANCELLED;
        completedAt = faker.date.recent({ days: 30 });
        completionNote = faker.helpers.arrayElement([
          'Người thuê hủy yêu cầu',
          'Không cần sửa chữa nữa',
          'Đã tự xử lý',
        ]);
      }

      const images = Array(getMaintenanceImageUrl(category));

      maintenanceRequestData.push({
        tenantId: tenantUser.tenant.id,
        roomId: room.id,
        title: issueTemplate.title,
        description: issueTemplate.description,
        priority: issueTemplate.priority,
        category,
        images,
        status,
        completedAt,
        completionNote,
      });
    }
  }

  // Create all maintenance requests
  const maintenanceRequests = await Promise.all(
    maintenanceRequestData.map((data) =>
      prisma.maintenanceRequest.create({ data }),
    ),
  );

  console.log(`✅ Maintenance requests seeded: ${maintenanceRequests.length}`);

  return maintenanceRequests;
}
