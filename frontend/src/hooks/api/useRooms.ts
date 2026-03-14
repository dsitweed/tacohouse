import { handleApiError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';
import { roomsApi } from '@/lib/roomsApi/client';
import type { Room, RoomListQuery, UpdateRoomRequest } from '@/types';
import {
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// Hooks
export function useRooms(query?: RoomListQuery) {
  return useQuery({
    queryKey: queryKeys.rooms.list(query),
    queryFn: () => roomsApi.getAll(query),
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
