import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import {
  DashboardControllerGetTenantDashboardParams,
  TenantDashboardResponseDto,
} from '@/generated/model';
import { apiClient, queryKeys } from '@/libs';

const tenantDashboardApi = {
  getDetails: async (
    tenantId: string,
    query?: DashboardControllerGetTenantDashboardParams,
  ): Promise<TenantDashboardResponseDto> => {
    const response = await apiClient.get<TenantDashboardResponseDto>(
      `/dashboard/tenants/${tenantId}`,
      {
        params: query,
      },
    );
    return response.data;
  },
};

export function useTenantDashboard(
  tenantId: string,
  query?: DashboardControllerGetTenantDashboardParams,
  options?: Omit<
    UseQueryOptions<TenantDashboardResponseDto>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: queryKeys.dashboard.tenant(tenantId, query),
    queryFn: () => tenantDashboardApi.getDetails(tenantId, query),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
