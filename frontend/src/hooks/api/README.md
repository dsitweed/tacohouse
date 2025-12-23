# API Hooks Documentation

This directory contains all TanStack Query hooks for API calls. These hooks provide a type-safe, efficient way to interact with the backend API.

## Structure

- Each module has its own hook file (e.g., `use-auth.ts`, `use-buildings.ts`)
- All hooks are exported from `index.ts` for easy importing
- Query keys are centralized in `@/lib/query-keys.ts`

## Usage Examples

### Authentication

```tsx
import { useLogin, useProfile, useUpdateProfile } from '@/hooks/api';

function LoginForm() {
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email: 'user@example.com', password: 'password123' },
      {
        onSuccess: (data) => {
          // User is automatically logged in via Zustand store
          console.log('Logged in:', data.user);
        },
        onError: (error) => {
          console.error('Login failed:', error.message);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

function ProfilePage() {
  const { data: user, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user?.firstName} {user?.lastName}</h1>
      <button
        onClick={() =>
          updateProfile.mutate({ firstName: 'New Name' })
        }
      >
        Update Name
      </button>
    </div>
  );
}
```

### Buildings

```tsx
import { useBuildings, useBuilding, useCreateBuilding } from '@/hooks/api';

function BuildingsList() {
  const { data: buildings, isLoading } = useBuildings({
    page: 1,
    limit: 10,
  });
  const createBuilding = useCreateBuilding();

  const handleCreate = () => {
    createBuilding.mutate(
      {
        name: 'New Building',
        address: '123 Main St',
        electricityRate: 3000,
        waterRate: 15000,
        // ... other fields
      },
      {
        onSuccess: () => {
          // Query cache is automatically invalidated
          console.log('Building created!');
        },
      }
    );
  };

  if (isLoading) return <div>Loading buildings...</div>;

  return (
    <div>
      {buildings?.map((building) => (
        <div key={building.id}>{building.name}</div>
      ))}
      <button onClick={handleCreate}>Create Building</button>
    </div>
  );
}

function BuildingDetail({ id }: { id: string }) {
  const { data: building, isLoading } = useBuilding(id);

  if (isLoading) return <div>Loading...</div>;
  if (!building) return <div>Building not found</div>;

  return <div>{building.name}</div>;
}
```

### Rooms

```tsx
import {
  useRooms,
  useRoom,
  useRoomsByBuilding,
  useAvailableRooms,
} from '@/hooks/api';

function RoomsList({ buildingId }: { buildingId?: string }) {
  // Get rooms filtered by building
  const { data: rooms } = useRoomsByBuilding(buildingId);

  // Or get all available rooms
  const { data: availableRooms } = useAvailableRooms();

  return (
    <div>
      {rooms?.map((room) => (
        <div key={room.id}>
          Room {room.number} - ${room.monthlyRent}/month
        </div>
      ))}
    </div>
  );
}
```

### Bills and Payments

```tsx
import {
  useBills,
  useBill,
  useBillsByRoom,
  useConfirmBillPayment,
  useCreatePayment,
} from '@/hooks/api';

function BillsList({ roomId }: { roomId: string }) {
  const { data: bills } = useBillsByRoom(roomId);
  const confirmPayment = useConfirmBillPayment();

  const handleConfirm = (billId: string) => {
    confirmPayment.mutate(
      {
        id: billId,
        data: {
          tenantConfirmed: true,
          proofImages: ['image-url'],
        },
      },
      {
        onSuccess: () => {
          alert('Payment confirmed!');
        },
      }
    );
  };

  return (
    <div>
      {bills?.map((bill) => (
        <div key={bill.id}>
          <h3>Bill #{bill.id}</h3>
          <p>Total: ${bill.totalAmount}</p>
          <p>Status: {bill.status}</p>
          {bill.status === 'PENDING' && (
            <button onClick={() => handleConfirm(bill.id)}>
              Confirm Payment
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Rentals

```tsx
import {
  useRentals,
  useRentalsByTenant,
  useCreateRental,
  useTerminateRental,
} from '@/hooks/api';

