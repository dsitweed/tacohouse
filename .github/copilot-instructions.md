# Project Guidelines

## Tech Stack

### Frontend

- Next.js 16+ (App Router with i18n `[locale]` parameter)
- React 19+
- TypeScript (strict mode)
- TanStack Query v5+ (server state management)
- React Hook Form + Zod (client-side forms)
- Tailwind CSS v4
- shadcn/ui (base UI components)
- Axios (HTTP client)
- Intlayer (i18n)

### Backend

- NestJS 11+
- Prisma 7+ (ORM)
- PostgreSQL (database)
- class-validator + class-transformer (DTO validation)
- Swagger (API documentation)

### DevOps

- Docker & Docker Compose
- pnpm (package manager)

---

## Frontend Architecture

### Component Strategy

- **Client Components** (`'use client'`) - Use by default for interactive pages and dashboard routes
  - Most dashboard pages use Client Components with TanStack Query
  - Example: `dashboard/*` routes, auth forms, data tables
- **Server Components** - Use for:
  - Static content pages
  - Async data fetching at route level (limited use in this project)
  - Layouts and providers
  - Performance optimization (rarely needed)

### File Structure

```
frontend/src/
├── app/[locale]/           # App Router with i18n
│   ├── (auth)/            # Auth routes group
│   ├── dashboard/         # Main dashboard routes
│   └── page.tsx           # Root page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layouts/           # Layout components (Sidebar, Header)
│   └── providers/         # React Query, Socket, etc.
├── hooks/
│   └── api/               # Custom hooks (useQuery, useMutation)
├── libs/
│   ├── apiClient.ts       # Axios instance
│   ├── serverApiClient.ts # For server-side calls
│   └── queryKeys.ts       # TanStack Query keys management
├── features/              # Feature-specific components & logic
└── generated/             # Auto-generated DTOs (via Orval)
```

### Data Fetching & State Management

1. **API Calls**: Always in hooks/services, never directly in components
   - Create hooks in `hooks/api/use*.ts`
   - Hooks use TanStack Query (`useQuery`, `useMutation`)
   - Example: `useRooms()`, `useBills()`, `useMaintenance()`

