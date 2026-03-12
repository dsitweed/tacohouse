/**
 * Centralized export for all API hooks
 */

// Auth hooks
export {
  useLogin,
  useRegister,
  useRefreshToken,
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useLogout,
} from './useAuth';

// Building hooks
export {
  useBuildings,
  useBuilding,
  useCreateBuilding,
  useUpdateBuilding,
  useDeleteBuilding,
} from './useBuildings';

// Room hooks
export {
  useRooms,
  useRoom,
  useRoomsByBuilding,
  useAvailableRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from './useRooms';

// Rental hooks
export {
  useRentals,
  useRental,
  useRentalsByTenant,
  useRentalsByRoom,
  useCreateRental,
  useUpdateRental,
  useTerminateRental,
} from './useRentals';

// Bill hooks
export {
  useBills,
  useBill,
  useBillsByRoom,
  useCreateBill,
  useUpdateBill,
  useConfirmBillPayment,
  useCancelBill,
} from './useBills';

// Payment hooks
export {
  usePayments,
  usePayment,
  usePaymentsByBill,
  useCreatePayment,
} from './usePayments';

// Maintenance hooks
export {
  useMaintenanceRequests,
  useMaintenanceRequest,
  useMaintenanceByTenant,
  useMaintenanceByRoom,
  useCreateMaintenance,
  useUpdateMaintenance,
  useRespondToMaintenance,
} from './useMaintenance';

// Chat hooks
export {
  useChatGroups,
  useChatGroup,
  useChatMessages,
  useSendMessage,
  useDirectMessages,
  useSendDirectMessage,
} from './useChat';

// Notification hooks
export {
  useNotifications,
  useNotification,
  useCreateNotification,
  useMarkNotificationAsRead,
} from './useNotifications';

