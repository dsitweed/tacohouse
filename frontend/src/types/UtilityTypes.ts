import type { UtilityType } from './EnumsTypes';
import type { Room } from './RoomTypes';

export interface UtilityRecord {
  id: string;
  roomId: string;
  room?: Room;
  recordDate: string;
  utilityType: UtilityType;
  previousReading: number;
  currentReading: number;
  consumption: number;
  unitRate: number;
  createdAt: string;
  updatedAt: string;
}
