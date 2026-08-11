import { useQuery } from '@tanstack/react-query';

import { apiClient, queryKeys } from '@/libs';

// TODO: use generated type form BE instead
type RevenueTrendQueryDto = {
  months: number;
};

type RevenueTrendResponse = {
  month: string;
  total: number;
};

const dashboardsApi = {
  getRevenueTrend: async (query: RevenueTrendQueryDto) => {
    return apiClient.get<RevenueTrendResponse[]>('/dashboard/revenue-trend', {
      params: query,
    });
  },
};

export function useDashboardRevenueTrend(query: RevenueTrendQueryDto) {
  return useQuery({
    queryKey: queryKeys.dashboard.revenueTrend(),
    queryFn: () => dashboardsApi.getRevenueTrend(query),
  });
}
