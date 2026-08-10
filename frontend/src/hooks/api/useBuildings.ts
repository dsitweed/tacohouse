import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { apiClient, handleApiError, queryKeys } from '@/libs';
import type {
  Building,
  BuildingListQuery,
  CreateBuildingRequest,
  UpdateBuildingRequest,
} from '@/types';

// Building API functions
const buildingsApi = {
  getAll: async (query?: BuildingListQuery) => {
    const response = await apiClient.get<{
      data: Building[];
      pagination?: unknown;
    }>('/buildings', {
      params: query,
    });
    const result = response.data;

    if (result && typeof result === 'object' && 'data' in result) {
      return result as { data: Building[]; pagination?: unknown };
    }

    return {
      data: Array.isArray(result) ? (result as Building[]) : [],
      pagination: undefined,
    };
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Building>(`/buildings/${id}`);
    return response.data;
  },

  create: async (data: CreateBuildingRequest) => {
    const response = await apiClient.post<Building>('/buildings', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBuildingRequest) => {
    const response = await apiClient.patch<Building>(`/buildings/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<void>(`/buildings/${id}`);
    return response.data;
  },
};

// Hooks
export function useBuildings(query?: BuildingListQuery) {
  return useQuery({
    queryKey: queryKeys.buildings.list(query),
    queryFn: () => buildingsApi.getAll(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBuilding(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Building>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.buildings.detail(id!),
    queryFn: () => buildingsApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.lists() });
    },
    onError: handleApiError,
  });
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBuildingRequest }) =>
      buildingsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.buildings.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.lists() });
    },
    onError: handleApiError,
  });
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: buildingsApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.buildings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.lists() });
    },
    onError: handleApiError,
  });
}
