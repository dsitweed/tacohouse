---
applyTo: "src/**/*.tsx"
---

# Frontend Development Guidelines

## Component Strategy

### Use Client Components (`'use client'`) for:

- Page routes in `dashboard/*` - Most common pattern in this project
- Interactive forms and data tables
- Components that use hooks: `useQuery`, `useMutation`, `useForm`, etc.
- Components that need event handlers
- Components with local state

**Example**:

```typescript
'use client';
import { useRooms } from '@/hooks/api';

export default function RoomsPage() {
  const { data: rooms } = useRooms();
  return <RoomsList rooms={rooms} />;
}
```

### Use Server Components for:

- Static content
- Async data fetching at route level (rare in this project)
- Layouts
- Non-interactive pages

---

## Hooks & API Integration

### Create Custom Hooks in `hooks/api/use*.ts`

- All data fetching happens in hooks, NOT in components
- Use TanStack Query (`useQuery`, `useMutation`)
- Return typed data using generated DTOs

**Example** (`hooks/api/useRooms.ts`):

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/apiClient";
import { queryKeys } from "@/libs/queryKeys";
import { Room, RoomsControllerFindAllParams } from "@/generated/model";

export const roomsApi = {
  findAll: (query?: RoomsControllerFindAllParams) =>
    apiClient.get<Room[]>("/rooms", { params: query }),
};

export function useRooms(query?: RoomsControllerFindAllParams) {
  return useQuery({
    queryKey: queryKeys.rooms.findAll(query),
    queryFn: () => roomsApi.findAll(query),
    staleTime: 2 * 60 * 1000,
  });
}
```

### Mutations with TanStack Query

```typescript
export const roomsApi = {
  create: (data: CreateRoomDto) => apiClient.post<Room>("/rooms", data),
};

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}
```

---

## Forms (React Hook Form + Zod)

### Define Schema

```typescript
import { z } from "zod";

export const roomSchema = z.object({
  buildingId: z.string().min(1, "Vui lòng chọn tòa nhà"),
  number: z.string().min(1, "Vui lòng nhập số phòng"),
  area: z.number().min(1, "Diện tích phải > 0"),
});

export type RoomFormData = z.infer<typeof roomSchema>;
```

### Use in Component

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRoom } from '@/hooks/api';

export function RoomForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
  });
  const { mutate } = useCreateRoom();

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))}>
      <input {...register('number')} />
      {errors.number && <span>{errors.number.message}</span>}
      <button type="submit">Tạo phòng</button>
    </form>
  );
}
```

---

## UI Components

### Use shadcn/ui

- Located in `components/ui/`
- Base components: Button, Card, Form, Input, Select, etc.
- Import and use:
  ```typescript
  import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  ```

### Styling

- Use Tailwind CSS utility classes
- Maintain visual consistency with existing components
- Example:
  ```typescript
  <div className="flex gap-4 p-6 bg-white rounded-lg shadow">
    <Button>Click me</Button>
  </div>
  ```

---

## Data Fetching Patterns

### ✅ Correct - Hook-based data fetching

```typescript
'use client';
import { useRooms } from '@/hooks/api';

export default function RoomsPage() {
  const { data: rooms, isPending, error } = useRooms();

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return <RoomsList rooms={rooms} />;
}
```

### ❌ Wrong - Direct API calls in component

```typescript
// DON'T DO THIS
export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    apiClient.get('/rooms').then(setRooms); // ❌ Wrong
  }, []);

  return <RoomsList rooms={rooms} />;
}
```

---

## Avoid Unnecessary useEffect

### ✅ Good

```typescript
// Use hooks for data fetching
const { data } = useQuery({ queryKey: ["data"], queryFn: fetch });

// Simple effects with dependencies
useEffect(() => {
  console.log("Rooms changed", rooms);
}, [rooms]);
```

### ❌ Avoid

```typescript
// Unnecessary effect for data that doesn't change
useEffect(() => {
  const color = "blue";
  setColor(color);
}, []);

// Effect with stale closures
useEffect(() => {
  const handleClick = () => console.log(data); // ❌ Old data
  button.addEventListener("click", handleClick);
}, []); // Missing dependency
```

---

## Type Safety

### Use Generated Types (Orval)

- Auto-generated from backend API (Swagger)
- Located in `generated/model/`
- Import and use:

  ```typescript
  import { Room, Bill, User } from '@/generated/model';

  export function RoomCard({ room }: { room: Room }) {
    return <div>{room.number}</div>;
  }
  ```

### Never manually create types that match backend DTOs

- Run `pnpm orval` after backend changes
- Generated types are always in sync

---

## i18n (Internationalization)

### Routes with Locale

- URL structure: `/[locale]/dashboard/rooms`
- Supported: `/en/...` and `/vi/...`
- Example pages:
  - `app/[locale]/dashboard/rooms/page.tsx` (en & vi)
  - `app/[locale]/(auth)/login/page.tsx` (en & vi)

### Use Translations

```typescript
import { useIntlayer } from 'react-intlayer';

export function Header() {
  const { title } = useIntlayer();
  return <h1>{title}</h1>; // Auto-translated based on locale
}
```

---

## Project Structure Reference

```
frontend/src/
├── app/[locale]/           # App Router pages (i18n enabled)
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── dashboard/         # Main dashboard pages
│   │   ├── rooms/
│   │   ├── buildings/
│   │   └── bills/
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # shadcn/ui components (Button, Card, etc.)
│   ├── layouts/           # Layout components (Sidebar, Header)
│   └── providers/         # React Query, Socket providers
├── hooks/
│   └── api/               # Custom hooks (useQuery/useMutation)
│       ├── useRooms.ts
│       ├── useBills.ts
│       └── ...
├── libs/
│   ├── apiClient.ts       # Axios instance for HTTP requests
│   ├── serverApiClient.ts # Server-side HTTP client
│   └── queryKeys.ts       # TanStack Query key management
├── features/              # Feature-specific logic
├── generated/             # Auto-generated (Orval)
│   └── model/            # DTOs from backend
└── utils/                 # Utility functions
```

---

## Common Patterns

### Loading & Error States

```typescript
const { data, isPending, error } = useQuery(...);

if (isPending) return <Skeleton />;
if (error) return <ErrorAlert error={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

### Handling Mutations with Loading State

```typescript
const { mutate, isPending } = useMutation({
  mutationFn: roomsApi.create,
  onSuccess: () => {
    toast.success('Created successfully');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

return (
  <Button onClick={() => mutate(formData)} disabled={isPending}>
    {isPending ? 'Creating...' : 'Create'}
  </Button>
);
```
