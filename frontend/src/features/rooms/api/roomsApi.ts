import { Room, RoomsControllerFindAllParams } from '@/generated/model';
import { apiClient } from '@/libs/apiClient';

export const roomsApi = {
  findAll: async (query?: RoomsControllerFindAllParams) => {
    const response = await apiClient.get<Room[]>('/rooms', {
      params: query,
    });

    return response.data;
  },

  findOne: async (id: string) => {
    const response = await apiClient.get<Room>(`/rooms/${id}`);
    return response.data;
  },

  getAvailableRooms: async () => {
    const response = await apiClient.get<Room[]>(`/rooms/available`);
    return response.data;
  },
};
