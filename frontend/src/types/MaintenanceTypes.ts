import { BadgeVariantType } from '@/components/ui';
import { MaintenanceStatus } from '@/generated/model';

export const MAINTENANCE_STATUS_MAP: Record<
  MaintenanceStatus,
  {
    label: string;
    variant: BadgeVariantType;
  }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    variant: 'pending',
  },
  IN_PROGRESS: {
    label: 'Đang tiến hành',
    variant: 'default',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    variant: 'successLight',
  },
  CANCELLED: {
    label: 'Đã hủy',
    variant: 'destructive',
  },
};
