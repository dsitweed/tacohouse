import type { DateTimeString, DecimalLike } from './PrimitivesTypes';
import type { UtilityType } from './EnumsTypes';
import type { Room } from './RoomTypes';

export interface UtilityRecord {
  id: string;
  roomId: string;
  room?: Room;
  recordDate: DateTimeString;
  utilityType: UtilityType;
  previousReading: DecimalLike;
  currentReading: DecimalLike;
  consumption: DecimalLike;
  unitRate: DecimalLike;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}
