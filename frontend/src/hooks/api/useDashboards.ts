import { useQuery } from '@tanstack/react-query';

import {
  DashboardControllerGetRevenueTrendParams,
  RevenueTrendResponseDto,
} from '@/generated/model';
import { apiClient, queryKeys } from '@/libs';

const dashboardsApi = {
  getRevenueTrend: async (query: DashboardControllerGetRevenueTrendParams) => {
    return apiClient.get<RevenueTrendResponseDto[]>(
      '/dashboard/revenue-trend',
      {
        params: query,
      },
    );
  },
};

export function useDashboardRevenueTrend(
  query: DashboardControllerGetRevenueTrendParams,
) {
  return useQuery({
    queryKey: queryKeys.dashboard.revenueTrend(),
    queryFn: () => dashboardsApi.getRevenueTrend(query),
  });
}
