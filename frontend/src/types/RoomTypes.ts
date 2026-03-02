import type { DateTimeString, DecimalLike } from './PrimitivesTypes';
import type { Building } from './BuildingTypes';
import type {
  EquipmentCondition,
  RoomStatus,
  RoomType,
} from './EnumsTypes';

export interface Room {
  id: string;
  number: string;
  buildingId: string;
  building?: Building;

  area: DecimalLike;
  monthlyRent: DecimalLike;
  deposit: DecimalLike;
  maxTenants: number;
  roomType: RoomType;
  description?: string | null;
  images: string[];
  status: RoomStatus;
  availableFrom?: DateTimeString | null;

  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface RoomEquipment {
  id: string;
  roomId: string;
  room?: Room;
  name: string;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  installedDate?: DateTimeString | null;
  warrantyExpiryDate?: DateTimeString | null;
  condition: EquipmentCondition;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}
