export { PrismaClient } from ".prisma/client";

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
  // Enum Role
  UserRole,
  // Enum Type
  RoomType,
  UtilityType,
  MessageType,
  PriorityType,
  NotificationType,
  // Enum Status
  RoomStatus,
  RentalStatus,
  BillStatus,
  PaymentStatus,
  MaintenanceStatus,
  // Enum other
  EquipmentCondition,
  PaymentMethod,
  MaintenanceCategory,
} from ".prisma/client";
