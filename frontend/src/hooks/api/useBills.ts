import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { DEFAULT_LIMIT_SIZE } from '@/constants/pagination';
import {
  Bill,
  BillsControllerFindAllParams,
  ConfirmPaymentDto,
  CreateBillDto,
  UpdateBillDto,
} from '@/generated/model';
import { apiClient, handleApiError, queryKeys } from '@/libs';

/**
 * The bills endpoint also accepts a `billingPeriod` (YYYY-MM) month filter that
 * is not part of the generated DTO yet. Drop the intersection once
 * `pnpm generate:api` picks it up from the backend swagger.
 */
export type BillsQueryParams = BillsControllerFindAllParams & {
  billingPeriod?: string;
};

const MAX_EXPORT_PAGES = 100;

// Bill API functions
const billsApi = {
  getAll: async (query?: BillsQueryParams) => {
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
export function useBills(query?: BillsQueryParams) {
  return useQuery({
    queryKey: queryKeys.bills.list(query),
    queryFn: () => billsApi.getAll(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetches every bill matching the given filters by walking all pages.
 * Intended for exports, where the caller needs the whole result set rather
 * than a single page.
 */
export async function fetchAllBills(
  query?: Omit<BillsQueryParams, 'page' | 'limit'>,
): Promise<Bill[]> {
  const bills: Bill[] = [];
  let page = 1;
  let hasNext = true;

  // Guard against a runaway loop if the API ever reports a bad pagination state.
  while (hasNext && page <= MAX_EXPORT_PAGES) {
    const response = await billsApi.getAll({
      ...query,
      page,
      limit: DEFAULT_LIMIT_SIZE,
    });
    bills.push(...response.data);
    hasNext = response.pagination?.hasNext ?? false;
    page += 1;
  }

  return bills;
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
