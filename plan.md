# TacoHouse — Plan hoàn thiện MVP

> Cập nhật: 2026-10-06

---

## 1. ĐÃ LÀM

### Backend (NestJS + Prisma) — 12 module

| Nhóm | Trạng thái |
| --- | --- |
| Auth | ✅ JWT + refresh cookie, register/login/logout, verify email, forgot/reset password |
| Phân quyền | ✅ ADMIN / LANDLORD / TENANT, scope theo `landlordId` / `tenantId` ở service |
| Property | ✅ Buildings CRUD, Rooms CRUD, `GET /rooms/available` |
| Leasing | ✅ Rentals CRUD + terminate + `GET /rentals/stats` |
| Finance | ✅ Bills CRUD + `POST /bills/{id}/confirm`; Payments create/list/get |
| Operations | ✅ Maintenance CRUD + `POST /maintenance/{id}/respond` |
| Communication | ✅ Notifications CRUD + unread count + read-all; Chat groups + direct messages; Email (stub) |
| Analytics | ✅ `GET /dashboard/revenue-trend`, `GET /dashboard/tenants/{id}` |
| Infra | ✅ Uploads presigned URL, storage |
| Nền tảng | ✅ Prisma schema đầy đủ, Swagger, pagination util, DTO validation |

### Frontend (Next.js 16 + TanStack Query + shadcn/ui)

- ✅ i18n `[locale]`, middleware auth (`proxy.ts`), DashboardLayout + Sidebar lọc theo role
- ✅ Trang: Dashboard overview, Buildings (+detail), Rooms (+detail), Tenants (+detail), Rentals (+detail), Bills (+ **detail mới**), **Reports mới**, Payments, Maintenance, Notifications, Landlords, Settings, public home + room discovery
- ✅ Hooks API cho mọi resource chính, Orval generated types
- ✅ **Vừa xong**: filter tháng + export CSV/PDF + bulk actions ở Bills; BillDetailPage; ReportsPage; **bỏ toàn bộ dữ liệu giả ở BuildingsPage & TenantsPage**

---

## 2. CHƯA LÀM

### 🔴 P0 — Lõi MVP (đang thiếu, chặn go-live)

| # | Việc | Ghi chú |
| --- | --- | --- |
| 1 | **Tạo hóa đơn cuối tháng hàng loạt** | Nút "Tạo hóa đơn" chưa có handler; API chỉ tạo 1 bill/lần |
| 2 | **Nhập & lưu chỉ số điện/nước/gas** | Model `UtilityRecord` có sẵn nhưng **không có module/endpoint/UI** |
| 3 | **Số người trong phòng** | `cleaningFeePerPerson` cần số người → `Rental` không có field này |
| 4 | Thông báo khi phát hành hóa đơn | Tenant không biết có hóa đơn mới |

### 🟠 P1 — Vòng thu tiền & vận hành

| # | Việc | Ghi chú |
| --- | --- | --- |
| 5 | Ghi nhận thanh toán + upload minh chứng | `POST /payments` có, nhưng FE chưa có form |
| 6 | Xác nhận 2 chiều (tenant ↔ landlord) | Backend có; FE chỉ có nút confirm đơn lẻ |
| 7 | Trang "thanh toán" phía tenant | Hiện chỉ xem lịch sử |
| 8 | Chat thật | `ChatPage.tsx` **mock hoàn toàn** (`const chats = [...]`), chưa gọi API |
| 9 | Notifications realtime (socket) + trigger events | Chỉ có list REST |
| 10 | AppHeader: search, dark mode, language switcher | Đều là TODO |
| 11 | Nút "Export List" ở RoomsPage | Hàm rỗng |
| 12 | Email thật (SMTP) | Service đang stub |

### 🟡 P2 — Hoàn thiện & mở rộng

