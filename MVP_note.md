## 📊 MVP Analysis cho Landlord

Based trên tài liệu dự án và code hiện tại, đây là những feature **bắt buộc** cần hoàn thiện để có sản phẩm MVP:

### ✅ Đã Hoàn Thành
- ✅ Quản lý tòa nhà (Building Management)
- ✅ Quản lý phòng (90% - chỉ cần fix nhỏ)
- ✅ Cấu trúc backend/frontend
- ✅ Schema Prisma (data models)

---

### 🚀 Cần Làm Để MVP (Theo Độ Ưu Tiên)

#### **1️⃣ Quản lý Hợp Đồng Thuê (Rental Management) - TIER 1**
**Tại sao:** Landlord cần thêm/quản lý người thuê trong phòng
- [ ] **Backend**: 
  - `rentals.service.ts` - Thêm hợp đồng, update status, terminate
  - `rentals.controller.ts` - API endpoints
- [ ] **Frontend**: 
  - Dashboard page để view danh sách người thuê
  - Form thêm người thuê vào phòng
  - Update trạng thái (ACTIVE, NOTICE_GIVEN, TERMINATED)

#### **2️⃣ Hệ Thống Hóa Đơn (Billing System) - TIER 1**
**Tại sao:** Core revenue - Landlord phải tạo & gửi hóa đơn hàng tháng
- [ ] **Backend**: 
  - `bills.service.ts` - Generate bills từ utility records, calculate tổng tiền
  - `bills.controller.ts` - API CRUD
  - Hàm tính tiền cho 2 loại phòng (FULL_RIGHTS vs PARTIAL_RIGHTS)
- [ ] **Frontend**: 
  - Trang tạo bill hàng tháng (chọn building/room)
  - Nhập số điện/nước/ga
  - Preview + gửi notification cho người thuê

#### **3️⃣ Thanh Toán & Xác Nhận (Payment Confirmation) - TIER 1**
**Tại sao:** Quản lý tiền + tránh lừa đảo (dual confirmation)
- [ ] **Backend**: 
  - `payments.service.ts` - Track payment, confirm logic
  - `payment-confirmations.service.ts` - Tenant confirm → Landlord verify
- [ ] **Frontend**: 
  - Landlord view list hóa đơn chưa thanh toán
  - Xác thực thanh toán từ tenant (check proof image)
  - Update trạng thái COMPLETED

#### **4️⃣ Hệ Thống Thông Báo (Notifications) - TIER 1**
**Tại sao:** Remind người thuê thanh toán, notify landlord về requests
- [ ] **Backend**: 
  - `notifications.service.ts` - Generate & send notifications
  - Trigger khi: bill created, payment reminder, maintenance request
- [ ] **Frontend**: 
  - Bell icon + notification drawer
  - Notification list page

#### **5️⃣ Yêu Cầu Sửa Chữa (Maintenance Requests) - TIER 2**
**Tại sao:** Người thuê báo cáo hư hỏng → Landlord quản lý
- [ ] **Backend**: 
  - `maintenance.service.ts` - CRUD, update status (PENDING → IN_PROGRESS → COMPLETED)
- [ ] **Frontend**: 
  - Landlord view list requests by status
  - Update trạng thái + thêm note completion

#### **6️⃣ Chat/Messaging (Communication) - TIER 2**
**Tại sao:** Landlord - Tenant nhắn tin trực tiếp
- [ ] **Backend**: 
  - `chat.service.ts` - 1-on-1 messages + group chat
  - Auto-add tenant to building group chat khi rental ACTIVE
- [ ] **Frontend**: 
  - Chat interface
  - Message list + form send

#### **7️⃣ Dashboard (Overview) - TIER 2**
**Tại sao:** Landlord cần quick view tất cả thông tin
- [ ] **Frontend**: 
  - Cards: Total tenants, Occupied rooms, Unpaid bills, Pending requests
  - Charts: Monthly revenue, Occupancy rate, Payment stats

---

### 📋 Thứ Tự Recommendation

**Phase 1 (1-2 tuần) - MVP Minimum:**
1. Rental Management
2. Billing System
3. Payment Confirmation
4. Notifications (basic)

**Phase 2 (1 tuần) - Nice to Have:**
5. Maintenance Requests
6. Chat (simplified 1-on-1)
7. Dashboard Overview

**Not in MVP:**
- Tenant-facing features (tenants view bills, pay, chat)
- Deposits handling
- Utility history tracking (advanced)
- Admin features
- Mobile app

---

### 📊 Checklist Tình Trạng Hiện Tại

| Feature | Backend | Frontend | Status |
|---------|---------|----------|---------|
| Building | ✅ | ✅ | Done |
| Room | ✅ | 🟡 | 90% |
| Rental | 🟡 | ❌ | Need work |
| Billing | 🟡 | ❌ | Needs implementation |
| Payment | 🟡 | ❌ | Needs implementation |
| Notifications | 🟡 | ❌ | Needs UI |
| Maintenance | 🟡 | ❌ | Needs UI |
| Chat | 🟡 | ❌ | Needs work |

Bạn muốn tôi **bắt đầu implement** feature nào trước? 🚀