function TenantRentals({ tenantId }: { tenantId: string }) {
  const { data: rentals } = useRentalsByTenant(tenantId);
  const terminateRental = useTerminateRental();

  return (
    <div>
      {rentals?.map((rental) => (
        <div key={rental.id}>
          <p>Room: {rental.roomId}</p>
          <p>Status: {rental.status}</p>
          {rental.status === 'ACTIVE' && (
            <button
              onClick={() => terminateRental.mutate(rental.id)}
            >
              Terminate Rental
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Maintenance Requests

```tsx
import {
  useMaintenanceRequests,
  useCreateMaintenance,
  useUpdateMaintenance,
} from '@/hooks/api';

function MaintenancePage() {
  const { data: requests } = useMaintenanceRequests({
    status: 'PENDING',
  });
  const createRequest = useCreateMaintenance();

  const handleCreate = () => {
    createRequest.mutate({
      roomId: 'room-id',
      title: 'Broken faucet',
      description: 'The faucet is leaking',
      priority: 'HIGH',
      category: 'PLUMBING',
      images: [],
    });
  };

  return (
    <div>
      <button onClick={handleCreate}>Create Request</button>
      {requests?.map((request) => (
        <div key={request.id}>
          <h3>{request.title}</h3>
          <p>{request.description}</p>
          <p>Priority: {request.priority}</p>
        </div>
      ))}
    </div>
  );
}
```

### Chat

```tsx
import {
  useChatGroups,
  useChatMessages,
  useSendMessage,
} from '@/hooks/api';

function ChatRoom({ groupId }: { groupId: string }) {
  const { data: messages } = useChatMessages(groupId);
  const sendMessage = useSendMessage();

  const handleSend = (content: string) => {
    sendMessage.mutate({
      groupId,
      data: { content },
    });
  };

  return (
    <div>
      <div>
        {messages?.map((message) => (
          <div key={message.id}>{message.content}</div>
        ))}
      </div>
      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSend(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
      />
    </div>
  );
}
```

## Query Key Management

Query keys are centralized in `@/lib/query-keys.ts`. This ensures:

- Consistent key structure across the app
- Easy cache invalidation
- Type safety

Example of invalidating queries:

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

function SomeComponent() {
  const queryClient = useQueryClient();

  const refreshBuildings = () => {
    // Invalidate all building queries
    queryClient.invalidateQueries({
      queryKey: queryKeys.buildings.all,
    });

    // Or invalidate specific query
    queryClient.invalidateQueries({
      queryKey: queryKeys.buildings.detail('building-id'),
    });
  };
}
```

## Error Handling

All hooks use the `handleApiError` utility which provides consistent error handling:

```tsx
const { mutate, error } = useCreateBuilding();

mutate(data, {
  onError: (error) => {
    // error.status, error.message, error.details
    console.error('Error:', error.message);
  },
});
```

## Best Practices

1. **Use the hooks directly in components** - Don't create wrapper functions
2. **Leverage automatic cache invalidation** - Mutations automatically invalidate related queries
3. **Use query options** - Pass options like `enabled`, `staleTime` for better control
4. **Handle loading and error states** - Always check `isLoading` and `error`
5. **Use optimistic updates** - For better UX, update cache optimistically when possible

## Migration from Old API

If you're migrating from the old `api.ts` file:

**Old way:**
```tsx
import { buildingsApi } from '@/lib/api';

const response = await buildingsApi.getAll();
const buildings = response.data.data;
```

**New way:**
```tsx
import { useBuildings } from '@/hooks/api';

const { data: buildings } = useBuildings();
```

The new hooks handle:
- Loading states
- Error handling
- Caching
- Automatic refetching
- Cache invalidation

