import { Room, RoomsControllerFindAllParams } from '@/generated/model';
import { apiClient } from '@/lib/apiClient';
import { ApiResponse } from '@/types';

export const roomsApi = {
  findAll: async (query?: RoomsControllerFindAllParams) => {
    const response = await apiClient.get<ApiResponse<Room[]>>('/rooms', {
      params: query,
    });

    return response;
  },

  findOne: async (id: string) => {
    return apiClient.get<ApiResponse<Room>>(`/rooms/${id}`);
  },

  getAvailableRooms: async () => {
    return apiClient.get<ApiResponse<Room>>(`/rooms/available`);
  },
};
