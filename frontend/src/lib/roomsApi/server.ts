import 'server-only';

import { getAvailableRooms, getRoomById } from '@/server/rooms';

export const roomsApi = {
  getById: getRoomById,
  getAvailable: getAvailableRooms,
};
