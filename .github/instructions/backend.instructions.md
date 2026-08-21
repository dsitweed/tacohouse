---
applyTo: "backend/**/*.ts"
---

# Backend Development Guidelines (NestJS)

## Architecture Overview

**Module Structure**:

```
src/[feature]/
├── [feature].controller.ts    # Route handlers (thin layer)
├── [feature].service.ts       # Business logic
├── [feature].module.ts        # Module definition
├── dto/
│   ├── create-[feature].dto.ts
│   ├── update-[feature].dto.ts
│   └── [feature]-query.dto.ts
└── [feature].service.spec.ts  # Unit tests
```

**Modules in Project**:
auth, bills, buildings, chat, dashboard, maintenance, notifications, payments, rentals, rooms, users, uploads, storage

---

## Controller Rules (Thin Layer)

### ✅ Do

- Handle HTTP routing only
- Delegate ALL business logic to services
- Map DTOs and return responses
- Use decorators: `@Get()`, `@Post()`, `@Patch()`, `@Delete()`
- Validate input with pipes: `@Query()`, `@Body()`, `@Param()`

### ❌ Don't

- Put business logic in controllers
- Access Prisma directly (`this.prisma.*`)
- Calculate values or validate complex rules
- Handle database transactions

**Example** ([backend/src/bills/bills.controller.ts](backend/src/bills/bills.controller.ts)):

```typescript
@Controller("bills")
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  findAll(@Query() query: BillsQueryDto) {
    // Thin layer - just delegate
    return this.billsService.findAll(query);
  }

  @Post()
  create(@Body() createBillDto: CreateBillDto) {
    // No business logic here
    return this.billsService.create(this.currentUser, createBillDto);
  }
}
```

---

## Service Rules (Business Logic)

### ✅ Do

- Contain ALL business logic
- Validate permissions (role-based access)
- Perform calculations
- Handle data transformations
- Use Prisma for database operations
- Throw meaningful exceptions
- Validate related entities before operations

### ❌ Don't

- Expose Prisma entities directly from responses
- Skip permission checks
- Return raw database errors
- Access external APIs directly (use dedicated services)

**Permission Check Pattern** ([backend/src/payments/payments.service.ts](backend/src/payments/payments.service.ts)):

```typescript
@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    currentUser: User,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    // 1. Fetch related entities
    const bill = await this.prisma.bill.findUnique({
      where: { id: createPaymentDto.billId },
      include: { room: { include: { building: true } } },
    });

    if (!bill) throw new NotFoundException("Bill not found");

    // 2. Check permissions
    if (currentUser.role === UserRole.LANDLORD) {
      // Landlord can only receive payments for their buildings
      if (bill.room.building.landlordId !== currentUser.id) {
        throw new ForbiddenException(
          "You can only receive payments for your buildings",
        );
      }
    } else if (currentUser.role === UserRole.TENANT) {
      // Tenant can only pay their own bills
      if (bill.tenantId !== currentUser.id) {
        throw new ForbiddenException("You can only pay your own bills");
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Invalid role");
    }

    // 3. Validate business logic
    if (createPaymentDto.amount > bill.totalAmount - bill.paidAmount) {
      throw new BadRequestException("Payment exceeds remaining balance");
    }

    // 4. Create record
    return this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        tenantId: currentUser.id,
        paidAt: new Date(),
      },
    });
  }
}
```

---

## Data Transfer Objects (DTOs)

### Validation with class-validator

**✅ Use class-validator decorators** (NOT Zod - only Zod for env vars)

```typescript
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from "class-validator";

export class CreateBillDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsDateString()
  billingPeriod: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  waterAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceFee?: number;
}
```

### DTO Naming Convention

- `Create[Entity]Dto` - POST request body
- `Update[Entity]Dto` - PATCH/PUT request body
- `[Entity]QueryDto` - GET query parameters
- `[Entity]ResponseDto` - Optional: custom response shape (rarely needed)

---

## Database Operations (Prisma)

### Rules

