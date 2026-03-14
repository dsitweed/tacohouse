import { apiClient, extractData } from '@/lib/apiClient';
import type { ApiResponse } from '@/lib/apiClient';
import type {
  CreateRoomRequest,
  Room,
  RoomListQuery,
  UpdateRoomRequest,
} from '@/types';

export const roomsApi = {
  getAll: async (query?: RoomListQuery) => {
    const response = await apiClient.get<ApiResponse<Room[]>>('/rooms', {
      params: query,
    });
    const data = extractData(response);

    if (Array.isArray(data)) {
      return data;
    }

    return (data as any)?.data || data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Room>>(`/rooms/${id}`);
    return extractData(response);
  },

  getByBuilding: async (buildingId: string) => {
    const response = await apiClient.get<ApiResponse<Room[]>>(
      `/buildings/${buildingId}/rooms`,
    );
    return extractData(response);
  },

  getAvailable: async () => {
    const response =
      await apiClient.get<ApiResponse<Room[]>>('/rooms/available');
    return extractData(response);
  },

  create: async (data: CreateRoomRequest) => {
    const response = await apiClient.post<ApiResponse<Room>>('/rooms', data);
    return extractData(response);
  },

  update: async (id: string, data: UpdateRoomRequest) => {
    const response = await apiClient.patch<ApiResponse<Room>>(
      `/rooms/${id}`,
      data,
    );
    return extractData(response);
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/rooms/${id}`);
    return response.data;
  },
};
