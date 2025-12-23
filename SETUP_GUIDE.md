# Setup Guide - Tacohouse Project

## 🚀 Quick Start

### Chạy cả Backend và Frontend

Từ thư mục root (`/tacohouse`):

```bash
npm run dev
```

Lệnh này sẽ:
1. Build shared types package
2. Chạy backend trên port 3001 (hoặc PORT trong .env)
3. Chạy frontend trên port 3000

### Chạy riêng từng phần

```bash
# Chỉ chạy backend
npm run dev:backend

# Chỉ chạy frontend
npm run dev:frontend
```

## 📦 Shared Types Package

Dự án sử dụng **@tacohouse/shared** để đảm bảo Frontend và Backend dùng chung types.

### Cấu trúc

```
shared/
├── src/
│   └── index.ts          # Export Prisma types và enums
├── dist/                 # Compiled output
└── package.json
```

### Build Shared Types

```bash
# Build một lần
npm run shared:build

# Watch mode (tự động rebuild khi có thay đổi)
npm run shared:watch
```

### Sử dụng trong Backend

```typescript
import { User, Building, UserRole } from '@tacohouse/shared';
```

### Sử dụng trong Frontend

```typescript
import { User, Building, UserRole } from '@tacohouse/shared';
// hoặc
import type { User, Building } from '@/types/shared';
```

## 🔧 Development Workflow

### 1. Khi thay đổi Prisma Schema

```bash
# Generate Prisma client
npm run prisma:generate

# Build shared types để frontend có thể dùng
npm run shared:build
```

### 2. Khi thêm types mới vào shared

1. Thêm export vào `shared/src/index.ts`
2. Build: `npm run shared:build`
3. Frontend và Backend sẽ tự động có types mới

### 3. Khi chạy development

```bash
# Terminal 1: Watch shared types
npm run shared:watch

# Terminal 2: Chạy dev
npm run dev
```

## 📁 Project Structure

```
tacohouse/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        ✅ Implemented
│   │   ├── users/       ✅ Implemented
│   │   ├── buildings/   ✅ Implemented
│   │   ├── rooms/       ✅ Implemented
│   │   ├── rentals/     ❌ Missing
│   │   ├── bills/       ❌ Missing
│   │   ├── payments/     ❌ Missing
│   │   ├── maintenance/ ❌ Missing
│   │   ├── chat/        ❌ Missing
│   │   └── notifications/ ❌ Missing
│   └── prisma/
│       └── schema.prisma
├── frontend/            # Next.js Frontend
│   ├── src/
│   │   ├── hooks/api/  ✅ TanStack Query hooks
│   │   ├── types/      ✅ Types (should use @tacohouse/shared)
│   │   └── lib/        ✅ API client
│   └── package.json
├── shared/              # Shared Types Package
│   ├── src/
│   │   └── index.ts    # Export Prisma types
│   └── package.json
└── package.json         # Root workspace
```

## ✅ Checklist

### Backend Status
- [x] Auth module
- [x] Users module
- [x] Buildings module
- [x] Rooms module
- [ ] Rentals module
- [ ] Bills module
- [ ] Payments module
- [ ] Maintenance module
- [ ] Chat module
- [ ] Notifications module

### Frontend Status
- [x] TanStack Query setup
- [x] API hooks for implemented modules
- [x] QueryProvider setup
- [ ] Update to use @tacohouse/shared types
- [ ] Components for all modules

### Infrastructure
- [x] Shared types package
- [x] Prisma setup
- [x] Database migrations
- [x] Seed data
- [x] Development scripts

## 🔍 Kiểm tra Types Consistency

Để đảm bảo Frontend và Backend dùng chung types:

1. **Backend**: Import từ `@tacohouse/shared`
   ```typescript
   import { User, Building } from '@tacohouse/shared';
   ```

2. **Frontend**: Import từ `@tacohouse/shared` hoặc `@/types/shared`
   ```typescript
   import { User, Building } from '@tacohouse/shared';
   // hoặc
   import type { User, Building } from '@/types/shared';
   ```

3. **Kiểm tra**: Đảm bảo không có duplicate type definitions trong `frontend/src/types/index.ts`

## 📝 Notes

- Shared types được generate từ Prisma schema
- Khi schema thay đổi, cần rebuild shared package
- Frontend hooks đã được setup với TanStack Query
- Backend còn thiếu nhiều modules quan trọng (xem BACKEND_STATUS.md)

## 🐛 Troubleshooting

### Lỗi: Cannot find module '@tacohouse/shared'

```bash
# Build shared package
npm run shared:build

# Hoặc install dependencies
pnpm install
```

### Lỗi: Types không khớp giữa Frontend và Backend

```bash
# Rebuild shared types
npm run shared:build

# Restart dev servers
npm run dev
```

### Backend không chạy

```bash
# Kiểm tra PORT trong .env
# Mặc định: 3001

# Chạy riêng backend để xem lỗi
npm run dev:backend
```

