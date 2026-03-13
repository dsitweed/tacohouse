import { useAuthStore } from '@/stores/authStore';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH;

// Standard API Response Format
export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  status: number;
  message: string;
  error?: string;
  details?: unknown;
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// // Response interceptor to handle token refresh
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError<ApiError>) => {
//     const originalRequest = error.config as AxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = useAuthStore.getState().refreshToken;
//         if (!refreshToken) {
//           throw new Error('No refresh token');
//         }

//         const response = await axios.post<ApiResponse<{
//           accessToken: string;
//           refreshToken: string;
//         }>>(`${API_URL}${API_BASE_PATH}/auth/refresh`, {
//           refreshToken,
//         });

//         const { accessToken, refreshToken: newRefreshToken } = response.data.data;
//         useAuthStore.getState().setTokens(accessToken, newRefreshToken);

//         // Retry original request with new token
//         if (originalRequest.headers) {
//           originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         }
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         // Refresh failed, logout user
//         useAuthStore.getState().logout();
//         if (typeof window !== 'undefined') {
//           window.location.href = '/login';
//         }
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// Helper function to extract data from API response
export function extractData<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

// Helper function to handle API errors
export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return {
      status: error.response?.status || 500,
      message: apiError?.message || error.message || 'An error occurred',
      error: apiError?.error,
      details: apiError?.details,
    };
  }

  return {
    status: 500,
    message:
      error instanceof Error ? error.message : 'An unknown error occurred',
  };
}
