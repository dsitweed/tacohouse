# Backend Status Report

## 📋 API Endpoints Status

### ✅ Implemented
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /users/me`
- `PATCH /users/me`
- `POST /users/me/change-password`
- `GET /buildings`
- `POST /buildings`
- `GET /buildings/:id`
- `PATCH /buildings/:id`
- `DELETE /buildings/:id`
- `GET /rooms`
- `POST /rooms`
- `GET /rooms/:id`
- `PATCH /rooms/:id`
- `DELETE /rooms/:id`

### ❌ Missing (from API spec)
- `GET /rentals`
- `POST /rentals`
- `GET /rentals/:id`
- `PATCH /rentals/:id`
- `DELETE /rentals/:id`
- `GET /bills`
- `POST /bills`
- `GET /bills/:id`
- `PATCH /bills/:id`
- `POST /bills/:id/confirm`
- `DELETE /bills/:id`
- `GET /payments`
- `POST /payments`
- `GET /payments/:id`
- `GET /maintenance`
- `POST /maintenance`
- `GET /maintenance/:id`
- `PATCH /maintenance/:id`
- `POST /maintenance/:id/respond`
- `GET /chat/groups`
- `GET /chat/groups/:id`
- `GET /chat/groups/:id/messages`
- `POST /chat/groups/:id/messages`
- `GET /chat/direct/:userId`
- `POST /chat/direct/:userId`
- `GET /notifications`
- `PATCH /notifications/:id/read`

## Các chức năng còn thiếu / chưa đạt theo tài liệu

Auth + Security (Critical)

Flow refresh token chưa đúng tài liệu: POST /auth/refresh đang cần JWT (access token) vì không @Public() và không nhận/kiểm tra refresh token theo Redis/session như mô tả trong Security Doc (xem auth.controller.ts, auth.service.ts, 7.securityDesignDocument.md).
Chưa có Redis session store / token revocation / logout-all-devices (trong code còn TODO Redis).
Các lớp bảo vệ nâng cao trong Security doc (rate limit, audit trail, CSRF, sanitization pipeline “thực”) chưa thấy implement thực tế (hiện chủ yếu có logging + validation).
Public room browsing (Guest) chưa đúng BRD

BRD yêu cầu khi tenant báo trả phòng trước 30 ngày thì phòng vẫn đang ở nhưng phải public lên trang chủ để tìm người mới. Code hiện chỉ public status: 'AVAILABLE' nên không public các phòng PENDING_CHECKOUT (xem rooms.service.ts).
Tenant onboarding + tài liệu xác minh

Tài liệu “API enhancement” yêu cầu endpoint riêng kiểu GET/PUT /tenants/me/profile, upload CCCD/portrait/contract… nhưng backend hiện không có module tenants/uploads tương ứng; chỉ có update profile chung qua PATCH /users/me và các field ảnh là “string URL” (xem 6.api-enhancement-summary.md, users.controller.ts).
Đăng ký cũng chưa lưu các field ảnh CCCD/portrait dù DTO có khai báo (xem register-auth.dto.ts, auth.service.ts).
Room tenant management + capacity

Tài liệu có “add/remove tenant khỏi room”, giới hạn số người theo maxTenants. Backend hiện chỉ có Rental CRUD, và không check maxTenants khi tạo thêm rental (xem rentals.service.ts, schema.prisma).
Equipment management + Utility records (Missing)

BRD/API enhancement yêu cầu CRUD thiết bị phòng + lịch sử chỉ số điện/nước/gas (meter readings) và đơn giá theo thời gian. Prisma schema đã có RoomEquipment, UtilityRecord nhưng backend chưa có controller/service cho 2 mảng này (xem schema.prisma).
Billing (Missing phần “tự động/chuẩn business”)

Bill hiện tạo thủ công và cộng tay các khoản; chưa có luồng “chủ nhà nhập chỉ số → hệ thống tính từ chênh lệch công tơ + đơn giá building → tạo bill hàng tháng tự động”, cũng chưa có job/reminder (xem bills.service.ts, 1.businessRequirementDocumentVi.md).
Payments (thiếu confirm endpoint + Stripe thực)

API enhancement có POST /payments/{id}/confirm + POST /payments/stripe/create-intent; backend hiện không có các endpoint này, và Stripe chưa tích hợp (hiện chỉ set COMPLETED nếu method = STRIPE) (xem payments.controller.ts, payments.service.ts, 6.api-enhancement-summary.md).
Dual confirmation đang nằm ở POST /bills/:id/confirm (tức là có “ý tưởng” nhưng lệch route so với tài liệu enhancement).
Chat (thiếu realtime + bug quyền direct message)

Chưa có Socket.IO realtime như kiến trúc mô tả (xem 4.systemArchitectureDocument.md).
Logic xem direct messages hiện chỉ cho phép nếu currentUser.id === userId (tức gần như không chat 1-1 đúng nghĩa) (xem chat.service.ts).
Chưa thấy auto add/remove thành viên vào group chat theo move-in/move-out như tài liệu enhancement.
Notifications (thiếu automation + email reminders)

Có CRUD cơ bản, nhưng thiếu các trigger tự động (bill generated/payment reminder/maintenance update/chat message) và thiếu email “remind 3 lần” như BRD; validation “landlord chỉ notify tenant trong building của mình” đang để comment “for now allow” (xem notifications.service.ts).
Chuẩn response format + OpenAPI drift

Docs/OpenAPI mô tả response có field status, nhưng interceptor trả statusCode → lệch chuẩn (xem transform-response.interceptor.ts, 6.tacohouse-api-spec.yaml).
OpenAPI hiện cũng chưa phản ánh các API Maintenance/Chat/Notifications đang có trong code, và thiếu nhiều endpoint trong “API enhancement summary”.
Nếu bạn muốn, mình có thể làm tiếp 2 việc theo hướng “đóng gap” nhanh nhất: