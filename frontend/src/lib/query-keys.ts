/**
 * Query Key Factory for TanStack Query
 * Centralized query key management for better organization and type safety
 */

export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // Building queries
  buildings: {
    all: ['buildings'] as const,
    lists: () => [...queryKeys.buildings.all, 'list'] as const,
    list: (filters?: { landlordId?: string; page?: number; limit?: number }) =>
      [...queryKeys.buildings.lists(), filters] as const,
    details: () => [...queryKeys.buildings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.buildings.details(), id] as const,
  },

  // Room queries
  rooms: {
    all: ['rooms'] as const,
    lists: () => [...queryKeys.rooms.all, 'list'] as const,
    list: (filters?: {
      buildingId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => [...queryKeys.rooms.lists(), filters] as const,
    available: () => [...queryKeys.rooms.all, 'available'] as const,
    details: () => [...queryKeys.rooms.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rooms.details(), id] as const,
    byBuilding: (buildingId: string) =>
      [...queryKeys.rooms.all, 'building', buildingId] as const,
  },

  // Rental queries
  rentals: {
    all: ['rentals'] as const,
    lists: () => [...queryKeys.rentals.all, 'list'] as const,
    list: (filters?: {
      roomId?: string;
      tenantId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => [...queryKeys.rentals.lists(), filters] as const,
    details: () => [...queryKeys.rentals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rentals.details(), id] as const,
    byTenant: (tenantId: string) =>
      [...queryKeys.rentals.all, 'tenant', tenantId] as const,
    byRoom: (roomId: string) =>
      [...queryKeys.rentals.all, 'room', roomId] as const,
  },

  // Bill queries
  bills: {
    all: ['bills'] as const,
    lists: () => [...queryKeys.bills.all, 'list'] as const,
    list: (filters?: {
      roomId?: string;
      rentalId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => [...queryKeys.bills.lists(), filters] as const,
    details: () => [...queryKeys.bills.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bills.details(), id] as const,
    byRoom: (roomId: string) =>
      [...queryKeys.bills.all, 'room', roomId] as const,
    byTenant: (tenantId: string) =>
      [...queryKeys.bills.all, 'tenant', tenantId] as const,
  },

  // Payment queries
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters?: {
      billId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => [...queryKeys.payments.lists(), filters] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
    byBill: (billId: string) =>
      [...queryKeys.payments.all, 'bill', billId] as const,
  },

  // Maintenance queries
  maintenance: {
    all: ['maintenance'] as const,
    lists: () => [...queryKeys.maintenance.all, 'list'] as const,
    list: (filters?: {
      tenantId?: string;
      roomId?: string;
      status?: string;
      priority?: string;
      page?: number;
      limit?: number;
    }) => [...queryKeys.maintenance.lists(), filters] as const,
    details: () => [...queryKeys.maintenance.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.maintenance.details(), id] as const,
    byTenant: (tenantId: string) =>
      [...queryKeys.maintenance.all, 'tenant', tenantId] as const,
    byRoom: (roomId: string) =>
      [...queryKeys.maintenance.all, 'room', roomId] as const,
  },

  // Chat queries
  chat: {
    all: ['chat'] as const,
    groups: () => [...queryKeys.chat.all, 'groups'] as const,
    group: (groupId: string) =>
      [...queryKeys.chat.all, 'group', groupId] as const,
    messages: (groupId: string) =>
      [...queryKeys.chat.all, 'messages', groupId] as const,
    direct: (userId: string) =>
      [...queryKeys.chat.all, 'direct', userId] as const,
  },

  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters?: { isRead?: boolean; page?: number; limit?: number }) =>
      [...queryKeys.notifications.lists(), filters] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    count: () => [...queryKeys.notifications.all, 'count'] as const,
  },
} as const;