2. **TanStack Query Setup**:

   ```typescript
   // hooks/api/useRooms.ts
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

3. **Forms** (React Hook Form + Zod):
   - Define schema with Zod
   - Use `useForm()` with Zod resolver
   - Use `useMutation()` for mutations
   - Example: `RoomFormFields`, `BuildingFormFields`

### Styling & UI

- Use shadcn/ui components as base
- Style with Tailwind CSS (utility-first)
- Maintain consistency with existing components

### i18n (Intlayer)

- Routes use `[locale]` parameter: `/en/dashboard`, `/vi/dashboard`
- Use Intlayer hooks for translations

### Type Safety

- **Orval Integration**: Auto-generates DTOs from backend Swagger
  - Config: `orval.config.ts`
  - Output: `generated/model/` directory
  - Automatically synced via `pnpm orval`
  - Never manually edit generated files

---

## Backend Architecture

### NestJS Module Pattern

Each feature follows strict separation:

```
src/[feature]/
├── [feature].controller.ts    # Route handlers only (thin layer)
├── [feature].service.ts       # Business logic
├── [feature].module.ts        # Module definition
├── dto/
│   ├── create-[feature].dto.ts
│   ├── update-[feature].dto.ts
│   └── [feature]-query.dto.ts
└── [feature].service.spec.ts  # Unit tests
```

### Controller Rules

- **Thin layer**: Only handle routing and request/response mapping
- Delegate ALL business logic to services
- Use pipes for validation (@Pipe decorators)
- Example:
  ```typescript
  @Controller("rooms")
  export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get()
    findAll(@Query() query: RoomsQueryDto) {
      return this.roomsService.findAll(query); // Delegate to service
    }
  }
  ```

### Service Rules

- Contain ALL business logic
- Handle validation, permissions, calculations
- Use PrismaService for database operations
- Never expose Prisma entities directly - transform DTOs if needed
- Example:
  ```typescript
  @Injectable()
  export class RoomsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(currentUser: User, createRoomDto: CreateRoomDto): Promise<Room> {
      // Check permissions
      const building = await this.prisma.building.findUnique(...);
      if (building.landlordId !== currentUser.id) {
        throw new ForbiddenException();
      }
      // Business logic
      return this.prisma.room.create({ data: createRoomDto });
    }
  }
  ```

### Data Transfer Objects (DTOs)

- **Use class-validator decorators** (not Zod) for NestJS validation

  ```typescript
  export class CreateRoomDto {
    @IsNotEmpty()
    @IsString()
    buildingId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    area: number;
  }
  ```

- Create separate DTOs:
  - `CreateXDto` - POST request
  - `UpdateXDto` - PATCH request
  - `XQueryDto` - Query parameters

### Database

- Use Prisma for all database operations
- Define models in `prisma/schema.prisma`
- Generate migrations: `pnpm prisma migrate dev`
- Never expose Prisma models from controllers
- Use Prisma service: `PrismaService` (injected in services)

### API Design

- Follow REST conventions
- Use HTTP verbs correctly:
  - `GET /resource` - List
  - `GET /resource/:id` - Get one
  - `POST /resource` - Create
  - `PATCH /resource/:id` - Update
  - `DELETE /resource/:id` - Delete
- Return consistent response formats
- Handle errors explicitly:
  ```typescript
  throw new ForbiddenException("Not authorized");
  throw new BadRequestException("Invalid input");
  throw new NotFoundException("Resource not found");
  ```

### Testing

- Unit tests for services (most important)
- Use Jest: `pnpm test`
- Test files: `*.spec.ts`
- Example: `bills.service.spec.ts`

---

## API Contracts

### Response Format

- Always return consistent response structure
- Use DTOs for typed responses
- Document with Swagger decorators

### Error Handling

- Use NestJS built-in HTTP exceptions
- Include meaningful error messages
- Log errors server-side

### Swagger Documentation

- Decorators already in place
- Generate: `pnpm run start:dev` (auto-generates `swagger.json`)
- Use `@ApiOperation()`, `@ApiResponse()` for documentation

---

## Security Best Practices

### Frontend

- ❌ Never store secrets in frontend code
- ❌ Never trust client-provided file URLs
- ✅ Use HttpOnly cookies for auth tokens (if applicable)
- ✅ Validate user input with Zod
- ✅ Use HTTPS in production

### Backend

- ❌ Never expose Prisma entities directly from controllers
- ❌ Never expose database connection strings
- ✅ Validate ALL request input with class-validator
- ✅ Check user permissions in services
- ✅ Validate file uploads (type, size, content)
- ✅ Use environment variables for secrets
- ✅ Sanitize inputs before database queries
- ✅ Use prepared statements (Prisma handles this)

### File Uploads

```typescript
// Validate in service
const ALLOWED_MIMES = ["image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (!ALLOWED_MIMES.includes(file.mimetype)) {
  throw new BadRequestException("Invalid file type");
}
if (file.size > MAX_SIZE) {
  throw new BadRequestException("File too large");
}
```

---

## Development Workflow

### Setup

```bash
# Backend
cd backend
pnpm install
pnpm prisma migrate dev
pnpm seed

# Frontend
cd frontend
pnpm install
pnpm orval  # Generate types from backend
```

### Running Locally

```bash
# Start services
docker-compose up

# Backend (runs on :3001)
cd backend && pnpm start:dev

# Frontend (runs on :3000)
cd frontend && pnpm dev

# Generate types from updated API
pnpm orval
```

### Code Generation

- **Orval** (frontend): Generates DTOs from backend Swagger
  - Trigger: `pnpm orval`
  - Output: `frontend/src/generated/model/`
  - Run after backend API changes

---

## Common Patterns & Examples

### Frontend: Fetching & Displaying Data

```typescript
// Page component (Client Component)
'use client';

import { useRooms } from '@/hooks/api';

export default function RoomsPage() {
  const { data: rooms, isPending, error } = useRooms();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {rooms?.map(room => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
```

### Frontend: Forms

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  area: z.number().min(1, 'Must be > 0'),
});

type FormData = z.infer<typeof schema>;

export function RoomForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

### Backend: Service with Permissions

```typescript
@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: User, createBillDto: CreateBillDto): Promise<Bill> {
    // Fetch related data
    const room = await this.prisma.room.findUnique({
      where: { id: createBillDto.roomId },
      include: { building: true },
    });

    if (!room) throw new NotFoundException();

    // Check permissions
    if (currentUser.role === UserRole.LANDLORD) {
      if (room.building.landlordId !== currentUser.id) {
        throw new ForbiddenException();
      }
    }

    // Business logic
    const totalAmount =
      createBillDto.electricityAmount + createBillDto.waterAmount;

    // Create record
    return this.prisma.bill.create({
      data: {
        ...createBillDto,
        totalAmount,
      },
    });
  }
}
```

### Backend: DTO with Validation

```typescript
export class CreateBillDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsDateString()
  billingPeriod: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  waterAmount?: number;
}
```
