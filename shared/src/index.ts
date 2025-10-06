// Export all Prisma types and enums
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
} from ".prisma/client";

// Export all Prisma enums
export {
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
} from ".prisma/client";

// Also re-export the PrismaClient if needed in backend
export { PrismaClient } from ".prisma/client";
