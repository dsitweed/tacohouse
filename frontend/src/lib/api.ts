/**
 * @deprecated This file is deprecated. Please use hooks from @/hooks/api instead.
 *
 * Migration guide:
 * - Replace direct API calls with TanStack Query hooks
 * - Example: Instead of `buildingsApi.getAll()`, use `useBuildings()` hook
 * - See @/hooks/api/README.md for detailed migration guide
 *
 * This file is kept for backward compatibility but will be removed in future versions.
 */
import { useAuthStore } from '@/stores/authStore';
import type {
  ConfirmPaymentRequest,
  CreateBuildingRequest,
  CreateMaintenanceRequest,
  CreateRoomRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '@/types';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// API endpoints
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (data: RegisterRequest) => apiClient.post('/auth/register', data),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  logout: () => apiClient.post('/auth/logout'),

  profile: () => apiClient.get('/auth/profile'),
};

export const buildingsApi = {
  getAll: () => apiClient.get('/buildings'),

  getById: (id: string) => apiClient.get(`/buildings/${id}`),

  create: (data: CreateBuildingRequest) => apiClient.post('/buildings', data),

  update: (id: string, data: Partial<CreateBuildingRequest>) =>
    apiClient.put(`/buildings/${id}`, data),

  delete: (id: string) => apiClient.delete(`/buildings/${id}`),
};

export const roomsApi = {
  getAll: () => apiClient.get('/rooms'),

  getById: (id: string) => apiClient.get(`/rooms/${id}`),

  getByBuilding: (buildingId: string) =>
    apiClient.get(`/buildings/${buildingId}/rooms`),

  create: (data: CreateRoomRequest) => apiClient.post('/rooms', data),

  update: (id: string, data: Partial<CreateRoomRequest>) =>
    apiClient.put(`/rooms/${id}`, data),

  delete: (id: string) => apiClient.delete(`/rooms/${id}`),

  getAvailable: () => apiClient.get('/rooms/available'),
};

export const billsApi = {
  getAll: () => apiClient.get('/bills'),

  getById: (id: string) => apiClient.get(`/bills/${id}`),

  getByRoom: (roomId: string) => apiClient.get(`/rooms/${roomId}/bills`),

  create: (data: Record<string, unknown>) => apiClient.post('/bills', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/bills/${id}`, data),

  confirmPayment: (id: string, data: ConfirmPaymentRequest) =>
    apiClient.post(`/bills/${id}/confirm`, data),
};

export const maintenanceApi = {
  getAll: () => apiClient.get('/maintenance'),

  getById: (id: string) => apiClient.get(`/maintenance/${id}`),

  create: (data: CreateMaintenanceRequest) =>
    apiClient.post('/maintenance', data),

  update: (id: string, data: Partial<CreateMaintenanceRequest>) =>
    apiClient.put(`/maintenance/${id}`, data),

  respond: (id: string, response: string) =>
    apiClient.post(`/maintenance/${id}/respond`, { response }),
};

export const chatApi = {
  getGroups: () => apiClient.get('/chat/groups'),

  getMessages: (groupId: string) =>
    apiClient.get(`/chat/groups/${groupId}/messages`),

  sendMessage: (groupId: string, content: string) =>
    apiClient.post(`/chat/groups/${groupId}/messages`, { content }),

  getDirectMessages: (userId: string) =>
    apiClient.get(`/chat/direct/${userId}`),

  sendDirectMessage: (userId: string, content: string) =>
    apiClient.post(`/chat/direct/${userId}`, { content }),
};
