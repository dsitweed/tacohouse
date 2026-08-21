---
applyTo: "**/*.spec.ts", "**/*.test.ts", "**/*.test.tsx"
---

# Testing Guidelines (Frontend & Backend)

## Overview

Comprehensive testing strategy for TacoHouse project:

- **Backend (NestJS)**: Unit tests for services ✅ (26 spec files)
- **Frontend (Next.js/React)**: Unit & integration tests ⚠️ (setup needed)
- **Both**: E2E tests optional

---

# BACKEND TESTING (NestJS)

## Test Structure

**File Location**: `src/[feature]/[feature].service.spec.ts`

**Example**: [backend/src/bills/bills.service.spec.ts](backend/src/bills/bills.service.spec.ts)

### Jest Configuration

File: [backend/jest.config.js](backend/jest.config.js)

```javascript
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.(t|j)s",
    "!src/main.ts",
    "!src/**/*.module.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.dto.ts", // DTOs excluded from coverage
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};
```

### Test Commands

```bash
# Run all tests
pnpm test

# Watch mode (for development)
pnpm test:watch

# Coverage report
pnpm test:cov

# Debug mode
pnpm test:debug

# E2E tests
pnpm test:e2e
```

---

## Unit Testing Pattern

### Basic Test Structure

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { BillsService } from "./bills.service";
import { PrismaService } from "@/prisma/prisma.service";

