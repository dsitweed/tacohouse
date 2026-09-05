import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { Rental } from '@/generated/model';
import { apiClient, handleApiError, queryKeys } from '@/libs';
import type {
  CreateRentalRequest,
  RentalListQuery,
  UpdateRentalRequest,
} from '@/types';

// Rental API functions
const rentalsApi = {
  getAll: async (query?: RentalListQuery) => {
    const response = await apiClient.get<{
      data: Rental[];
      pagination?: any;
    }>('/rentals', {
      params: query,
    });
    const result = response.data;
    // Handle paginated response
    if (result && typeof result === 'object' && 'data' in result) {
      return result as { data: Rental[]; pagination?: any };
    }
    return { data: Array.isArray(result) ? result : [], pagination: undefined };
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Rental>(`/rentals/${id}`);
    return response.data;
  },

  create: async (data: CreateRentalRequest) => {
    const response = await apiClient.post<Rental>('/rentals', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRentalRequest) => {
    const response = await apiClient.patch<Rental>(`/rentals/${id}`, data);
    return response.data;
  },

  terminate: async (id: string) => {
    const response = await apiClient.delete<void>(`/rentals/${id}`);
    return response.data;
  },
};

// Hooks
export function useRentals(query?: RentalListQuery) {
  return useQuery({
    queryKey: queryKeys.rentals.list(query),
    queryFn: () => rentalsApi.getAll(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRental(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Rental>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.rentals.detail(id!),
    queryFn: () => rentalsApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useRentalsByTenant(tenantId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.rentals.byTenant(tenantId!),
    queryFn: () => rentalsApi.getAll({ tenantId }),
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRentalsByRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.rentals.byRoom(roomId!),
    queryFn: () => rentalsApi.getAll({ roomId }),
    enabled: !!roomId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rentalsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.rentals.byTenant(data.tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.rentals.byRoom(data.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.detail(data.roomId),
      });
    },
    onError: handleApiError,
  });
}

export function useUpdateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRentalRequest }) =>
      rentalsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.rentals.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.lists() });
    },
    onError: handleApiError,
  });
}

export function useTerminateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rentalsApi.terminate,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.rentals.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.lists() });
    },
    onError: handleApiError,
  });
}
