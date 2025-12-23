import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient, extractData, handleApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Notification } from '@tacohouse/shared';
import type {
  NotificationListQuery,
  CreateNotificationRequest,
  ApiResponse,
} from '@/types/api';

// Notifications API functions
const notificationsApi = {
  getAll: async (query?: NotificationListQuery) => {
    const response = await apiClient.get<ApiResponse<{
      data: Notification[];
      pagination: any;
    }>>('/notifications', { params: query });
    return extractData(response);
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
export function useNotifications(query?: NotificationListQuery) {
  return useQuery({
    queryKey: queryKeys.notifications.list(query),
    queryFn: () => notificationsApi.getAll(query),
    onError: handleApiError,
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: () => notificationsApi.getOne(id),
    enabled: !!id,
    onError: handleApiError,
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

