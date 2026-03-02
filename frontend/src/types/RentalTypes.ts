import type { DateTimeString, DecimalLike } from './PrimitivesTypes';
import type { RentalStatus } from './EnumsTypes';
import type { Room } from './RoomTypes';
import type { Tenant, User } from './UserTypes';

export interface Rental {
  id: string;
  tenantId: string;
  tenant?: Tenant & { user?: User };
  roomId: string;
  room?: Room;
  startDate: DateTimeString;
  endDate?: DateTimeString | null;
  noticeDate?: DateTimeString | null;
  monthlyRent: DecimalLike;
  depositPaid: DecimalLike;
  status: RentalStatus;
  contractImages: string[];
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}
