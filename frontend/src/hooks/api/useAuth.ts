import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { RegisterAuthDto } from '@/generated/model';
import { apiClient, handleApiError, queryKeys } from '@/libs';
import { useAuthStore } from '@/stores/authStore';
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  UpdateUserProfileRequest,
  User,
} from '@/types';

// Auth API functions
const authApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterAuthDto) => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout', {});
  },

  getProfile: async () => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateUserProfileRequest) => {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await apiClient.post<User>(
      '/users/me/change-password',
      data,
    );
    return response.data;
  },
};

// Hooks
export function useLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Only store user info - tokens are in httpOnly cookies
      login(data.user);
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

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    },
    onError: () => {
      logout();
      queryClient.clear();
    },
  });
}
