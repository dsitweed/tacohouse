import type { RentalStatus } from './EnumsTypes';
import type { Room } from './RoomTypes';
import type { Tenant, User } from './UserTypes';

export interface Rental {
  id: string;
  tenantId: string;
  tenant?: Tenant & { user?: User };
  roomId: string;
  room?: Room;
  startDate: string;
  endDate?: string | null;
  noticeDate?: string | null;
  monthlyRent: number;
  depositPaid: number;
  status: RentalStatus;
  contractImages: string[];
  createdAt: string;
  updatedAt: string;
}
