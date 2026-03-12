import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { apiClient, extractData, handleApiError } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';
import type {
  Payment,
  CreatePaymentRequest,
  PaymentListQuery,
} from '@/types';
import type { ApiResponse } from '@/lib/apiClient';

export type PaymentsListResult = { data: Payment[]; pagination?: unknown };

// Payment API functions
const paymentsApi = {
  getAll: async (query?: PaymentListQuery) => {
    const response = await apiClient.get<ApiResponse<unknown>>('/payments', {
      params: query,
    });
    const result = extractData(response);

    if (result && typeof result === 'object' && 'data' in result) {
      return result as PaymentsListResult;
    }

    return {
      data: Array.isArray(result) ? (result as Payment[]) : [],
      pagination: undefined,
    };
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
  return useQuery<PaymentsListResult>({
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

