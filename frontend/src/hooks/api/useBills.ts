import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { apiClient, handleApiError, queryKeys } from '@/libs';
import type {
  Bill,
  BillListQuery,
  ConfirmPaymentRequest,
  CreateBillRequest,
  UpdateBillRequest,
} from '@/types';

// Bill API functions
const billsApi = {
  getAll: async (query?: BillListQuery) => {
    const response = await apiClient.get<{
      data: Bill[];
      pagination?: any;
    }>('/bills', {
      params: query,
    });
    const result = response.data;
    // Handle paginated response
    if (result && typeof result === 'object' && 'data' in result) {
      return result as { data: Bill[]; pagination?: any };
    }
    return { data: Array.isArray(result) ? result : [], pagination: undefined };
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Bill>(`/bills/${id}`);
    return response.data;
  },

  getByRoom: async (roomId: string) => {
    const response = await apiClient.get<Bill[]>(`/rooms/${roomId}/bills`);
    return response.data;
  },

  create: async (data: CreateBillRequest) => {
    const response = await apiClient.post<Bill>('/bills', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBillRequest) => {
    const response = await apiClient.patch<Bill>(`/bills/${id}`, data);
    return response.data;
  },

  confirmPayment: async (id: string, data: ConfirmPaymentRequest) => {
    const response = await apiClient.post<Bill>(`/bills/${id}/confirm`, data);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.delete<void>(`/bills/${id}`);
    return response.data;
  },
};

// Hooks
export function useBills(query?: BillListQuery) {
  return useQuery({
    queryKey: queryKeys.bills.list(query),
    queryFn: () => billsApi.getAll(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBill(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Bill>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.bills.detail(id!),
    queryFn: () => billsApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useBillsByRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bills.byRoom(roomId!),
    queryFn: () => billsApi.getByRoom(roomId!),
    enabled: !!roomId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bills.byRoom(data.roomId),
      });
    },
    onError: handleApiError,
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBillRequest }) =>
      billsApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.bills.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.lists() });
    },
    onError: handleApiError,
  });
}

export function useConfirmBillPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConfirmPaymentRequest }) =>
      billsApi.confirmPayment(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.bills.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.lists() });
    },
    onError: handleApiError,
  });
}

export function useCancelBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billsApi.cancel,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.bills.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.lists() });
    },
    onError: handleApiError,
  });
}
