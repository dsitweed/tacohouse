import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { apiClient, handleApiError } from '@/libs/apiClient';
import { queryKeys } from '@/libs/queryKeys';
import type {
  ChatGroup,
  Message,
  MessageListQuery,
  SendMessageRequest,
} from '@/types';

// Chat API functions
const chatApi = {
  getGroups: async () => {
    const response = await apiClient.get<ChatGroup[]>('/chat/groups');
    return response.data;
  },

  getGroup: async (groupId: string) => {
    const response = await apiClient.get<ChatGroup>(`/chat/groups/${groupId}`);
    return response.data;
  },

  getMessages: async (groupId: string, query?: MessageListQuery) => {
    const response = await apiClient.get<Message[]>(
      `/chat/groups/${groupId}/messages`,
      { params: query },
    );
    return response.data;
  },

  sendMessage: async (groupId: string, data: SendMessageRequest) => {
    const response = await apiClient.post<Message>(
      `/chat/groups/${groupId}/messages`,
      data,
    );
    return response.data;
  },

  getDirectMessages: async (userId: string, query?: MessageListQuery) => {
    const response = await apiClient.get<Message[]>(`/chat/direct/${userId}`, {
      params: query,
    });
    return response.data;
  },

  sendDirectMessage: async (userId: string, data: SendMessageRequest) => {
    const response = await apiClient.post<Message>(
      `/chat/direct/${userId}`,
      data,
    );
    return response.data;
  },
};

// Hooks
export function useChatGroups() {
  return useQuery({
    queryKey: queryKeys.chat.groups(),
    queryFn: chatApi.getGroups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useChatGroup(
  groupId: string | undefined,
  options?: Omit<UseQueryOptions<ChatGroup>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.chat.group(groupId!),
    queryFn: () => chatApi.getGroup(groupId!),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useChatMessages(
  groupId: string | undefined,
  query?: MessageListQuery,
) {
  return useQuery({
    queryKey: queryKeys.chat.messages(groupId!),
    queryFn: () => chatApi.getMessages(groupId!, query),
    enabled: !!groupId,
    staleTime: 30 * 1000, // 30 seconds (messages update frequently)
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: SendMessageRequest;
    }) => chatApi.sendMessage(groupId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(variables.groupId),
      });
    },
    onError: handleApiError,
  });
}

export function useDirectMessages(
  userId: string | undefined,
  query?: MessageListQuery,
) {
  return useQuery({
    queryKey: queryKeys.chat.direct(userId!),
    queryFn: () => chatApi.getDirectMessages(userId!, query),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
}

export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: SendMessageRequest;
    }) => chatApi.sendDirectMessage(userId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.direct(variables.userId),
      });
    },
    onError: handleApiError,
  });
}
