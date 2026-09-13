import { User } from '@/generated/model';

// Standard API Response
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonRequestBody = object | JsonValue;

export interface ApiResponse<T = JsonValue> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: JsonValue;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoginResponse {
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

// Chat API Types
export interface SendMessageRequest {
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
}

export interface MessageListQuery {
  page?: number;
  limit?: number;
  before?: string; // Message ID for pagination
}
