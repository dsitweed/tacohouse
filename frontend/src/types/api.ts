/**
 * API Request/Response Types
 * Based on the API specification
 *
 * Note: Entity/enums are imported from local shared types to avoid
 * coupling the frontend build to backend-only packages (e.g. Prisma).
 */
import type { NotificationType, User } from '@/types';

// Standard API Response
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'ADMIN' | 'LANDLORD' | 'TENANT';
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  occupation?: string;
  workplace?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  occupation?: string;
  workplace?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

// Building API Types
export interface CreateBuildingRequest {
  name: string;
  address: string;
  description?: string;
  billingDate?: number;
  electricityRate?: number;
  waterRate?: number;
  gasRate?: number;
  managementFee?: number;
  cleaningFeePerPerson?: number;
  lightingFee?: number;
}

export interface UpdateBuildingRequest {
  name?: string;
  address?: string;
  description?: string;
  billingDate?: number;
  electricityRate?: number;
  waterRate?: number;
  gasRate?: number;
  managementFee?: number;
  cleaningFeePerPerson?: number;
  lightingFee?: number;
}

export interface BuildingListQuery {
  page?: number;
  limit?: number;
  landlordId?: string;
  search?: string;
}

// Room API Types
export interface CreateRoomRequest {
  number: string;
  buildingId: string;
  area?: number;
  monthlyRent: number;
  deposit: number;
  maxTenants: number;
  roomType: 'FULL_RIGHTS' | 'PARTIAL_RIGHTS';
  description?: string;
  images?: string[];
}

export interface UpdateRoomRequest {
  number?: string;
  area?: number;
  monthlyRent?: number;
  deposit?: number;
  maxTenants?: number;
  roomType?: 'FULL_RIGHTS' | 'PARTIAL_RIGHTS';
  description?: string;
  images?: string[];
  status?: 'AVAILABLE' | 'OCCUPIED' | 'PENDING_CHECKOUT' | 'MAINTENANCE';
  availableFrom?: string;
}

export interface RoomListQuery {
  page?: number;
  limit?: number;
  buildingId?: string;
  status?: string;
}

// Rental API Types
export interface CreateRentalRequest {
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  depositPaid: number;
  contractImages?: string[];
}

export interface UpdateRentalRequest {
  endDate?: string;
  monthlyRent?: number;
  status?: 'ACTIVE' | 'NOTICE_GIVEN' | 'TERMINATED';
  noticeDate?: string;
}

export interface RentalListQuery {
  page?: number;
  limit?: number;
  roomId?: string;
  tenantId?: string;
  status?: string;
}

// Bill API Types
export interface CreateBillRequest {
  roomId: string;
  billingPeriod: string; // ISO date string
  dueDate: string; // ISO date string
  monthlyRent: number;
  electricityUsage?: number;
  electricityAmount?: number;
  waterUsage?: number;
  waterAmount?: number;
  gasUsage?: number;
  gasAmount?: number;
  managementFee?: number;
  cleaningFee?: number;
  lightingFee?: number;
  previousDebt?: number;
}

export interface UpdateBillRequest {
  dueDate?: string;
  status?:
    'PENDING' | 'TENANT_CONFIRMED' | 'LANDLORD_CONFIRMED' | 'PAID' | 'OVERDUE';
}

export interface BillListQuery {
  page?: number;
  limit?: number;
  roomId?: string;
  rentalId?: string;
  status?: string;
}

export interface ConfirmPaymentRequest {
  tenantConfirmed?: boolean;
  landlordConfirmed?: boolean;
  proofImages?: string[];
  notes?: string;
}

// Payment API Types
export interface CreatePaymentRequest {
  billId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'STRIPE';
  transactionId?: string;
  notes?: string;
  receiptImage?: string;
}

export interface PaymentListQuery {
  page?: number;
  limit?: number;
  billId?: string;
  status?: string;
}

// Maintenance API Types
export interface CreateMaintenanceRequest {
  roomId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category:
    | 'PLUMBING'
    | 'ELECTRICAL'
    | 'APPLIANCE'
    | 'FURNITURE'
    | 'CLEANING'
    | 'OTHER';
  images?: string[];
}

export interface UpdateMaintenanceRequest {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completionNote?: string;
}

export interface MaintenanceListQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  roomId?: string;
  status?: string;
  priority?: string;
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

// Notification API Types
export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  recipientId?: string;
  roomId?: string;
  buildingId?: string;
}

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}
