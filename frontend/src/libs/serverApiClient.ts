import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { ApiError, ApiResponse } from '@/types';

const API_BASE_URL = `${process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_ORIGIN}${process.env.API_PREFIX || process.env.NEXT_PUBLIC_API_PREFIX}`;

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuth?: boolean;
};

/**
 * Server-side API client for use in Server Components and Server Actions
 * Automatically forwards httpOnly cookies from the request
 */
async function serverFetch<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, skipAuth = false, ...restOptions } = options;
  const cookieStore = await cookies();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...restOptions.headers,
  };

  // Forward cookies for authentication (unless explicitly skipped)
  if (!skipAuth) {
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    const cookieHeader = [
      accessToken && `accessToken=${accessToken}`,
      refreshToken && `refreshToken=${refreshToken}`,
    ]
      .filter(Boolean)
      .join('; ');

    if (cookieHeader) {
      (headers as Record<string, string>)['Cookie'] = cookieHeader;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 - redirect to login
  if (response.status === 401) {
    redirect('/login');
  }

  // Handle other errors
  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ApiError;
    throw new ServerApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData,
    );
  }

  return response.json() as Promise<ApiResponse<T>>;
}

/**
 * Custom error class for server-side API errors
 */
export class ServerApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: ApiError,
  ) {
    super(message);
    this.name = 'ServerApiError';
  }
}

/**
 * Server API client with typed methods
 */
export const serverApi = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    serverFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    serverFetch<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    serverFetch<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    serverFetch<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    serverFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Check if user is authenticated (for Server Components)
 * Returns user data or null
 */
export async function getServerSession() {
  try {
    const response = await serverApi.get<{
      id: string;
      email: string;
      role: string;
    }>('/users/me');
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Require authentication (redirects to login if not authenticated)
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}
