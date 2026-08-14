import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

import { ApiError, ApiResponse } from '@/types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_ORIGIN}${process.env.NEXT_PUBLIC_API_PREFIX}`;

// Unwrap AxiosInstance to return ApiResponse<T> instead of AxiosResponse<ApiResponse<T>> for all methods
type UnwrappedApiClient = Omit<
  AxiosInstance,
  'get' | 'post' | 'put' | 'patch' | 'delete'
> & {
  <T = unknown>(config: AxiosRequestConfig): Promise<ApiResponse<T>>;
  get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>>;
  delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>>;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000,
  withCredentials: true, // Cookies are automatically sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
}) as UnwrappedApiClient;

// Dedupe concurrent refresh calls
let refreshPromise: Promise<void> | null = null;

const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
];

/**
 * Refresh access token using httpOnly cookie
 * The refreshToken cookie is automatically sent with the request
 * Backend sets new cookies in the response
 */
async function refreshAccessToken(): Promise<void> {
  await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
}

/**
 * Clear auth state and redirect to login
 */
function handleAuthFailure(): void {
  // Clear Zustand store (async import to avoid circular dependency)
  import('@/stores/authStore').then(({ useAuthStore }) => {
    useAuthStore.getState().logout();
  });

  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Response interceptor to handle token refresh and unwrap response
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as
      (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Skip refresh logic for:
    // - No original request
    // - Not a 401 error
    // - Auth endpoints (login, register, refresh, logout)
    // - Already retried
    // - Server-side (cookies not available in SSR context)
    const isAuthEndpoint = AUTH_ENDPOINTS.some((url) =>
      originalRequest?.url?.includes(url),
    );

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      isAuthEndpoint ||
      originalRequest._retry ||
      typeof window === 'undefined' // Skip refresh on Server side
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Share a single in-flight refresh across all concurrent requests
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      await refreshPromise;

      // Retry original request with new cookies
      return apiClient(originalRequest);
    } catch {
      // TODO: add more logic logout
      handleAuthFailure();
      return Promise.reject(error);
    }
  },
);

/**
 * Handle API errors with toast notification
 */
export function handleApiError(error: unknown): ApiError {
  const apiError = parseApiError(error);

  toast.error(apiError.message, {
    position: 'top-center',
  });

  return apiError;
}

/**
 * Parse error into ApiError format (without showing toast)
 */
export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const responseError = error.response?.data as ApiError;

    return {
      statusCode: error.response?.status || 500,
      message: responseError?.message || error.message || 'An error occurred',
      error: responseError?.error,
      details: responseError?.details,
    };
  }

  return {
    statusCode: 500,
    message:
      error instanceof Error ? error.message : 'An unknown error occurred',
  };
}
