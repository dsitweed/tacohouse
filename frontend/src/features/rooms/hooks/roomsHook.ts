import { useQuery } from '@tanstack/react-query';

import { RoomsControllerFindAllParams } from '@/generated/model';
import { queryKeys } from '@/lib/queryKeys';

import { roomsApi } from '../api/roomsApi';

export function useRooms(query?: RoomsControllerFindAllParams) {
  return useQuery({
    queryKey: queryKeys.rooms.findAll(query),
    queryFn: () => roomsApi.findAll(query),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAvailableRooms() {
  return useQuery({
    queryKey: queryKeys.rooms.available(),
    queryFn: roomsApi.getAvailableRooms,
  });
}
