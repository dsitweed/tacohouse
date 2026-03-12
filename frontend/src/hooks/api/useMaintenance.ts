import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { apiClient, extractData, handleApiError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';
import type {
  MaintenanceRequest,
  CreateMaintenanceRequest,
  UpdateMaintenanceRequest,
  MaintenanceListQuery,
  ApiResponse,
} from '@/types';

// Maintenance API functions
const maintenanceApi = {
  getAll: async (query?: MaintenanceListQuery) => {
    const response = await apiClient.get<ApiResponse<{ data: MaintenanceRequest[]; pagination?: any }>>(
      '/maintenance',
      { params: query }
    );
    const result = extractData(response);
    // Handle paginated response
    if (result && typeof result === 'object' && 'data' in result) {
      return result as { data: MaintenanceRequest[]; pagination?: any };
    }
    return { data: Array.isArray(result) ? result : [], pagination: undefined };
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<MaintenanceRequest>>(
      `/maintenance/${id}`
    );
    return extractData(response);
  },

  create: async (data: CreateMaintenanceRequest) => {
    const response = await apiClient.post<ApiResponse<MaintenanceRequest>>(
      '/maintenance',
      data
    );
    return extractData(response);
  },

  update: async (id: string, data: UpdateMaintenanceRequest) => {
    const response = await apiClient.patch<ApiResponse<MaintenanceRequest>>(
      `/maintenance/${id}`,
      data
    );
    return extractData(response);
  },

  respond: async (id: string, response: string) => {
    const apiResponse = await apiClient.post<ApiResponse<MaintenanceRequest>>(
      `/maintenance/${id}/respond`,
      { response }
    );
    return extractData(apiResponse);
  },
};

// Hooks
export function useMaintenanceRequests(query?: MaintenanceListQuery) {
  return useQuery({
    queryKey: queryKeys.maintenance.list(query),
    queryFn: () => maintenanceApi.getAll(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMaintenanceRequest(
  id: string | undefined,
  options?: Omit<UseQueryOptions<MaintenanceRequest>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.maintenance.detail(id!),
    queryFn: () => maintenanceApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useMaintenanceByTenant(tenantId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.maintenance.byTenant(tenantId!),
    queryFn: () => maintenanceApi.getAll({ tenantId }),
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMaintenanceByRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.maintenance.byRoom(roomId!),
    queryFn: () => maintenanceApi.getAll({ roomId }),
    enabled: !!roomId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.lists() });
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
        data
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.lists() });
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
        data
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.lists() });
    },
    onError: handleApiError,
  });
}

