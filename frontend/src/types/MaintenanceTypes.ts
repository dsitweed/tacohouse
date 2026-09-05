import { BadgeVariantType } from '@/components/ui';
import { MaintenanceStatus } from '@/generated/model';

export const MAINTENANCE_STATUS_MAP: Record<
  MaintenanceStatus,
  {
    label: string;
    badgeVariant: BadgeVariantType;
  }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    badgeVariant: 'pending',
  },
  IN_PROGRESS: {
    label: 'Đang tiến hành',
    badgeVariant: 'default',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    badgeVariant: 'successLight',
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeVariant: 'destructive',
  },
};
