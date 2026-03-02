import type { DateTimeString } from './PrimitivesTypes';
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
  completedAt?: DateTimeString | null;
  completionNote?: string | null;
  createdAt: DateTimeString;
  updatedAt?: DateTimeString;
  udpatedAt?: DateTimeString; // backend Prisma typo compatibility
}