- ✅ Use only in services (never in controllers)
- ✅ Use `PrismaService` injected via dependency injection
- ✅ Include relationships with `include` when needed
- ✅ Use proper error handling
- ✅ Validate entities before operations

### Common Patterns

**Fetching with relationships**:

```typescript
const bill = await this.prisma.bill.findUnique({
  where: { id: billId },
  include: {
    room: {
      include: {
        building: true,
      },
    },
  },
});
```

**Querying with filters**:

```typescript
const bills = await this.prisma.bill.findMany({
  where: {
    AND: [
      query.roomId ? { roomId: query.roomId } : {},
      query.status ? { status: query.status } : {},
    ],
  },
  orderBy: { createdAt: "desc" },
  take: query.limit || 20,
  skip: ((query.page || 1) - 1) * (query.limit || 20),
});
```

**Transactions** (when needed):

```typescript
// Note: Project rarely uses transactions currently
await this.prisma.$transaction([
  this.prisma.bill.update({ ... }),
  this.prisma.payment.create({ ... }),
]);
```

---

## Error Handling

### Use NestJS Built-in Exceptions

```typescript
// Not found
throw new NotFoundException("Room not found");

// Permission denied
throw new ForbiddenException("You cannot access this resource");

// Invalid input
throw new BadRequestException("Amount must be positive");

// Server error
throw new InternalServerErrorException("Database error occurred");

// Conflict (duplicate, etc.)
throw new ConflictException("Email already exists");

// Unauthorized
throw new UnauthorizedException("Invalid credentials");
```

### Exception Properties

- Status code: Automatically set (404, 403, 400, etc.)
- Message: User-facing error message
- Logged: NestJS logs all exceptions server-side

---

## Dependency Injection

```typescript
@Injectable()
export class BillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roomsService: RoomsService, // Inject other services
  ) {}

  async create(currentUser: User, createBillDto: CreateBillDto) {
    // Services are automatically injected
    const room = await this.roomsService.findById(createBillDto.roomId);
    // ...
  }
}
```

### Module Definition

```typescript
@Module({
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService], // Export for other modules
})
export class BillsModule {}
```

---

## API Response Format

### Consistent Responses

- Return DTOs (generated from Swagger)
- Never expose raw Prisma objects
- Status codes are automatic (200 for GET/POST/PATCH, 201 for create)

```typescript
// ✅ Good
@Get(':id')
async getRoom(@Param('id') id: string): Promise<RoomResponseDto> {
  return this.roomsService.findById(id);
}

// ❌ Bad
@Get(':id')
async getRoom(@Param('id') id: string) {
  return this.prisma.room.findUnique({ where: { id } });  // Raw Prisma
}
```

---

## Testing Best Practices

See [testing.instructions.md](testing.instructions.md) for detailed testing guidelines.

**Quick Rules**:

- Test services (business logic)
- Mock Prisma calls
- Test permission checks thoroughly
- Use `pnpm test` to run tests

---

## Common Modules & Complexity

### High Complexity (permission-heavy):

- **Payments**: Handles role-based payment flows
- **Maintenance**: Role-based filtering + nested queries
- **Rentals**: Status validation + mutual exclusivity

### Medium Complexity:

- **Bills**: Calculations + landlord verification
- **Rooms**: Building ownership checks

### Lower Complexity:

- **Users**: Profile management
- **Buildings**: Landlord relationships

---

## Swagger Documentation

**Decorators** (already in place):

```typescript
@Controller("bills")
@ApiTags("Bills")
export class BillsController {
  @Get()
  @ApiOperation({ summary: "Get all bills" })
  @ApiResponse({ status: 200, description: "List of bills" })
  findAll(@Query() query: BillsQueryDto) {
    return this.billsService.findAll(query);
  }
}
```

**View Swagger**:

- Run: `pnpm start:dev`
- Access: `http://localhost:3001/api/docs`
- Generated: `swagger.json`

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Database setup
pnpm prisma migrate dev
pnpm prisma seed

# Development server
pnpm start:dev

# Run tests
pnpm test
pnpm test:watch
pnpm test:cov

# Format & lint
pnpm format
pnpm lint
```
