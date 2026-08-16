import { VariantProps } from 'class-variance-authority';

import { badgeVariants } from '@/components/ui';
import { MaintenanceStatus } from '@/generated/model';

import type { MaintenanceCategory, PriorityType } from './EnumsTypes';
import type { Room } from './RoomTypes';
import type { Tenant, User } from './UserTypes';

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenant?: Tenant & { user?: User };
  roomId: string;
  room?: Room;
  title: string;
  description: string;
  priority: PriorityType;
  category: MaintenanceCategory;
  images: string[];
  status: MaintenanceStatus;
  completedAt?: string | null;
  completionNote?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export const MAINTENANCE_STATUS_MAP: Record<
  MaintenanceStatus,
  {
    label: string;
    variant: VariantProps<typeof badgeVariants>['variant'];
  }
> = {
  [MaintenanceStatus.PENDING]: {
    label: 'Chờ xử lý',
    variant: 'pending',
  },
  [MaintenanceStatus.IN_PROGRESS]: {
    label: 'Đang tiến hành',
    variant: 'default',
  },
  [MaintenanceStatus.COMPLETED]: {
    label: 'Hoàn thành',
    variant: 'successLight',
  },
  [MaintenanceStatus.CANCELLED]: {
    label: 'Đã hủy',
    variant: 'destructive',
  },
};