| # | Việc |
| --- | --- |
| 13 | Endpoint aggregate ở backend (occupancy/revenue per building) thay vì FE gộp 1000 dòng |
| 14 | Chuyển logic DashboardOverview sang backend |
| 15 | `GET /users?role=LANDLORD` (hiện suy ra từ `/buildings`) |
| 16 | Xử lý tiền cọc (deposit) |
| 17 | Lịch sử tiêu thụ utility, tính năng admin |
| 18 | Unit test cho service + e2e (gần như chưa có) |

---

## 3. LỘ TRÌNH THEO GIAI ĐOẠN

### Phase 0 — Nền tảng tính tiền (2–3 ngày)

- Thêm `numberOfTenants` vào `Rental` (migration).
- Module `utility-records`: `POST /utility-records/bulk`, `GET /utility-records?roomId&type&period`.
- `BillsService.calculateForRoom()` — hàm thuần tính tiền (unit-testable).
- Thêm filter `buildingId` cho `GET /rentals`.

### Phase 1 — 🔥 Tạo hóa đơn cuối tháng hàng loạt (4–6 ngày) ← **ƯU TIÊN #1**

- `POST /bills/generate/preview` (dry-run) + `POST /bills/generate` (bulk, idempotent).
- FE wizard 3 bước: chọn tòa nhà/kỳ/hạn → nhập chỉ số → preview → tạo.
- Gửi notification cho tenant sau khi tạo.

### Phase 2 — Vòng thu tiền (4–5 ngày)

- FE form ghi nhận thanh toán + upload minh chứng.
- Màn xác nhận 2 chiều; tenant view bill + "Tôi đã chuyển khoản".
- Trạng thái OVERDUE tự động (cron/on-read).

### Phase 3 — Vận hành (4–5 ngày)

- Chat thật; notifications realtime; AppHeader search/dark mode/i18n switcher; RoomsPage export.

### Phase 4 — Báo cáo & hoàn thiện (4–5 ngày)

- Endpoint aggregate; Dashboard backend-driven; landlords endpoint; email thật; tests.

---

## 4. LOGIC PHỨC TẠP NHẤT PHẢI NẮM

1. **Mô hình giá FULL_RIGHTS vs PARTIAL_RIGHTS** ⚠️ *quan trọng nhất*
   - `FULL_RIGHTS` (toàn quyền): tenant trả **trọn gói** → bill **chỉ có tiền phòng + phí cố định + nợ cũ**, KHÔNG cộng điện/nước/gas.
   - `PARTIAL_RIGHTS` (bán quyền): tenant trả **theo tiêu thụ** → cộng `usage × rate`.
   - Schema ghi rõ: *"Utility charges (only for PARTIAL_RIGHTS rooms)"*.

2. **Chuỗi chỉ số công tơ (UtilityRecord)**
   - `consumption = currentReading − previousReading`; `unitRate` lưu tại thời điểm ghi.
   - `previousReading` kỳ này **phải = `currentReading` kỳ trước** → cần lấy kỳ liền trước.
   - `@@unique([roomId, utilityType, recordDate])`.

3. **previousDebt (nợ cũ)**
   - = tổng các hóa đơn **chưa PAID** của phòng đó **trước kỳ hiện tại**. Nếu tính sai → tenant bị tính trùng/thiếu.

4. **cleaningFeePerPerson × số người** — hiện **không có** nguồn số người ⇒ phải bổ sung field.

5. **State machine hóa đơn + xác nhận 2 chiều**
   - `PENDING → TENANT_CONFIRMED → LANDLORD_CONFIRMED → PAID`, nhánh `OVERDUE`.
   - ⚠️ `confirmPayment` **yêu cầu phải có `Payment` trước** (nếu chưa có → `BadRequestException 'No payment found for this bill'`).
   - Tenant chỉ xác nhận được hóa đơn của chính mình (`confirmation.tenantId === currentUser.id`).

6. **Tiền là `Decimal` → trả về string** — tuyệt đối không dùng số học `number` của JS khi cộng tiền.

7. **Idempotency**: `@@unique([roomId, billingPeriod])` — chống tạo trùng khi chạy bulk.

