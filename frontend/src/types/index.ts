// User types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  idCardFront?: string;
  idCardBack?: string;
  portraitPhoto?: string;
  hometown?: string;
  currentJob?: string;
  workplace?: string;
}

export type UserRole = "ADMIN" | "LANDLORD" | "TENANT";

// Building and Room types
export interface Building {
  id: string;
  name: string;
  address: string;
  description?: string;
  landlordId: string;
  electricityRate: number;
  waterRate: number;
  gasRate: number;
  managementFee: number;
  cleaningFeePerPerson: number;
  lightingFee: number;
  createdAt: string;
  updatedAt: string;
  rooms?: Room[];
}

export interface Room {
  id: string;
  number: string;
  buildingId: string;
  area?: number;
  monthlyRent: number;
  deposit: number;
  maxTenants: number;
  roomType: RoomType;
  description?: string;
  images: string[];
  status: RoomStatus;
  availableFrom?: string;
  createdAt: string;
  updatedAt: string;
  building?: Building;
  equipment?: RoomEquipment[];
}

export interface RoomEquipment {
  id: string;
  roomId: string;
  name: string;
  description?: string;
  condition: EquipmentCondition;
}

export type RoomType = "FULL_RIGHTS" | "PARTIAL_RIGHTS";
export type RoomStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "PENDING_CHECKOUT"
  | "MAINTENANCE";
export type EquipmentCondition =
  | "EXCELLENT"
  | "GOOD"
  | "FAIR"
  | "POOR"
  | "BROKEN";

// Rental types
export interface Rental {
  id: string;
  tenantId: string;
  roomId: string;
  startDate: string;
  endDate?: string;
  noticeDate?: string;
  monthlyRent: number;
  depositPaid: number;
  status: RentalStatus;
  contractImages: string[];
  createdAt: string;
  updatedAt: string;
}

export type RentalStatus = "ACTIVE" | "NOTICE_GIVEN" | "TERMINATED";

// Billing types
export interface Bill {
  id: string;
  roomId: string;
  billingPeriod: string;
  dueDate: string;
  monthlyRent: number;
  electricityUsage: number;
  electricityAmount: number;
  waterUsage: number;
  waterAmount: number;
  gasUsage: number;
  gasAmount: number;
  managementFee: number;
  cleaningFee: number;
  lightingFee: number;
  previousDebt: number;
  totalAmount: number;
  status: BillStatus;
  createdAt: string;
  updatedAt: string;
  room?: Room;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  stripePaymentId?: string;
  bankTransferRef?: string;
  notes?: string;
  receiptImage?: string;
  status: PaymentStatus;
}

export interface PaymentConfirmation {
  id: string;
  billId: string;
  tenantId: string;
  tenantConfirmed: boolean;
  tenantConfirmedAt?: string;
  landlordConfirmed: boolean;
  landlordConfirmedAt?: string;
  proofImages: string[];
  notes?: string;
}

export type BillStatus =
  | "PENDING"
  | "TENANT_CONFIRMED"
  | "LANDLORD_CONFIRMED"
  | "PAID"
  | "OVERDUE";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "STRIPE";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

// Utility types
export interface UtilityRecord {
  id: string;
  roomId: string;
  recordDate: string;
  utilityType: UtilityType;
  previousReading: number;
  currentReading: number;
  consumption: number;
  unitRate: number;
}

export type UtilityType = "ELECTRICITY" | "WATER" | "GAS";

// Communication types
export interface ChatGroup {
  id: string;
  buildingId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members?: ChatGroupMember[];
}

export interface ChatGroupMember {
  id: string;
  chatGroupId: string;
  userId: string;
  joinedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  chatGroupId?: string;
  recipientId?: string;
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

export type MessageType = "TEXT" | "IMAGE" | "FILE";

// Maintenance types
export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  roomId: string;
  title: string;
  description: string;
  priority: Priority;
  category: MaintenanceCategory;
  images: string[];
  status: MaintenanceStatus;
  response?: string;
  responseDate?: string;
  completedAt?: string;
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
  room?: Room;
  tenant?: User;
}

export type MaintenanceCategory =
  | "PLUMBING"
  | "ELECTRICAL"
  | "APPLIANCE"
  | "FURNITURE"
  | "CLEANING"
  | "OTHER";
export type MaintenanceStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "BILL_GENERATED"
  | "PAYMENT_REMINDER"
  | "MAINTENANCE_UPDATE"
  | "CHAT_MESSAGE"
  | "ANNOUNCEMENT"
  | "SYSTEM";

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface CreateBuildingRequest {
  name: string;
  address: string;
  description?: string;
  electricityRate: number;
  waterRate: number;
  gasRate: number;
  managementFee: number;
  cleaningFeePerPerson: number;
  lightingFee: number;
}

export interface CreateRoomRequest {
  number: string;
  buildingId: string;
  area?: number;
  monthlyRent: number;
  deposit: number;
  maxTenants: number;
  roomType: RoomType;
  description?: string;
  images: string[];
}

export interface CreateMaintenanceRequest {
  roomId: string;
  title: string;
  description: string;
  priority: Priority;
  category: MaintenanceCategory;
  images: string[];
}

export interface ConfirmPaymentRequest {
  tenantConfirmed?: boolean;
  landlordConfirmed?: boolean;
  proofImages?: string[];
  notes?: string;
}
