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

  electricityRate: number;
  waterRate: number;
  gasRate: number;
  managementFee: number;
  cleaningFeePerPerson: number;
  lightingFee: number;

  rooms?: Room[];
  createdAt: string;
  updatedAt: string;
}
