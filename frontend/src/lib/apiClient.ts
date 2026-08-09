import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/authStore';
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
  headers: {
    'Content-Type': 'application/json',
  },
}) as UnwrappedApiClient;

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Dedupe concurrent refresh call
let refreshPromise: Promise<string> | null;

// TODO: use http only cookie instead of client state in zustand
async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.post<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>
  >(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;

  useAuthStore.getState().setTokens(accessToken, newRefreshToken);

  return accessToken;
}

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as
      (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Share a single in-flight refresh across all requests failing at once
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const accessToken = await refreshPromise;

      // Retry original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed, logout user
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    }
  },
);

// Helper function to handle API errors. Also shows a error toast
export function handleApiError(error: unknown): ApiError {
  const apiErrorHandle = () => {
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
  };

  const apiError = apiErrorHandle();
  toast.error(apiError.message);

  return apiError;
}
