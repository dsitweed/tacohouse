# Types Migration Guide

## Mục tiêu

Đảm bảo Frontend và Backend sử dụng **chung một bộ types** từ `@tacohouse/shared` để:
- ✅ Tránh mismatch types giữa Frontend và Backend
- ✅ Type safety tốt hơn
- ✅ Dễ maintain và refactor
- ✅ Tự động sync khi Prisma schema thay đổi

## Cấu trúc Types

### Shared Package (`shared/src/index.ts`)
- Export tất cả Prisma types và enums
- Types được generate từ Prisma schema
- Single source of truth

### Frontend Types
- `frontend/src/types/shared.ts` - Re-export từ @tacohouse/shared
- `frontend/src/types/api.ts` - API request/response types (sử dụng shared types)
- `frontend/src/types/index.ts` - **DEPRECATED** - sẽ được migrate sang shared

## Migration Steps

### 1. Backend (✅ Đã hoàn thành)

Backend đã sử dụng types từ shared:

```typescript
// ✅ Correct
import { User, Building, UserRole } from '@tacohouse/shared';

// ❌ Wrong - không dùng local types
import { User } from './types/user.type';
```

### 2. Frontend Hooks (🔄 Đang migrate)

Các hooks cần được cập nhật:

```typescript
// ✅ Correct - Import từ shared
import type { User, Building } from '@tacohouse/shared';
import type { LoginRequest, LoginResponse } from '@/types/api';

// ❌ Wrong - Import từ local types
import type { User, Building } from '@/types/index';
```

### 3. Frontend Components (📝 Cần migrate)

Components cần được cập nhật:

```typescript
// ✅ Correct
import type { User, Room } from '@tacohouse/shared';

// ❌ Wrong
import type { User, Room } from '@/types';
```

## Checklist Migration

### Backend
- [x] Auth module sử dụng shared types
- [x] Users module sử dụng shared types
- [x] Buildings module sử dụng shared types
- [x] Rooms module sử dụng shared types
- [ ] Rentals module (chưa có)
- [ ] Bills module (chưa có)
- [ ] Payments module (chưa có)
- [ ] Maintenance module (chưa có)
- [ ] Chat module (chưa có)
- [ ] Notifications module (chưa có)

### Frontend Hooks
- [x] use-auth.ts - Updated
- [ ] use-buildings.ts - Cần update
- [ ] use-rooms.ts - Cần update
- [ ] use-rentals.ts - Cần update
- [ ] use-bills.ts - Cần update
- [ ] use-payments.ts - Cần update
- [ ] use-maintenance.ts - Cần update
- [ ] use-chat.ts - Cần update

### Frontend Types
- [x] types/shared.ts - Created
- [x] types/api.ts - Updated to use shared
- [ ] types/index.ts - **DEPRECATED** - Cần migrate hoặc xóa

## Cách sử dụng

### Import Entity Types

```typescript
// ✅ Recommended
import type { User, Building, Room } from '@tacohouse/shared';

// ✅ Alternative (re-export)
import type { User, Building, Room } from '@/types/shared';
```

### Import Enums

```typescript
// ✅ Recommended
import { UserRole, RoomStatus, BillStatus } from '@tacohouse/shared';

// ✅ Alternative
import { UserRole, RoomStatus } from '@/types/shared';
```

### Import API Types

```typescript
// API request/response types (không có trong Prisma)
import type {
  LoginRequest,
  LoginResponse,
  CreateBuildingRequest,
} from '@/types/api';
```

## Lưu ý

1. **Entity Types** (User, Building, Room, etc.) → Dùng từ `@tacohouse/shared`
2. **Enums** (UserRole, RoomStatus, etc.) → Dùng từ `@tacohouse/shared`
3. **API Types** (Request/Response DTOs) → Dùng từ `@/types/api` (sử dụng shared types bên trong)
4. **Local Types** → Chỉ dùng cho component-specific types

## Khi Prisma Schema thay đổi

1. Update `backend/prisma/schema.prisma`
2. Run `npm run prisma:generate`
3. Run `npm run shared:build`
4. Types sẽ tự động sync cho cả Frontend và Backend

## Troubleshooting

### Lỗi: Type không khớp

```bash
# Rebuild shared types
npm run shared:build

# Restart TypeScript server trong IDE
```

### Lỗi: Cannot find module '@tacohouse/shared'

```bash
# Install dependencies
pnpm install

# Build shared package
npm run shared:build
```

### Types không update sau khi thay đổi schema

```bash
# 1. Generate Prisma client
npm run prisma:generate

# 2. Build shared package
npm run shared:build

# 3. Restart dev servers
npm run dev
```

