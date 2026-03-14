import type { Building } from './BuildingTypes';
import type { EquipmentCondition, RoomStatus } from './EnumsTypes';
import { RoomType } from './EnumsTypes';

export interface Room {
  id: string;
  number: string;
  buildingId: string;
  building?: Building;

  area: number;
  monthlyRent: number;
  deposit: number;
  maxTenants: number;
  roomType: RoomType;
  description?: string | null;
  images: string[];
  status: RoomStatus;
  availableFrom?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface RoomEquipment {
  id: string;
  roomId: string;
  room?: Room;
  name: string;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  installedDate?: string | null;
  warrantyExpiryDate?: string | null;
  condition: EquipmentCondition;
  createdAt: string;
  updatedAt: string;
}

export const RoomTypeLabels: Record<RoomType, string> = {
  [RoomType.FULL_RIGHTS]: 'Phòng nguyên căn',
  [RoomType.PARTIAL_RIGHTS]: 'Phòng khép kín',
};
