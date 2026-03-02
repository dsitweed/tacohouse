import type { DateTimeString, DecimalLike } from './PrimitivesTypes';
import type { Room } from './RoomTypes';

export interface Building {
  id: string;
  name: string;
  address: string;
  description?: string | null;
  billingDate?: number | null;
  landlordId: string;

  // Derived/aggregated fields that some endpoints may include
  totalRooms?: number;
  _count?: {
    rooms?: number;
  };

  electricityRate: DecimalLike;
  waterRate: DecimalLike;
  gasRate: DecimalLike;
  managementFee: DecimalLike;
  cleaningFeePerPerson: DecimalLike;
  lightingFee: DecimalLike;

  rooms?: Room[];
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}
