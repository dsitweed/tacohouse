import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient, extractData, handleApiError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';
import type {
  Notification,
  NotificationListQuery,
  CreateNotificationRequest,
} from '@/types';
import type { ApiResponse } from '@/lib/apiClient';

// Notifications API functions
const notificationsApi = {
  getAll: async (query?: NotificationListQuery) => {
    const response = await apiClient.get<ApiResponse<unknown>>('/notifications', {
      params: query,
    });
    const result = extractData(response);

    if (result && typeof result === 'object' && 'data' in result) {
      return result as { data: Notification[]; pagination?: unknown };
    }

    return {
      data: Array.isArray(result) ? (result as Notification[]) : [],
      pagination: undefined,
    };
  },

  getOne: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Notification>>(
      `/notifications/${id}`
    );
    return extractData(response);
  },

  create: async (data: CreateNotificationRequest) => {
    const response = await apiClient.post<ApiResponse<Notification>>(
      '/notifications',
      data
    );
    return extractData(response);
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.patch<ApiResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return extractData(response);
  },
};

// Hooks
export type NotificationsListResult = { data: Notification[]; pagination?: unknown };

export function useNotifications(query?: NotificationListQuery) {
  return useQuery<NotificationsListResult>({
    queryKey: queryKeys.notifications.list(query),
    queryFn: () => notificationsApi.getAll(query),
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: () => notificationsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: handleApiError,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: handleApiError,
  });
}

