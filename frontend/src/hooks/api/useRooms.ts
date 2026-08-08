import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { RoomsControllerFindAllParams } from '@/generated/model';
import { apiClient, extractData, handleApiError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';
import type {
  ApiResponse,
  CreateRoomRequest,
  Room,
  UpdateRoomRequest,
} from '@/types';

// Room API functions
const roomsApi = {
  findAll: async (query?: RoomsControllerFindAllParams) => {
    const response = await apiClient.get<ApiResponse<Room[]>>('/rooms', {
      params: query,
    });
    const data = extractData(response);

    if (Array.isArray(data)) {
      return data;
    }

    return (data as { data?: Room[] })?.data || data;
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

// Hooks
export function useRooms(query?: RoomsControllerFindAllParams) {
  return useQuery({
    queryKey: queryKeys.rooms.findAll(query),
    queryFn: () => roomsApi.findAll(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRoom(
  id: string,
  options?: Omit<UseQueryOptions<Room>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(id),
    queryFn: () => roomsApi.getById(id),
    ...options,
  });
}

export function useRoomsByBuilding(buildingId: string) {
  return useQuery({
    queryKey: queryKeys.rooms.byBuilding(buildingId),
    queryFn: () => roomsApi.getByBuilding(buildingId),
    enabled: !!buildingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAvailableRooms() {
  return useQuery({
    queryKey: queryKeys.rooms.available(),
    queryFn: roomsApi.getAvailable,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.buildings.detail(data.buildingId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.byBuilding(data.buildingId),
      });
    },
    onError: handleApiError,
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomRequest }) =>
      roomsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.rooms.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.lists() });
      if (data.buildingId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rooms.byBuilding(data.buildingId),
        });
      }
    },
    onError: handleApiError,
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomsApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.rooms.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.lists() });
    },
    onError: handleApiError,
  });
}
