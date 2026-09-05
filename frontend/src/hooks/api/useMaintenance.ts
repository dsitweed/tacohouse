import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import {
  MaintenanceControllerFindAllParams,
  MaintenanceRequest,
} from '@/generated/model';
import { apiClient, handleApiError, queryKeys } from '@/libs';
import type {
  CreateMaintenanceRequest,
  MaintenanceListQuery,
  UpdateMaintenanceRequest,
} from '@/types';

// Maintenance API functions
const maintenanceApi = {
  getAll: async (query?: MaintenanceListQuery) => {
    const response = await apiClient.get<{
      data: MaintenanceRequest[];
      pagination?: any;
    }>('/maintenance', { params: query });
    const result = response.data;
    // Handle paginated response
    if (result && typeof result === 'object' && 'data' in result) {
      return result as { data: MaintenanceRequest[]; pagination?: any };
    }
    return { data: Array.isArray(result) ? result : [], pagination: undefined };
  },

  getById: async (id: string) => {
    const response = await apiClient.get<MaintenanceRequest>(
      `/maintenance/${id}`,
    );
    return response.data;
  },

  create: async (data: CreateMaintenanceRequest) => {
    const response = await apiClient.post<MaintenanceRequest>(
      '/maintenance',
      data,
    );
    return response.data;
  },

  update: async (id: string, data: UpdateMaintenanceRequest) => {
    const response = await apiClient.patch<MaintenanceRequest>(
      `/maintenance/${id}`,
      data,
    );
    return response.data;
  },

  respond: async (id: string, response: string) => {
    const apiResponse = await apiClient.post<MaintenanceRequest>(
      `/maintenance/${id}/respond`,
      { response },
    );
    return apiResponse.data;
  },
};

// Hooks
export function useMaintenanceRequests(
  query?: MaintenanceControllerFindAllParams,
) {
  return useQuery({
    queryKey: queryKeys.maintenance.list(query),
    queryFn: () => maintenanceApi.getAll(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMaintenanceRequest(
  id: string | undefined,
  options?: Omit<UseQueryOptions<MaintenanceRequest>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.maintenance.detail(id!),
    queryFn: () => maintenanceApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenance.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenance.byTenant(data.tenantId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenance.byRoom(data.roomId),
      });
    },
    onError: handleApiError,
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMaintenanceRequest;
    }) => maintenanceApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.maintenance.detail(variables.id),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenance.lists(),
      });
    },
    onError: handleApiError,
  });
}

export function useRespondToMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      maintenanceApi.respond(id, response),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.maintenance.detail(variables.id),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenance.lists(),
      });
    },
    onError: handleApiError,
  });
}
