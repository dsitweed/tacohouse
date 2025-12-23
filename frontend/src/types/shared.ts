/**
 * Re-export all types from @tacohouse/shared
 * This ensures frontend uses the same types as backend
 */

export type {
  User,
  UserProfile,
  Admin,
  Landlord,
  Tenant,
  Building,
  Room,
  RoomEquipment,
  Rental,
  Bill,
  Payment,
  PaymentConfirmation,
  UtilityRecord,
  ChatGroup,
  ChatGroupMember,
  Message,
  MaintenanceRequest,
  Notification,
  Prisma,
} from '@tacohouse/shared';

export {
  // Enums
  UserRole,
  RoomType,
  UtilityType,
  MessageType,
  PriorityType,
  NotificationType,
  RoomStatus,
  RentalStatus,
  BillStatus,
  PaymentStatus,
  MaintenanceStatus,
  EquipmentCondition,
  PaymentMethod,
  MaintenanceCategory,
} from '@tacohouse/shared';

// Type aliases for convenience
export type UserRole = 'ADMIN' | 'LANDLORD' | 'TENANT';
export type RoomType = 'FULL_RIGHTS' | 'PARTIAL_RIGHTS';
export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'PENDING_CHECKOUT'
  | 'MAINTENANCE';
export type RentalStatus = 'ACTIVE' | 'NOTICE_GIVEN' | 'TERMINATED';
export type BillStatus =
  | 'PENDING'
  | 'TENANT_CONFIRMED'
  | 'LANDLORD_CONFIRMED'
  | 'PAID'
  | 'OVERDUE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'STRIPE';
export type MaintenanceStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type MaintenanceCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'APPLIANCE'
  | 'FURNITURE'
  | 'CLEANING'
  | 'OTHER';
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';
export type NotificationType =
  | 'BILL_GENERATED'
  | 'PAYMENT_REMINDER'
  | 'MAINTENANCE_UPDATE'
  | 'CHAT_MESSAGE'
  | 'ANNOUNCEMENT'
  | 'SYSTEM';
export type UtilityType = 'ELECTRICITY' | 'WATER' | 'GAS';
export type EquipmentCondition =
  | 'EXCELLENT'
  | 'GOOD'
  | 'FAIR'
  | 'POOR'
  | 'BROKEN';

