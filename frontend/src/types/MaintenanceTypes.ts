import type {
  MaintenanceCategory,
  MaintenanceStatus,
  PriorityType,
} from './EnumsTypes';
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
  udpatedAt?: string; // backend Prisma typo compatibility
}
