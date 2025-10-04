# Tacohouse - Hệ Thống Quản Lý Nhà Trọ

## 📚 Mục Lục

- [Tacohouse - Hệ Thống Quản Lý Nhà Trọ](#tacohouse---hệ-thống-quản-lý-nhà-trọ)
  - [📚 Mục Lục](#-mục-lục)
  - [1. Tổng Quan Dự Án](#1-tổng-quan-dự-án)
  - [2. Tính Năng Chính](#2-tính-năng-chính)
    - [2.1. Quản Lý Người Dùng](#21-quản-lý-người-dùng)
    - [2.2. Quản Lý Tòa Nhà \& Phòng](#22-quản-lý-tòa-nhà--phòng)
    - [2.3. Hệ Thống Thanh Toán Phức Tạp](#23-hệ-thống-thanh-toán-phức-tạp)
    - [2.4. Tính Năng Giao Tiếp](#24-tính-năng-giao-tiếp)
    - [2.5. Báo Cáo \& Lịch Sử](#25-báo-cáo--lịch-sử)
  - [3. Tech Stack](#3-tech-stack)
    - [3.1. Frontend (NextJS 14)](#31-frontend-nextjs-14)
    - [3.2. Backend (NestJS 10)](#32-backend-nestjs-10)
    - [3.3. Database \& Infrastructure](#33-database--infrastructure)
    - [3.4. Development Tools](#34-development-tools)
  - [4. Cấu Trúc Dự Án](#4-cấu-trúc-dự-án)
  - [5. Cài Đặt \& Phát Triển](#5-cài-đặt--phát-triển)
    - [5.1. Prerequisites](#51-prerequisites)
    - [5.2. Quick Start](#52-quick-start)
    - [5.3. Available Scripts](#53-available-scripts)
  - [6. Database Schema](#6-database-schema)
    - [6.1. Core Entities](#61-core-entities)
    - [6.2. Key Relationships](#62-key-relationships)
  - [7. Authentication \& Authorization](#7-authentication--authorization)
    - [7.1. JWT Strategy](#71-jwt-strategy)
    - [7.2. Role Permissions](#72-role-permissions)
  - [8. System design documentations](#8-system-design-documentations)
    - [8.0. App desciption](#80-app-desciption)
    - [8.1. Business Requirement Document (BRD)](#81-business-requirement-document-brd)
    - [8.2. Use case Diagram](#82-use-case-diagram)
    - [8.3. Screen Transition Diagram](#83-screen-transition-diagram)
    - [8.4. System Architecture Document](#84-system-architecture-document)
    - [8.5. Database Design Document](#85-database-design-document)
    - [8.6. API Specification Document](#86-api-specification-document)
    - [8.7. Security Design Document](#87-security-design-document)
  - [9. Deployment](#9-deployment)
    - [9.1. Production Environment](#91-production-environment)
    - [9.2. Environment Variables](#92-environment-variables)
  - [10. Contributing](#10-contributing)
  - [11. License](#11-license)
  - [12. Support](#12-support)
---

## 1. Tổng Quan Dự Án

Tacohouse là hệ thống quản lý nhà trọ cho thuê full-stack hiện đại, được xây dựng với NextJS frontend và NestJS backend. Hệ thống quản lý nhiều tòa nhà, phòng, người thuê, chủ nhà và hóa đơn thanh toán phức tạp hàng tháng.

## 2. Tính Năng Chính

### 2.1. Quản Lý Người Dùng
- **3 Role chính**: Admin, Người thuê phòng, Chủ nhà
- **Authentication**: JWT + Passport
- **Authorization**: Role-based access control
- **Profile Management**: Ảnh căn cước, thông tin cá nhân

### 2.2. Quản Lý Tòa Nhà & Phòng
- **Multi-building management**: Nhiều tòa nhà, mỗi tòa có nhiều phòng
- **Room status tracking**: Trống, đang thuê, tuyển người mới
- **Equipment management**: Quản lý thiết bị trong phòng
- **Advance notice system**: Báo trước 1 tháng khi trả phòng

### 2.3. Hệ Thống Thanh Toán Phức Tạp
- **2 loại phòng**: Toàn quyền (chỉ tiền phòng) và Bán quyền (nhiều loại phí)
- **Utility bills**: Điện, nước, gas với giá đơn vị theo tòa nhà
- **Monthly billing**: Tự động tạo hóa đơn hàng tháng
- **Payment confirmation**: Xác nhận 2 chiều (người thuê + chủ nhà)
- **Deposit management**: Quản lý tiền cọc
- **Payment integration**: Stripe, chuyển khoản, tiền mặt

### 2.4. Tính Năng Giao Tiếp
- **Real-time chat**: 1vs1 và group chat theo tòa nhà
- **Notifications**: Email + in-app notifications
- **Maintenance requests**: Yêu cầu sửa chữa từ người thuê
- **Announcements**: Thông báo từ chủ nhà

### 2.5. Báo Cáo & Lịch Sử
- **Payment history**: Lịch sử thanh toán chi tiết
- **Utility consumption**: Theo dõi tiêu thụ điện, nước, gas
- **Billing reports**: Báo cáo thu chi theo tháng/năm

## 3. Tech Stack

### 3.1. Frontend (NextJS 14)
```json
{
  "framework": "NextJS 14 với App Router",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "components": "Shadcn/ui",
  "forms": "React Hook Form + Zod validation",
  "state": "Zustand (client) + Tanstack Query (server)",
  "realtime": "Socket.io Client",
  "notifications": "React Hot Toast",
  "payments": "Stripe React components",
  "http": "Axios"
}
```

### 3.2. Backend (NestJS 10)
```json
{
  "framework": "NestJS 10 với TypeScript",
  "database": "PostgreSQL với Prisma ORM",
  "authentication": "JWT + Passport (Local & JWT strategies)",
  "realtime": "Socket.io",
  "queue": "Bull Queue với Redis",
  "email": "Nodemailer",
  "upload": "Multer + Cloudinary",
  "payments": "Stripe",
  "validation": "Class Validator + Class Transformer"
}
```

### 3.3. Database & Infrastructure
```json
{
  "database": "PostgreSQL (main database)",
  "cache": "Redis (sessions, queue, cache)",
  "storage": "Cloudinary (images, documents)",
  "containerization": "Docker & Docker Compose",
  "monitoring": "Prisma Studio (development)"
}
```

### 3.4. Development Tools
```json
{
  "formatting": "ESLint + Prettier",
  "git": "Husky + lint-staged",
  "testing": "Jest (unit) + Playwright (e2e)",
  "development": "Concurrently (run both servers)",
  "components": "Storybook (UI documentation)"
}
```

## 4. Cấu Trúc Dự Án

```
tacohouse/
├── frontend/                 # NextJS App
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/            # Utilities, API client
│   │   ├── stores/         # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   ├── database/       # Prisma schema & migrations
│   │   └── config/         # Configuration
│   ├── prisma/             # Database schema
│   └── package.json
├── docker-compose.yml      # Local development services
├── package.json           # Root workspace config
└── README.md
```

## 5. Cài Đặt & Phát Triển

### 5.1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm hoặc yarn

### 5.2. Quick Start
```bash
# Clone repository
git clone <repo-url>
cd tacohouse

# Install dependencies
npm install

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Start PostgreSQL và Redis (with Docker)
docker-compose up -d

# Setup database
cd backend
npx prisma migrate dev
npx prisma db seed

# Start development servers
cd ..
npm run dev
```

### 5.3. Available Scripts
```bash
npm run dev          # Start both frontend & backend in development
npm run build        # Build both applications
npm run start        # Start both applications in production
npm run lint         # Lint both applications
npm run test         # Run tests for both applications
```

## 6. Database Schema

### 6.1. Core Entities
- **Users**: Admin, Tenants, Landlords
- **Buildings**: Owned by landlords
- **Rooms**: Belong to buildings
- **Rentals**: Tenant-Room relationships
- **Bills**: Monthly billing with complex calculations
- **Payments**: Payment history and confirmations
- **Messages**: Chat system
- **Notifications**: System notifications

### 6.2. Key Relationships
- One Landlord → Many Buildings
- One Building → Many Rooms  
- One Room → Many Tenants (room sharing)
- Complex billing system with utilities tracking

## 7. Authentication & Authorization

### 7.1. JWT Strategy
- Access tokens (15 minutes)
- Refresh tokens (7 days)
- Role-based permissions

### 7.2. Role Permissions
- **Admin**: Full system access
- **Landlord**: Manage owned buildings, tenants, billing
- **Tenant**: View personal data, payments, communicate

## 8. System design documentations


### 8.0. App desciption
- [Miêu tả dự án](documents/0.App_description.md)

### 8.1. Business Requirement Document (BRD)
- Miêu tả yêu cầu nghiệp vụ của hệ thống
- [Tài liệu bản tiếng Việt](documents/1.businessRequirementDocumentVi.md)
- [Tài liệu bản tiếng Anh](documents/1.businessRequirementDocumentEn.md)

### 8.2. Use case Diagram

- BIểu đồ và mô tả các ca sử dụng
- [Tài liệu tiếng Việt](documents/2.useCaseDiagramVi.md)
- [Tài liệu tiếng Anh](documents/2.useCaseDiagramEn.md)

### 8.3. Screen Transition Diagram

- [Tài liệu tiếng Việt](documents/2.useCaseDiagramVi.md)
- [Tài liệu tiếng Anh](documents/2.useCaseDiagramEn.md)

### 8.4. System Architecture Document

- [Tài liệu tiếng Việt](documents/4.systemArchitectureDocument.md)

### 8.5. Database Design Document

- [Tài liệu tiếng Việt](documents/5.dataTableDesignDocument.md)
- [Tài liệu bổ sung](documents/5.dataTableDesignDocument.md)
- Trong tương lai sẽ gộp 2 cái vào thành 1. Và có thể trong tương lai sẽ tham chiếu tới file prisma thiết kế và ER diagram luôn 

### 8.6. API Specification Document

- [Tài liệu tiếng Việt](documents/6.tacohouse-api-spec.yaml)
- [Tài liệu tổng quát các API](documents/6.api-enhancement-summary.md)
- API documentation is available at:
  - Development: `http://localhost:3001/api/docs`
  - Swagger UI with interactive endpoints
  - Authentication examples included

### 8.7. Security Design Document
- [Tài liệu tiếng Việt](documents/7.securityDesignDocument.md)
- Thiết kế bảo mật hệ thống. Gồm:
  - Xác thực / phân quyền (JWT, OAuth2, RBAC/Pundit)
  - CSRF, XSS, SQL Injection, v.v.
  - Encryption / Hash / TLS
  - Log & audit

## 9. Deployment

### 9.1. Production Environment
```bash
# Build applications
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Or with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### 9.2. Environment Variables
Xem `.env.example` files trong mỗi thư mục để biết các biến môi trường cần thiết.

## 10. Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 11. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 12. Support

For support, email support@tacohouse.com or join our Slack channel.

---

**Tacohouse** - Modernizing rental property management with cutting-edge technology! 🚀