export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Standard API Response
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiError {
  status: number;
  message: string;
  error?: string;
  details?: unknown;
}
