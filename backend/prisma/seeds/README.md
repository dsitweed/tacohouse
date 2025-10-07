# 🌱 Seed Data Documentation

## 📊 Dữ liệu được seed

### 1. **Users** (30 người dùng)

#### Admins (5)
- **admin1@example.com** đến **admin5@example.com**
- Password: `password`
- Tên, số điện thoại, ngày sinh: Tự động tạo bởi Faker
- Tuổi: 25-50 tuổi
- Nghề nghiệp: System Administrator
- Nơi làm việc: Tacohouse

#### Landlords (10)
- **landlord1@example.com** đến **landlord10@example.com**
- Password: `password`
- Tên, số điện thoại, ngày sinh: Tự động tạo bởi Faker
- Tuổi: 35-60 tuổi
- Nghề nghiệp: Real Estate Investor
- Nơi làm việc: Self-employed
- Mỗi landlord sở hữu nhiều buildings

#### Tenants (15)
- **tenant1@example.com** đến **tenant15@example.com**
- Password: `password`
- Tên, số điện thoại, ngày sinh: Tự động tạo bởi Faker
- Tuổi: 22-45 tuổi
- Nghề nghiệp: Tự động tạo bởi Faker (`faker.person.jobTitle()`)
- Nơi làm việc: Tự động tạo bởi Faker (`faker.company.name()`)

---

### 2. **Buildings**
- Số lượng: Phụ thuộc vào số landlords
- Mỗi building có:
  - ✅ **Tên**: Random từ faker
  - ✅ **Địa chỉ**: Full address từ faker
  - ✅ **Mô tả**: Random sentences từ faker
  - ✅ **Ngày chốt hóa đơn**: Random trong tháng
  - ✅ **Giá điện**: Random realistic
  - ✅ **Giá nước**: Random realistic  
  - ✅ **Giá gas**: Random realistic
  - ✅ **Phí quản lý**: Random realistic
  - ✅ **Phí vệ sinh/người**: Random realistic
  - ✅ **Phí chiếu sáng**: Random realistic

---

### 3. **Rooms**
- Số lượng: Phụ thuộc vào số buildings (mỗi building có nhiều rooms)
- Mỗi room có:
  - ✅ **Số phòng**: Format 101, 102, 201, 202, etc.
  - ✅ **Diện tích**: Random realistic (m²)
  - ✅ **Giá thuê**: Random realistic (VND/tháng)
  - ✅ **Tiền cọc**: Tính theo công thức
  - ✅ **Số người tối đa**: Tùy thuộc diện tích
  - ✅ **Loại phòng**: PARTIAL_RIGHTS hoặc FULL_RIGHTS
  - ✅ **Mô tả**: Random từ faker
  - ✅ **Ảnh**: Ảnh thật từ Unsplash
  - ✅ **Trạng thái**: AVAILABLE, OCCUPIED, MAINTENANCE, hoặc PENDING_CHECKOUT
  - ✅ **Ngày có sẵn**: Random realistic

---

### 4. **Room Equipment**
- Thiết bị trong phòng (tủ lạnh, máy lạnh, máy giặt, v.v.)
- Mỗi equipment có:
  - ✅ **Tên thiết bị**: Faker generated
  - ✅ **Mô tả**: Random
  - ✅ **Thương hiệu**: Random
  - ✅ **Model**: Random
  - ✅ **Ngày lắp đặt**: Random
  - ✅ **Tình trạng**: EXCELLENT, GOOD, FAIR, POOR, hoặc BROKEN

---

### 5. **Rentals**
- Hợp đồng thuê phòng
- Mỗi rental có:
  - ✅ **Tenant**: Link đến tenant
  - ✅ **Room**: Link đến room
  - ✅ **Ngày bắt đầu**: Random
  - ✅ **Ngày kết thúc**: Random hoặc null (đang thuê)
  - ✅ **Giá thuê hàng tháng**: Từ room
  - ✅ **Tiền cọc đã trả**: Random
  - ✅ **Trạng thái**: ACTIVE, NOTICE_GIVEN, hoặc TERMINATED
  - ✅ **Ảnh hợp đồng**: Random images

---

### 6. **Utility Records**
- Ghi chỉ số điện, nước, gas
- Mỗi record có:
  - ✅ **Room**: Link đến room
  - ✅ **Loại**: ELECTRICITY, WATER, hoặc GAS
  - ✅ **Chỉ số trước**: Number
  - ✅ **Chỉ số hiện tại**: Number
  - ✅ **Tiêu thụ**: Tính tự động
  - ✅ **Đơn giá**: Từ building
  - ✅ **Ngày ghi**: Random

---

### 7. **Bills**
- Hóa đơn hàng tháng
- Mỗi bill có:
  - ✅ **Room**: Link đến room
  - ✅ **Kỳ thanh toán**: Tháng/năm
  - ✅ **Hạn thanh toán**: Date
  - ✅ **Tiền thuê**: From rental
  - ✅ **Tiền điện/nước/gas**: Calculated (nếu PARTIAL_RIGHTS)
  - ✅ **Phí quản lý/vệ sinh/chiếu sáng**: From building
  - ✅ **Nợ cũ**: Random hoặc 0
  - ✅ **Tổng tiền**: Tính tự động
  - ✅ **Trạng thái**: PENDING, TENANT_CONFIRMED, LANDLORD_CONFIRMED, PAID, hoặc OVERDUE

---

