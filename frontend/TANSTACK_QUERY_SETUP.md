# TanStack Query Setup Guide

## Overview

This project now uses **TanStack Query (React Query)** for all API calls. This provides:

- ✅ Automatic caching and background refetching
- ✅ Loading and error states management
- ✅ Optimistic updates
- ✅ Request deduplication
- ✅ Automatic cache invalidation
- ✅ Type-safe API calls

## Installation

All required dependencies are already installed:

```json
{
  "@tanstack/react-query": "^5.90.12",
  "@tanstack/react-query-devtools": "^5.91.1",
  "axios": "^1.x"
}
```

## Project Structure

```
frontend/src/
├── lib/
│   ├── api-client.ts          # Axios instance with interceptors
│   └── query-keys.ts          # Centralized query key factory
├── hooks/
│   └── api/
│       ├── use-auth.ts        # Authentication hooks
│       ├── use-buildings.ts   # Building management hooks
│       ├── use-rooms.ts       # Room management hooks
│       ├── use-rentals.ts     # Rental management hooks
│       ├── use-bills.ts       # Bill management hooks
│       ├── use-payments.ts    # Payment hooks
│       ├── use-maintenance.ts # Maintenance request hooks
│       ├── use-chat.ts        # Chat hooks
│       ├── index.ts           # Centralized exports
│       └── README.md          # Detailed usage guide
├── types/
│   └── api.ts                 # API request/response types
└── components/
    └── providers/
        └── query-provider.tsx # QueryClient provider
```

## Quick Start

### 1. Provider Setup

The `QueryProvider` is already set up in `app/layout.tsx`. No additional setup needed.

### 2. Using Hooks in Components

```tsx
import { useBuildings, useCreateBuilding } from '@/hooks/api';

function BuildingsPage() {
  // Fetch buildings
  const { data: buildings, isLoading, error } = useBuildings({
    page: 1,
    limit: 10,
  });

  // Create building mutation
  const createBuilding = useCreateBuilding();

  const handleCreate = () => {
    createBuilding.mutate(
      {
        name: 'New Building',
        address: '123 Main St',
        // ... other fields
      },
      {
        onSuccess: () => {
          console.log('Building created!');
          // Cache is automatically invalidated
        },
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {buildings?.map((building) => (
        <div key={building.id}>{building.name}</div>
      ))}
      <button onClick={handleCreate}>Create Building</button>
    </div>
  );
}
```

## Available Hooks

### Authentication
- `useLogin()` - Login user
- `useRegister()` - Register new user
- `useProfile()` - Get current user profile
- `useUpdateProfile()` - Update user profile
- `useChangePassword()` - Change password
- `useLogout()` - Logout function

### Buildings
- `useBuildings(query?)` - List buildings
- `useBuilding(id)` - Get building by ID
- `useCreateBuilding()` - Create building
- `useUpdateBuilding()` - Update building
- `useDeleteBuilding()` - Delete building

### Rooms
- `useRooms(query?)` - List rooms
- `useRoom(id)` - Get room by ID
- `useRoomsByBuilding(buildingId)` - Get rooms by building
- `useAvailableRooms()` - Get available rooms
- `useCreateRoom()` - Create room
- `useUpdateRoom()` - Update room
- `useDeleteRoom()` - Delete room

### Rentals
- `useRentals(query?)` - List rentals
- `useRental(id)` - Get rental by ID
- `useRentalsByTenant(tenantId)` - Get rentals by tenant
- `useRentalsByRoom(roomId)` - Get rentals by room
- `useCreateRental()` - Create rental
- `useUpdateRental()` - Update rental
- `useTerminateRental()` - Terminate rental

### Bills
- `useBills(query?)` - List bills
- `useBill(id)` - Get bill by ID
- `useBillsByRoom(roomId)` - Get bills by room
- `useCreateBill()` - Create bill
- `useUpdateBill()` - Update bill
- `useConfirmBillPayment()` - Confirm payment
- `useCancelBill()` - Cancel bill

### Payments
- `usePayments(query?)` - List payments
- `usePayment(id)` - Get payment by ID
- `usePaymentsByBill(billId)` - Get payments by bill
- `useCreatePayment()` - Create payment

### Maintenance
- `useMaintenanceRequests(query?)` - List maintenance requests
- `useMaintenanceRequest(id)` - Get request by ID
- `useMaintenanceByTenant(tenantId)` - Get requests by tenant
- `useMaintenanceByRoom(roomId)` - Get requests by room
- `useCreateMaintenance()` - Create request
- `useUpdateMaintenance()` - Update request
- `useRespondToMaintenance()` - Respond to request

### Chat
- `useChatGroups()` - List chat groups
- `useChatGroup(groupId)` - Get chat group
- `useChatMessages(groupId)` - Get messages in group
- `useSendMessage()` - Send message to group
- `useDirectMessages(userId)` - Get direct messages
- `useSendDirectMessage()` - Send direct message

## Query Key Management

Query keys are centralized in `@/lib/query-keys.ts`:

```tsx
import { queryKeys } from '@/lib/query-keys';
import { useQueryClient } from '@tanstack/react-query';

function SomeComponent() {
  const queryClient = useQueryClient();

  // Invalidate all building queries
  queryClient.invalidateQueries({
    queryKey: queryKeys.buildings.all,
  });

  // Invalidate specific building
  queryClient.invalidateQueries({
    queryKey: queryKeys.buildings.detail('building-id'),
  });
}
```

## Error Handling

All hooks use consistent error handling:

```tsx
const { mutate, error } = useCreateBuilding();

mutate(data, {
  onSuccess: (data) => {
    console.log('Success:', data);
  },
  onError: (error) => {
    // error.status, error.message, error.details
    console.error('Error:', error.message);
  },
});
```

## Configuration

Default query options are configured in `components/providers/query-provider.tsx`:

- `staleTime`: 60 seconds
- `gcTime`: 5 minutes (formerly cacheTime)
- `retry`: Smart retry logic (no retry on 4xx errors)
- `refetchOnWindowFocus`: false
- `refetchOnReconnect`: true

You can override these per query:

```tsx
const { data } = useBuildings(undefined, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 30 * 1000, // Refetch every 30 seconds
});
```

## Migration from Old API

The old `@/lib/api.ts` file is deprecated but still available for backward compatibility.

**Before:**
```tsx
import { buildingsApi } from '@/lib/api';

const response = await buildingsApi.getAll();
const buildings = response.data.data;
```

**After:**
```tsx
import { useBuildings } from '@/hooks/api';

const { data: buildings } = useBuildings();
```

## Development Tools

React Query Devtools are available in development mode. They appear automatically when running `npm run dev`.

## Best Practices

1. **Always handle loading and error states**
2. **Use query options for better control** (staleTime, enabled, etc.)
3. **Leverage automatic cache invalidation** from mutations
4. **Use optimistic updates** for better UX
5. **Don't create wrapper functions** - use hooks directly

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Detailed Hook Usage Guide](./src/hooks/api/README.md)
- [API Types Reference](./src/types/api.ts)

