import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import {
  CreatePaymentDto,
  Payment,
  PaymentsControllerFindAllParams,
} from '@/generated/model';
import { apiClient, handleApiError, queryKeys } from '@/libs';

// Payment API functions
const paymentsApi = {
  getAll: async (query?: PaymentsControllerFindAllParams) => {
    const response = await apiClient.get<Payment[]>('/payments', {
      params: query,
    });
    const result = response.data;
    return Array.isArray(result)
      ? { data: result, pagination: undefined }
      : result;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  create: async (data: CreatePaymentDto) => {
    const response = await apiClient.post<Payment>('/payments', data);
    return response.data;
  },
};

// Hooks
export function usePayments(query?: PaymentsControllerFindAllParams) {
  return useQuery({
    queryKey: queryKeys.payments.list(query),
    queryFn: () => paymentsApi.getAll(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePayment(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Payment>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id!),
    queryFn: () => paymentsApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function usePaymentsByBill(billId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.payments.byBill(billId!),
    queryFn: () => paymentsApi.getAll({ billId }),
    enabled: !!billId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.byBill(data.billId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bills.detail(data.billId),
      });
    },
    onError: handleApiError,
  });
}
