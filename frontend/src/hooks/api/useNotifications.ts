import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CreateNotificationDto,
  Notification,
  NotificationsControllerFindAllParams,
} from '@/generated/model';
import { apiClient, handleApiError, queryKeys } from '@/libs';

// Notifications API functions
const notificationsApi = {
  getAll: async (query?: NotificationsControllerFindAllParams) => {
    return apiClient.get<Notification[]>('/notifications', {
      params: query,
    });
  },

  getOne: async (id: string) => {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  create: async (data: CreateNotificationDto) => {
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

export function useNotifications(query?: NotificationsControllerFindAllParams) {
  return useQuery({
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
