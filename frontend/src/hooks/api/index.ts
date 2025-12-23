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
} from './use-auth';

// Building hooks
export {
  useBuildings,
  useBuilding,
  useCreateBuilding,
  useUpdateBuilding,
  useDeleteBuilding,
} from './use-buildings';

// Room hooks
export {
  useRooms,
  useRoom,
  useRoomsByBuilding,
  useAvailableRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from './use-rooms';

// Rental hooks
export {
  useRentals,
  useRental,
  useRentalsByTenant,
  useRentalsByRoom,
  useCreateRental,
  useUpdateRental,
  useTerminateRental,
} from './use-rentals';

// Bill hooks
export {
  useBills,
  useBill,
  useBillsByRoom,
  useCreateBill,
  useUpdateBill,
  useConfirmBillPayment,
  useCancelBill,
} from './use-bills';

// Payment hooks
export {
  usePayments,
  usePayment,
  usePaymentsByBill,
  useCreatePayment,
} from './use-payments';

// Maintenance hooks
export {
  useMaintenanceRequests,
  useMaintenanceRequest,
  useMaintenanceByTenant,
  useMaintenanceByRoom,
  useCreateMaintenance,
  useUpdateMaintenance,
  useRespondToMaintenance,
} from './use-maintenance';

// Chat hooks
export {
  useChatGroups,
  useChatGroup,
  useChatMessages,
  useSendMessage,
  useDirectMessages,
  useSendDirectMessage,
} from './use-chat';

// Notification hooks
export {
  useNotifications,
  useNotification,
  useCreateNotification,
  useMarkNotificationAsRead,
} from './use-notifications';

