import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient, extractData, handleApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApiResponse } from '@/lib/api-client';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserProfileRequest,
  ChangePasswordRequest,
} from '@/types';

// Auth API functions
const authApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      data
    );
    return extractData(response);
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', data);
    return extractData(response);
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >('/auth/refresh', { refreshToken });
    return extractData(response);
  },

  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return extractData(response);
  },

  updateProfile: async (data: UpdateUserProfileRequest) => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);
    return extractData(response);
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await apiClient.post<ApiResponse<User>>(
      '/users/me/change-password',
      data
    );
    return extractData(response);
  },
};

// Hooks
export function useLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
    },
    onError: handleApiError,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
    onError: handleApiError,
  });
}

export function useRefreshToken() {
  const { setTokens } = useAuthStore();

  return useMutation({
    mutationFn: authApi.refresh,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
    },
    onError: handleApiError,
  });
}

export function useProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.profile(), data);
      updateUser(data);
    },
    onError: handleApiError,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
    onError: handleApiError,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return () => {
    logout();
    queryClient.clear();
  };
}

