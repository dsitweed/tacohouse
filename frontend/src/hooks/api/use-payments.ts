import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { apiClient, extractData, handleApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Payment } from '@tacohouse/shared';
import type {
  CreatePaymentRequest,
  PaymentListQuery,
  ApiResponse,
} from '@/types/api';

// Payment API functions
const paymentsApi = {
  getAll: async (query?: PaymentListQuery) => {
    const response = await apiClient.get<ApiResponse<Payment[]>>('/payments', {
      params: query,
    });
    return extractData(response);
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return extractData(response);
  },

  create: async (data: CreatePaymentRequest) => {
    const response = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return extractData(response);
  },
};

// Hooks
export function usePayments(query?: PaymentListQuery) {
  return useQuery({
    queryKey: queryKeys.payments.list(query),
    queryFn: () => paymentsApi.getAll(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePayment(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Payment>, 'queryKey' | 'queryFn'>
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

