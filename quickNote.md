# Quick note 
- Không được để quick note dài quá 20 dòng

Dùng pnpm cho cả 2 bên FE và BE

npx prisma init
npx prisma migrate dev --name init

nest g res users

- 1. Authentication & Users
  - [x] Authentication (login, register, refresh token)
  - [x] Users (profile management, change password)
  - [ ] Use Redis for caching session token, logout API
- 2. Core Domain Models
  - [x] Buildings (building management)
  - Rooms (room management)
  - Tenants (tenant profile & management)
- 3. Room-Tenant Relationship
  - Room-Tenant Management (assign/remove tenants from rooms)
  - Equipment (room equipment management)
- 4. Utilities & Billing
  - Utilities (meter readings)
  - Billing (bill generation & confirmation)
- 5. Payment System
  - Payments (payment processing, Stripe integration)
- 6. Request Management
  - Requests (maintenance, move-out requests)
- 7. Communication Systems
  - Messages (messaging between users)
  - Notifications (system notifications)
- 8. File Management
  - Uploads (file upload handling)