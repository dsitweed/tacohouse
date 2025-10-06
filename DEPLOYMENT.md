# 🚀 Quick Deployment Guide

## Tổng quan Deployment với Shared Package

```
┌─────────────┐
│   Source    │
│  (monorepo) │
└──────┬──────┘
       │
       ├─── shared/         ← Types package
       ├─── backend/        ← NestJS API
       └─── frontend/       ← Next.js App
       │
       ▼
┌─────────────────────┐
│  Build Process      │
├─────────────────────┤
│ 1. Install deps     │
│ 2. Build shared     │ ← Phải build TRƯỚC
│ 3. Generate Prisma  │
│ 4. Build backend    │
│ 5. Build frontend   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Deployment         │
├─────────────────────┤
│ Backend:            │
│  - Docker image     │
│  - Chứa shared/     │
│  - Run migrations   │
│                     │
│ Frontend:           │
│  - Docker image     │
│  - Chứa shared/     │
│  - Serve static     │
└─────────────────────┘
```

---

## 🎯 Key Points

### 1. **Shared Package PHẢI được build trước**
```bash
# ✅ ĐÚNG
cd shared && pnpm build
cd backend && pnpm build

# ❌ SAI
cd backend && pnpm build  # Sẽ fail vì shared chưa build
```

### 2. **Cả BE và FE đều cần shared package**
```dockerfile
# Backend Dockerfile
COPY shared/ ./shared/          ← Phải copy
RUN cd shared && pnpm build     ← Phải build

# Frontend Dockerfile  
COPY shared/ ./shared/          ← Phải copy
RUN cd shared && pnpm build     ← Phải build
```

### 3. **Workspace dependencies tự động hoạt động**
- `@tacohouse/shared` resolve tự động trong Docker
- Không cần publish lên npm
- Không cần thay đổi imports

---

## ⚡ Quick Commands

### Development
```bash
# Start all services
pnpm dev

# Rebuild shared when schema changes
cd backend && pnpm prisma migrate dev
cd ../shared && pnpm build
```

### Production Deploy
```bash
# Option 1: Docker (Easiest)
cp .env.production.example .env.production
./scripts/deploy.sh all
./scripts/health-check.sh

# Option 2: Manual
pnpm install
cd shared && pnpm build
cd ../backend && pnpm prisma generate && pnpm build
cd ../frontend && pnpm build

# Start services
cd backend && node dist/main.js
cd frontend && pnpm start
```

### Docker Commands
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Stop all
docker-compose -f docker-compose.prod.yml down

# Restart single service
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 📋 Pre-deployment Checklist

- [ ] `shared/` package builds successfully
- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] Environment variables configured
- [ ] Database accessible
- [ ] Prisma migrations ready
- [ ] Health endpoints working
- [ ] CORS configured correctly
- [ ] API URL set correctly in frontend

---

## 🏗️ Build Order (QUAN TRỌNG!)

```
1. shared/          ← Build FIRST
   ↓
2. backend/         ← Needs shared types
   ├─ prisma generate
   └─ build
   ↓
3. frontend/        ← Needs shared types
   └─ build
```

**Lý do:**
- Backend import từ `@tacohouse/shared` 
- Frontend import từ `@tacohouse/shared`
- Nếu shared chưa build → import fail → build fail

---

## 🐛 Common Issues

### Issue 1: "Cannot find module '@tacohouse/shared'"

**Nguyên nhân:** Shared chưa được build

**Giải pháp:**
```bash
cd shared
pnpm build
```

### Issue 2: "Prisma Client not found"

**Nguyên nhân:** Prisma chưa generate

**Giải pháp:**
```bash
cd backend
pnpm prisma generate
```

### Issue 3: Frontend build fails with type errors

**Nguyên nhân:** Shared types outdated

**Giải pháp:**
```bash
cd backend
pnpm prisma generate  # Generate latest types
cd ../shared
pnpm build           # Build shared package
cd ../frontend
pnpm build          # Now frontend can build
```

### Issue 4: Docker build fails

**Nguyên nhân:** Workspace context sai

**Giải pháp:**
```bash
# Build from ROOT, not from subdirectory
cd /path/to/tacohouse  # Root of monorepo
docker build -f backend/Dockerfile.prod -t backend .
docker build -f frontend/Dockerfile.prod -t frontend .
```

---

## 🌐 Deployment Options

### Option 1: Docker (Recommended) ⭐
```bash
./scripts/deploy.sh all
```
- ✅ Đơn giản nhất
- ✅ Reproducible
- ✅ Phù hợp VPS/self-hosted

### Option 2: Vercel + Railway
```bash
# Frontend → Vercel
# Backend → Railway/Render
```
- ✅ Managed services
- ✅ Auto-scaling
- ✅ Free tier available

### Option 3: AWS/GCP/Azure
```bash
# Use ECS/Cloud Run/Container Apps
```
- ✅ Enterprise-grade
- ✅ Highly scalable
- ⚠️ Phức tạp hơn

---

## 📊 Deployment Strategies

### Strategy A: Monorepo in Docker (Current)
```
✅ Simple setup
✅ Workspace works naturally
⚠️ Larger images (~300-500MB per service)
```

### Strategy B: Separate with Shared Artifact
```
✅ Smaller images
⚠️ More complex build
⚠️ Need CI/CD pipeline
```

**Recommendation:** Start với Strategy A, chuyển sang B khi scale up.

---

## 🎯 Production URLs

After deployment:
- **Backend API:** http://localhost:3001 (or your domain)
- **Frontend:** http://localhost:3000 (or your domain)
- **Database:** postgres:5432 (internal)
- **Redis:** redis:6379 (internal)

---

## 📚 More Info

- Full guide: [documents/9.deployment-guide.md](documents/9.deployment-guide.md)
- Docker files: `backend/Dockerfile.prod`, `frontend/Dockerfile.prod`
- Compose file: `docker-compose.prod.yml`
- Scripts: `scripts/deploy.sh`, `scripts/health-check.sh`

---

## 🚀 Let's Deploy!

```bash
# 1. Setup environment
cp .env.production.example .env.production
vim .env.production  # Edit values

# 2. Deploy
./scripts/deploy.sh all

# 3. Verify
./scripts/health-check.sh

# 4. Check
open http://localhost:3000  # Frontend
open http://localhost:3001  # Backend API
```

**Done! 🎉**
