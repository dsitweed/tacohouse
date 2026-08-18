import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import {
  CreateRoomDto,
  Room,
  RoomsControllerFindAllParams,
} from '@/generated/model';
import { apiClient, handleApiError, queryKeys } from '@/libs';
import type { UpdateRoomRequest } from '@/types';

// Room API functions
export const roomsApi = {
  findAll: async (query?: RoomsControllerFindAllParams) => {
    return apiClient.get<Room[]>('/rooms', {
      params: query,
    });
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Room>(`/rooms/${id}`);
    return response.data;
  },

  getByBuilding: async (buildingId: string) => {
    const response = await apiClient.get<Room[]>(
      `/buildings/${buildingId}/rooms`,
    );
    return response.data;
  },

  getAvailable: async () => {
    const response = await apiClient.get<Room[]>('/rooms/available');
    return response.data;
  },

  create: async (data: CreateRoomDto) => {
    const response = await apiClient.post<Room>('/rooms', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRoomRequest) => {
    const response = await apiClient.patch<Room>(`/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<void>(`/rooms/${id}`);
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
