import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import {
  Bill,
  BillsControllerFindAllParams,
  ConfirmPaymentDto,
  CreateBillDto,
  UpdateBillDto,
} from '@/generated/model';
import { apiClient, handleApiError, queryKeys } from '@/libs';

// Bill API functions
const billsApi = {
  getAll: async (query?: BillsControllerFindAllParams) => {
    return apiClient.get<Bill[]>('/bills', { params: query });
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Bill>(`/bills/${id}`);
    return response.data;
  },

  getByRoom: async (roomId: string) => {
    const response = await apiClient.get<Bill[]>(`/rooms/${roomId}/bills`);
    return response.data;
  },

  create: async (data: CreateBillDto) => {
    const response = await apiClient.post<Bill>('/bills', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBillDto) => {
    const response = await apiClient.patch<Bill>(`/bills/${id}`, data);
    return response.data;
  },

  confirmPayment: async (id: string, data: ConfirmPaymentDto) => {
    const response = await apiClient.post<Bill>(`/bills/${id}/confirm`, data);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.delete<void>(`/bills/${id}`);
    return response.data;
  },
};

// Hooks
export function useBills(query?: BillsControllerFindAllParams) {
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
    mutationFn: ({ id, data }: { id: string; data: UpdateBillDto }) =>
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
    mutationFn: ({ id, data }: { id: string; data: ConfirmPaymentDto }) =>
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