describe("BillsService", () => {
  let service: BillsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        {
          provide: PrismaService,
          useValue: {
            bill: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            room: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BillsService>(BillsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
```

---

## Service Testing

### What to Test

✅ **Test these**:

- ✓ Business logic (calculations, validations)
- ✓ Permission checks (role-based access)
- ✓ Error handling (exceptions thrown)
- ✓ Database interactions (mocked)

❌ **Don't test**:

- ❌ Prisma library itself
- ❌ HTTP layer (controllers test that)
- ❌ Node.js built-ins

### Permission Test Example

```typescript
describe("BillsService.create", () => {
  it("should throw ForbiddenException if landlord owns different building", async () => {
    const currentUser = { id: "landlord-1", role: UserRole.LANDLORD };
    const createBillDto: CreateBillDto = { roomId: "room-1" /* ... */ };

    // Mock: room belongs to building owned by different landlord
    jest.spyOn(prisma.room, "findUnique").mockResolvedValue({
      id: "room-1",
      building: { id: "building-1", landlordId: "landlord-2" },
    });

    // Assert: ForbiddenException thrown
    await expect(service.create(currentUser, createBillDto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("should create bill if landlord owns building", async () => {
    const currentUser = { id: "landlord-1", role: UserRole.LANDLORD };
    const createBillDto: CreateBillDto = { roomId: "room-1" /* ... */ };

    // Mock: room belongs to landlord's building
    jest.spyOn(prisma.room, "findUnique").mockResolvedValue({
      id: "room-1",
      building: { id: "building-1", landlordId: "landlord-1" },
    });

    jest.spyOn(prisma.bill, "create").mockResolvedValue({
      id: "bill-1",
      roomId: "room-1",
      /* ... */
    });

    // Act
    const result = await service.create(currentUser, createBillDto);

    // Assert
    expect(result).toBeDefined();
    expect(prisma.bill.create).toHaveBeenCalled();
  });
});
```

### Validation Test Example

```typescript
describe("BillsService.create - Validation", () => {
  it("should throw BadRequestException for negative amount", async () => {
    const currentUser = { id: "user-1", role: UserRole.ADMIN };
    const invalidDto = { /* ...dto */ electricityAmount: -100 };

    // Validation happens in DTO or service
    // This test ensures service catches it
    await expect(service.create(currentUser, invalidDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should calculate totalAmount correctly", async () => {
    const createBillDto = {
      monthlyRent: 5000,
      electricityAmount: 500,
      waterAmount: 300,
    };

    jest.spyOn(prisma.bill, "create").mockResolvedValue({
      totalAmount: 5800, // Expected sum
    });

    const result = await service.create(currentUser, createBillDto);
    expect(result.totalAmount).toBe(5800);
  });
});
```

---

## Mocking Prisma

### Mock Setup

```typescript
// Mock PrismaService in test module
const mockPrismaService = {
  bill: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  room: {
    findUnique: jest.fn(),
  },
  building: {
    findUnique: jest.fn(),
  },
};

const module: TestingModule = await Test.createTestingModule({
  providers: [
    BillsService,
    { provide: PrismaService, useValue: mockPrismaService },
  ],
}).compile();
```

### Mock Patterns

```typescript
// Mock successful response
jest.spyOn(prisma.bill, "create").mockResolvedValue({
  id: "bill-1",
  roomId: "room-1",
  /* ...data */
});

// Mock error
jest.spyOn(prisma.bill, "findUnique").mockResolvedValue(null);

// Mock complex query with relationships
jest.spyOn(prisma.room, "findUnique").mockResolvedValue({
  id: "room-1",
  number: "101",
  building: {
    id: "building-1",
    landlordId: "landlord-1",
  },
});

// Mock list response
jest
  .spyOn(prisma.bill, "findMany")
  .mockResolvedValue([
    { id: "bill-1" /* ...data */ },
    { id: "bill-2" /* ...data */ },
  ]);

// Verify mock was called
expect(prisma.bill.create).toHaveBeenCalledWith(
  expect.objectContaining({ roomId: "room-1" }),
);
```

---

## Complex Module Tests

### Payments Service (Role-Based Logic)

```typescript
describe("PaymentsService", () => {
  describe("create - Permission Checks", () => {
    it("should allow ADMIN to create payment for any tenant", async () => {
      const admin = { id: "admin-1", role: UserRole.ADMIN };
      const dto = { billId: "bill-1", amount: 1000 };

      jest.spyOn(prisma.bill, "findUnique").mockResolvedValue({
        id: "bill-1",
        room: { building: { landlordId: "other-landlord" } },
      });

      jest
        .spyOn(prisma.payment, "create")
        .mockResolvedValue({ id: "payment-1" });

      await service.create(admin, dto);
      expect(prisma.payment.create).toHaveBeenCalled();
    });

    it("should only allow LANDLORD to receive for their building", async () => {
      const landlord = { id: "landlord-1", role: UserRole.LANDLORD };

      jest.spyOn(prisma.bill, "findUnique").mockResolvedValue({
        id: "bill-1",
        room: { building: { landlordId: "landlord-2" } }, // Different landlord
      });

      await expect(service.create(landlord, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should only allow TENANT to pay own bills", async () => {
      const tenant = { id: "tenant-1", role: UserRole.TENANT };

      jest.spyOn(prisma.bill, "findUnique").mockResolvedValue({
        id: "bill-1",
        tenantId: "tenant-2", // Different tenant
        room: { building: { landlordId: "landlord-1" } },
      });

      await expect(service.create(tenant, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
```

---

## E2E Testing

### E2E Test Structure

File: [backend/test/app.e2e-spec.ts](backend/test/app.e2e-spec.ts)

**Using Supertest** (HTTP testing library):

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /rooms should return 200", async () => {
    const response = await request(app.getHttpServer())
      .get("/rooms")
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it("POST /rooms with invalid data should return 400", async () => {
    await request(app.getHttpServer())
      .post("/rooms")
      .send({
        /* invalid data */
      })
      .expect(400);
  });
});
```

---

# FRONTEND TESTING (Next.js/React)

## Setup (Currently Needed)

### 1. Install Testing Dependencies

```bash
cd frontend
pnpm add -D @testing-library/react @testing-library/jest-dom jest @types/jest jest-environment-jsdom
```

### 2. Create Jest Configuration

File: `frontend/jest.config.ts`

```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};

export default createJestConfig(config);
```

File: `frontend/jest.setup.ts`

```typescript
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
}));

// Mock TanStack Query
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));
```

### 3. Add Test Scripts

File: `frontend/package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

---

## React Component Testing

### What to Test

✅ **Test these**:

- ✓ User interactions (clicks, form submissions)
- ✓ Conditional rendering (if/else, ternary)
- ✓ Props handling
- ✓ Hook behavior (useQuery, useForm)
- ✓ Error states

❌ **Don't test**:

- ❌ Third-party libraries (TanStack Query, React Hook Form)
- ❌ UI library components (shadcn/ui)
- ❌ CSS styling

### Basic Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { RoomCard } from './RoomCard';

describe('RoomCard', () => {
  const mockRoom = {
    id: '1',
    number: '101',
    area: 25,
    status: 'AVAILABLE',
  };

  it('should render room number', () => {
    render(<RoomCard room={mockRoom} />);
    expect(screen.getByText('Room 101')).toBeInTheDocument();
  });

  it('should display available status', () => {
    render(<RoomCard room={mockRoom} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should show occupied status when room is occupied', () => {
    const occupiedRoom = { ...mockRoom, status: 'OCCUPIED' };
    render(<RoomCard room={occupiedRoom} />);
    expect(screen.getByText('Occupied')).toBeInTheDocument();
  });
});
```

### Testing Hooks (useQuery)

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useRooms } from "@/hooks/api/useRooms";
import * as queryModule from "@tanstack/react-query";

jest.mock("@tanstack/react-query");

describe("useRooms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return loading state initially", () => {
    const useQueryMock = jest.spyOn(queryModule, "useQuery");
    useQueryMock.mockReturnValue({
      data: undefined,
      isPending: true,
      error: null,
    });

    const { result } = renderHook(() => useRooms());

    expect(result.current.isPending).toBe(true);
  });

  it("should return rooms data when loaded", async () => {
    const mockRooms = [
      { id: "1", number: "101", area: 25 },
      { id: "2", number: "102", area: 30 },
    ];

    const useQueryMock = jest.spyOn(queryModule, "useQuery");
    useQueryMock.mockReturnValue({
      data: mockRooms,
      isPending: false,
      error: null,
    });

    const { result } = renderHook(() => useRooms());

    expect(result.current.data).toEqual(mockRooms);
  });

  it("should return error state on failure", () => {
    const mockError = new Error("Failed to fetch");
    const useQueryMock = jest.spyOn(queryModule, "useQuery");
    useQueryMock.mockReturnValue({
      data: undefined,
      isPending: false,
      error: mockError,
    });

    const { result } = renderHook(() => useRooms());

    expect(result.current.error).toBe(mockError);
  });
});
```

### Testing Forms (React Hook Form + Zod)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomForm } from './RoomForm';
import userEvent from '@testing-library/user-event';

describe('RoomForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display validation error for empty required field', async () => {
    const user = userEvent.setup();
    render(<RoomForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('Create Room');
    await user.click(submitButton);

    // Wait for validation error
    await screen.findByText('Room number is required');
    expect(screen.getByText('Room number is required')).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<RoomForm onSubmit={mockOnSubmit} />);

    const numberInput = screen.getByPlaceholderText('101');
    const areaInput = screen.getByPlaceholderText('25');
    const submitButton = screen.getByText('Create Room');

    await user.type(numberInput, '101');
    await user.type(areaInput, '25');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          number: '101',
          area: 25,
        })
      );
    });
  });
});
```

---

## Testing Custom Hooks

### Test Query Hook

```typescript
import { renderHook } from "@testing-library/react";
import { useMutation } from "@tanstack/react-query";
import { useCreateRoom } from "@/hooks/api/useCreateRoom";

jest.mock("@tanstack/react-query");

describe("useCreateRoom", () => {
  it("should call API on mutation", async () => {
    const mockMutate = jest.fn();
    jest.spyOn(queryModule, "useMutation").mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      error: null,
    });

    const { result } = renderHook(() => useCreateRoom());
    result.current.mutate({ number: "101", area: 25 });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ number: "101" }),
    );
  });
});
```

---

## Best Practices

### ✅ Do

- Test behavior, not implementation details
- Use semantic queries: `getByRole`, `getByLabelText`
- Mock external API calls and hooks
- Test error and loading states
- Keep tests focused and isolated
- Use descriptive test names

### ❌ Don't

- Test implementation details (internal state, private methods)
- Query by CSS classes or IDs
- Test UI libraries or third-party code
- Write overly complex tests
- Ignore error cases
- Test styling

---

## Test Coverage Goals

**Backend**:

- Aim for 80%+ coverage on services
- Focus on: permission checks, calculations, error handling
- Don't need coverage on: DTOs, modules, interfaces

**Frontend**:

- Once setup: 70%+ coverage on custom hooks
- Focus on: form validation, data fetching, user interactions
- Don't need: UI components, styling

---

## Running Tests

### Backend

```bash
cd backend

# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# Specific file
pnpm test bills.service.spec.ts
```

### Frontend (After Setup)

```bash
cd frontend

# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# Specific file
pnpm test RoomCard.spec.tsx
```

---

## CI/CD Integration

**Add to GitHub Actions**:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)
