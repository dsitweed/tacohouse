# @tacohouse/shared

Shared types and utilities package for Tacohouse monorepo.

## Features

- Prisma-generated types exported for both backend and frontend
- Type-safe enums and models
- Centralized type definitions

## Usage

### In Backend

```typescript
import { User, UserRole, BillStatus } from '@tacohouse/shared';
```

### In Frontend

```typescript
import { User, UserRole, BillStatus } from '@tacohouse/shared';
```

## Development

```bash
# Generate Prisma types
pnpm prisma:generate

# Build the package
pnpm build

# Watch mode
pnpm watch
```