8. **`billingPeriod` là DateTime** nhưng ngữ nghĩa là **tháng** → phải chuẩn hóa về **ngày đầu tháng** trước khi unique-check.

9. **Phân quyền theo role** ở mọi query (landlord → buildings của mình; tenant → rentals của mình).

10. **Pagination contract**: `pagination.total/firstItem/lastItem` từ API, **không** suy từ `data.length`.

---

## 5. ƯU TIÊN #1 — TẠO HÓA ĐƠN CUỐI THÁNG HÀNG LOẠT

**Mục tiêu**: landlord ngồi 1 chỗ, ~2 phút, ra số tiền **tất cả tenant** phải đóng cuối tháng.

### UX đề xuất — 1 màn, 3 bước

```text
[Bước 1] Chọn tòa nhà ▾ | Kỳ: 10/2026 | Hạn: 10/11/2026 (auto từ building.billingDate)
[Bước 2] Bảng nhập chỉ số (chỉ phòng PARTIAL_RIGHTS)
   Phòng | Tenant | Chỉ số đầu (auto) | Chỉ số cuối (nhập) | Điện | Nước | Gas
   → auto-fill "chỉ số đầu" = currentReading kỳ trước, chỉ cần gõ số mới
   → hỗ trợ dán từ Excel / Enter để nhảy ô (nhập nhanh)
[Bước 3] Preview bảng tính tiền từng phòng
   Phòng | Tiền phòng | Điện | Nước | Gas | Phí QL | Vệ sinh | Chiếu sáng | Nợ cũ | TỔNG
   ⚠️ Cảnh báo: phòng thiếu chỉ số / đã có hóa đơn kỳ này / không có rental ACTIVE
   → [ Tạo 24 hóa đơn ]  (1 nút)
```

### API đề xuất

| Endpoint | Việc |
| --- | --- |
| `POST /utility-records/bulk` | Lưu chỉ số hàng loạt |
| `GET /utility-records?roomId&type&period` | Lấy chỉ số đầu kỳ (auto-fill) |
| `POST /bills/generate/preview` | **Dry-run**: trả bảng tính + cảnh báo, KHÔNG ghi DB |
| `POST /bills/generate` | Tạo hàng loạt, `{ buildingId, billingPeriod, dueDate, items[], overwrite? }`, trả `{ created, skipped, failed[] }` |
| `GET /rentals?buildingId=` | Lọc rental theo tòa nhà (thay vì FE lọc) |

### Công thức tính (đặt trong 1 hàm thuần, có unit test)

```text
monthlyRent       = activeRental.monthlyRent (fallback room.monthlyRent)
electricityAmount = FULL_RIGHTS ? 0 : (curr−prev) × building.electricityRate
waterAmount       = FULL_RIGHTS ? 0 : (curr−prev) × building.waterRate
gasAmount         = FULL_RIGHTS ? 0 : (curr−prev) × building.gasRate
managementFee     = building.managementFee
cleaningFee       = building.cleaningFeePerPerson × rental.numberOfTenants
lightingFee       = building.lightingFee
previousDebt      = Σ bill(room, status≠PAID, period<billingPeriod)
totalAmount       = Σ tất cả
```

### Nguyên tắc bắt buộc

- Chỉ tạo cho phòng có **rental ACTIVE**; bỏ qua phòng trống (có cảnh báo).
- **Idempotent**: đã có bill kỳ đó → skip (mặc định), `overwrite=true` thì update.
- `dueDate` mặc định = `building.billingDate` của tháng kế tiếp.
- **Preview trước, ghi sau** — tránh tạo sai hàng loạt.
- Sau khi tạo: **notification** cho từng tenant.

### Việc cần làm trước tiên (Phase 0)

1. Migration thêm `numberOfTenants` vào `Rental`.
2. Module `utility-records` + endpoint bulk.
3. Hàm `calculateForRoom()` + unit test (đây là chỗ dễ sai nhất, phải test trước khi làm UI).
