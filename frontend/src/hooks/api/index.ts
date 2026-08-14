/**
 * Centralized export for all API hooks
 */

// Auth hooks
export {
  useChangePassword,
  useLogin,
  useLogout,
  useProfile,
  useRegister,
  useUpdateProfile,
} from './useAuth';

// Building hooks
export {
  useBuilding,
  useBuildings,
  useCreateBuilding,
  useDeleteBuilding,
  useUpdateBuilding,
} from './useBuildings';

// Room hooks
export {
  useAvailableRooms,
  useCreateRoom,
  useDeleteRoom,
  useRoom,
  useRooms,
  useRoomsByBuilding,
  useUpdateRoom,
} from './useRooms';

// Rental hooks
export {
  useCreateRental,
  useRental,
  useRentals,
  useRentalsByRoom,
  useRentalsByTenant,
  useTerminateRental,
  useUpdateRental,
} from './useRentals';

// Bill hooks
export {
  useBill,
  useBills,
  useBillsByRoom,
  useCancelBill,
  useConfirmBillPayment,
  useCreateBill,
  useUpdateBill,
} from './useBills';

// Payment hooks
export {
  useCreatePayment,
  usePayment,
  usePayments,
  usePaymentsByBill,
} from './usePayments';

// Maintenance hooks
export {
  useCreateMaintenance,
  useMaintenanceByRoom,
  useMaintenanceByTenant,
  useMaintenanceRequest,
  useMaintenanceRequests,
  useRespondToMaintenance,
  useUpdateMaintenance,
} from './useMaintenance';

// Chat hooks
export {
  useChatGroup,
  useChatGroups,
  useChatMessages,
  useDirectMessages,
  useSendDirectMessage,
  useSendMessage,
} from './useChat';

// Notification hooks
export {
  useCreateNotification,
  useMarkNotificationAsRead,
  useNotification,
  useNotifications,
} from './useNotifications';
