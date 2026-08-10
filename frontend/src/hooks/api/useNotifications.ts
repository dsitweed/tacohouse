import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient, handleApiError, queryKeys } from '@/libs';
import type {
  CreateNotificationRequest,
  Notification,
  NotificationListQuery,
} from '@/types';

// Notifications API functions
const notificationsApi = {
  getAll: async (query?: NotificationListQuery) => {
    const response = await apiClient.get<unknown>('/notifications', {
      params: query,
    });
    const result = response.data;

    if (result && typeof result === 'object' && 'data' in result) {
      return result as { data: Notification[]; pagination?: unknown };
    }

    return {
      data: Array.isArray(result) ? (result as Notification[]) : [],
      pagination: undefined,
    };
  },

  getOne: async (id: string) => {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  create: async (data: CreateNotificationRequest) => {
    const response = await apiClient.post<Notification>('/notifications', data);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.patch<Notification>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },
};

// Hooks
export type NotificationsListResult = {
  data: Notification[];
  pagination?: unknown;
};

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
