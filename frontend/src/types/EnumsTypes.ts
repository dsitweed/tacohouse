// Runtime enum objects + derived union types

// TODO: remove type defined in FE use all Type of generated from BE schema
export const UserRole = {
  ADMIN: 'ADMIN',
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const RoomType = {
  FULL_RIGHTS: 'FULL_RIGHTS',
  PARTIAL_RIGHTS: 'PARTIAL_RIGHTS',
} as const;
export type RoomType = (typeof RoomType)[keyof typeof RoomType];

export const UtilityType = {
  ELECTRICITY: 'ELECTRICITY',
  WATER: 'WATER',
  GAS: 'GAS',
} as const;
export type UtilityType = (typeof UtilityType)[keyof typeof UtilityType];

export const MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const PriorityType = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type PriorityType = (typeof PriorityType)[keyof typeof PriorityType];

export const NotificationType = {
  BILL_GENERATED: 'BILL_GENERATED',
  PAYMENT_REMINDER: 'PAYMENT_REMINDER',
  MAINTENANCE_UPDATE: 'MAINTENANCE_UPDATE',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  SYSTEM: 'SYSTEM',
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const RoomStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  PENDING_CHECKOUT: 'PENDING_CHECKOUT',
  MAINTENANCE: 'MAINTENANCE',
} as const;
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export const RentalStatus = {
  ACTIVE: 'ACTIVE',
  NOTICE_GIVEN: 'NOTICE_GIVEN',
  TERMINATED: 'TERMINATED',
} as const;
export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus];

export const BillStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  TENANT_CONFIRMED: 'TENANT_CONFIRMED',
  LANDLORD_CONFIRMED: 'LANDLORD_CONFIRMED',
  OVERDUE: 'OVERDUE',
} as const;
export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const MaintenanceStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type MaintenanceStatus =
  (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const EquipmentCondition = {
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  BROKEN: 'BROKEN',
} as const;
export type EquipmentCondition =
  (typeof EquipmentCondition)[keyof typeof EquipmentCondition];

export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  STRIPE: 'STRIPE',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const MaintenanceCategory = {
  PLUMBING: 'PLUMBING',
  ELECTRICAL: 'ELECTRICAL',
  APPLIANCE: 'APPLIANCE',
  FURNITURE: 'FURNITURE',
  CLEANING: 'CLEANING',
  OTHER: 'OTHER',
} as const;
export type MaintenanceCategory =
  (typeof MaintenanceCategory)[keyof typeof MaintenanceCategory];
