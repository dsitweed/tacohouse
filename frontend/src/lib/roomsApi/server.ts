import { getAvailableRooms, getRoomById } from '@/server/rooms';
import 'server-only';

export const roomsApi = {
  getById: getRoomById,
  getAvailable: getAvailableRooms,
};