### 8. **Payments**
- Thanh toán hóa đơn
- Mỗi payment có:
  - ✅ **Bill**: Link đến bill
  - ✅ **Số tiền**: From bill
  - ✅ **Phương thức**: CASH, BANK_TRANSFER, hoặc STRIPE
  - ✅ **Ngày thanh toán**: Random
  - ✅ **Mã giao dịch**: Random (nếu có)
  - ✅ **Ảnh biên lai**: Random image
  - ✅ **Trạng thái**: PENDING, COMPLETED, FAILED, hoặc REFUNDED

---

### 9. **Payment Confirmations**
- Xác nhận thanh toán từ tenant và landlord
- Mỗi confirmation có:
  - ✅ **Bill**: Link đến bill
  - ✅ **Tenant**: Link đến tenant
  - ✅ **Tenant đã xác nhận**: Boolean + timestamp
  - ✅ **Landlord đã xác nhận**: Boolean + timestamp
  - ✅ **Ảnh chứng từ**: Array of images
  - ✅ **Ghi chú**: Optional text

---

### 10. **Chat Groups**
- Nhóm chat cho mỗi building
- Mỗi chat group có:
  - ✅ **Building**: Link đến building
  - ✅ **Tên nhóm**: From building name
  - ✅ **Mô tả**: Optional
  - ✅ **Thành viên**: Landlord + tenants trong building
  - ✅ **Tin nhắn**: Random messages từ faker

---

### 11. **Maintenance Requests**
- Yêu cầu sửa chữa/bảo trì
- Mỗi request có:
  - ✅ **Tenant**: Link đến tenant
  - ✅ **Room**: Link đến room
  - ✅ **Tiêu đề**: Random issue
  - ✅ **Mô tả**: Random description
  - ✅ **Mức độ ưu tiên**: LOW, MEDIUM, HIGH, hoặc URGENT
  - ✅ **Loại**: PLUMBING, ELECTRICAL, APPLIANCE, FURNITURE, CLEANING, hoặc OTHER
  - ✅ **Ảnh**: Problem images
  - ✅ **Trạng thái**: PENDING, IN_PROGRESS, COMPLETED, hoặc CANCELLED
  - ✅ **Ghi chú hoàn thành**: Random (nếu COMPLETED)

---

### 12. **Notifications**
- Thông báo cho users
- Tự động tạo dựa trên:
  - ✅ **Bills**: BILL_GENERATED, PAYMENT_REMINDER
  - ✅ **Maintenance Requests**: MAINTENANCE_UPDATE
  - ✅ **System**: ANNOUNCEMENT, SYSTEM
- Mỗi notification có:
  - ✅ **User**: Link đến user
  - ✅ **Tiêu đề**: Context-aware title
  - ✅ **Nội dung**: Context-aware message
  - ✅ **Loại**: NotificationType enum
  - ✅ **Đã đọc**: Boolean + timestamp
  - ✅ **Related ID**: Link đến entity liên quan (Bill, MaintenanceRequest, etc.)
  - ✅ **Related Type**: Type của entity ('Bill', 'MaintenanceRequest', etc.)

---

## 🎨 Ảnh thật từ Unsplash

Hệ thống sử dụng ảnh thật từ Unsplash cho:

### Room Images (10 ảnh phòng trọ)
```typescript
const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
  'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
];
```

### Maintenance Problem Images (Theo category)
```typescript
// PLUMBING
'https://plus.unsplash.com/premium_photo-1664301972519-506636f0245d'

// ELECTRICAL
'https://images.unsplash.com/photo-1509390673020-a5b2450e33f1'

// APPLIANCE
'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d'

// FURNITURE
'https://images.unsplash.com/photo-1560185127-6ed189bf02f4'

// CLEANING
'https://images.unsplash.com/photo-1581578731548-c64695cc6952'

// OTHER
'https://images.unsplash.com/photo-1589118949245-7d38baf380d6'
```

### Payment Receipt Images (5 ảnh)
```typescript
const PAYMENT_IMAGES = [
  'https://unsplash.com/photos/MYbhN8KaaEc',
  'https://unsplash.com/photos/2FPjlAyMQTA',
  'https://unsplash.com/photos/q-W_WVW-eV0',
  'https://unsplash.com/photos/Dvv8EP8yGlk',
  'https://unsplash.com/photos/1T8x0-e7cWk',
];
```

---

## 🚀 Cách sử dụng

### Chạy seed lần đầu

```bash
cd backend

# Chạy seed
pnpm prisma:seed
```

### Reset và seed lại

```bash
# Reset database và seed lại (XÓA TOÀN BỘ data!)
pnpm db:reset

# Hoặc chạy từng bước
pnpm prisma migrate reset
pnpm prisma:seed
```

### Trong development với Docker

```bash
# Start với fresh data
docker-compose down -v  # Xóa volumes
docker-compose up -d database
cd backend
pnpm prisma migrate dev
pnpm prisma:seed
pnpm start:dev
```

## 📊 Summary Output

Sau khi chạy seed, bạn sẽ thấy summary như sau:

```
📊 ===== SEEDING SUMMARY =====
� Users: 30 total
   - Admins: 5
   - Landlords: 10
   - Tenants: 15
🏢 Buildings: X
🚪 Rooms: Y
🛋️  Room Equipment: Z
📝 Rentals: A
⚡ Utility Records: B
💰 Bills: C
💳 Payments: D
✅ Payment Confirmations: E
💬 Chat Groups: F
👤 Chat Group Members: G
📨 Messages: H
🔧 Maintenance Requests: I
=============================

✨ Seeding completed successfully!
```
