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

---

## 🧠 AI Team cho solo founder TacoHouse
| #      | Khâu / Vai trò                | Bạn cần AI làm gì?                    | AI duy nhất tôi chọn | Mức ưu tiên | TacoHouse dùng như thế nào?                                       |
| ------ | ----------------------------- | ------------------------------------- | -------------------- | ----------- | ----------------------------------------------------------------- |
| **1**  | 💡 Ý tưởng & Product Strategy | Brainstorm, định hình sản phẩm        | **ChatGPT**          | 🔥🔥🔥      | Phân tích vấn đề chủ trọ, tenant, feature, business model         |
| **2**  | 🔎 Market Research            | Nghiên cứu thị trường, đối thủ        | **Perplexity**       | 🔥🔥🔥      | Tìm các app quản lý nhà trọ, đối thủ ở VN/Nhật, pricing, xu hướng |
| **3**  | 🧑‍💼 Customer Discovery      | Chuẩn bị câu hỏi/phỏng vấn khách hàng | **ChatGPT**          | 🔥🔥🔥      | Tạo interview script để nói chuyện với chủ trọ                    |
| **4**  | 📊 Phân tích feedback         | Phân tích hàng chục feedback          | **ChatGPT**          | 🔥🔥🔥      | Upload transcript → tìm pain point thực sự                        |
| **5**  | 🎯 Product Strategy           | Xác định MVP / roadmap                | **ChatGPT**          | 🔥🔥🔥      | Quyết định cái gì build trước, cái gì bỏ                          |
| **6**  | 🖌️ UI/UX                     | Từ ý tưởng → giao diện                | **Google Stitch**    | 🔥🔥🔥      | Generate dashboard, room detail, landlord profile, tenant UI      |
| **7**  | 🎨 Design System              | Chuẩn hóa màu, spacing, component     | **Figma**            | 🔥🔥        | Biến concept Stitch thành design system thực                      |
| **8**  | 💻 Frontend                   | Design → Next.js                      | **GitHub Copilot**   | 🔥🔥🔥      | Build Next.js/React/Tailwind/shadcn từ design                     |
| **9**  | ⚙️ Backend                    | API, DB, business logic               | **GitHub Copilot**   | 🔥🔥🔥      | NestJS + Prisma/Postgres + API                                    |
| **10** | 🧪 Testing                    | Unit/E2E/test case                    | **GitHub Copilot**   | 🔥🔥        | Generate test + fix lỗi                                           |
| **11** | 🔐 Security / Code Review     | Tìm bug/security issue                | **GitHub Copilot**   | 🔥🔥        | Review PR, vulnerability, code quality                            |
| **12** | 🚀 Deployment                 | CI/CD, infrastructure                 | **GitHub Copilot**   | 🔥🔥        | GitHub Actions, Docker, deployment config                         |
| **13** | 📝 Landing Page               | Viết copy website                     | **ChatGPT**          | 🔥🔥🔥      | Hero, USP, pricing, CTA cho chủ trọ                               |
| **14** | 🧠 Branding                   | Brand positioning / voice             | **ChatGPT**          | 🔥🔥        | TacoHouse nên nói chuyện thế nào với chủ trọ                      |
| **15** | 🖼️ Marketing Visual          | Banner, social visual                 | **Canva AI**         | 🔥🔥        | Facebook post, banner, infographic                                |
| **16** | 📹 Video Marketing            | Video quảng cáo/demo                  | **CapCut AI**        | 🔥🔥        | Video "Quản lý 50 phòng chỉ với..."                               |
| **17** | 📱 Social Content             | Lên lịch/nội dung social              | **ChatGPT**          | 🔥🔥        | 30 ngày content Facebook/TikTok                                   |
| **18** | 🧲 Lead Generation            | Tìm khách hàng tiềm năng              | **Clay**             | 🔥🔥🔥      | Tìm/thu thập danh sách chủ trọ, enrich data                       |
| **19** | 💬 Sales Script               | Kịch bản gọi/nhắn chủ trọ             | **ChatGPT**          | 🔥🔥🔥      | Cold call, Messenger, Zalo, gặp trực tiếp                         |
| **20** | 🤝 Sales                      | CRM + quản lý lead                    | **HubSpot**          | 🔥🔥🔥      | Lead → demo → trial → paid                                        |
| **21** | 🎤 Sales Presentation         | Chuẩn bị nội dung pitching            | **ChatGPT**          | 🔥🔥🔥      | "Tại sao chủ trọ cần TacoHouse?"                                  |
| **22** | 🖥️ Pitch Deck                | Từ nội dung → slide                   | **Gamma**            | 🔥🔥🔥      | Tạo deck demo/sales pitch                                         |
| **23** | 🧑‍🏫 Demo Product            | Chuẩn bị demo flow                    | **ChatGPT**          | 🔥🔥🔥      | Kịch bản demo 5–10 phút                                           |
| **24** | 📧 Email Marketing            | Email follow-up                       | **HubSpot**          | 🔥🔥        | Trial → reminder → conversion                                     |
| **25** | 💬 Customer Support           | Trả lời khách hàng                    | **Intercom Fin**     | 🔥🔥        | FAQ, hướng dẫn sử dụng, support                                   |
| **26** | 📈 Analytics                  | Hiểu hành vi người dùng               | **PostHog**          | 🔥🔥🔥      | Activation, retention, feature usage                              |
| **27** | 💰 Financial Planning         | Pricing, revenue, burn rate           | **ChatGPT**          | 🔥🔥🔥      | Tính 100/500/1,000 chủ trọ → doanh thu                            |
| **28** | 📋 Business Operations        | SOP, task, knowledge base             | **Notion AI**        | 🔥🔥        | Lưu toàn bộ business knowledge                                    |
| **29** | ⚡ Automation                  | Tự động hóa workflow                  | **Zapier**           | 🔥🔥        | Lead → CRM → email → notification                                 |
| **30** | 📑 Legal / Documents          | Draft hợp đồng, policy, ToS           | **ChatGPT**          | 🔥🔥        | Draft trước, sau đó lawyer kiểm tra                               |
| **31** | 📊 KPI / Founder Dashboard    | Tổng hợp tình hình startup            | **Notion AI**        | 🔥🔥        | Weekly founder review                                             |
| **32** | 🧭 Founder Assistant          | "CEO ảo"                              | **ChatGPT**          | 🔥🔥🔥      | Mỗi sáng: hôm nay phải làm gì để TacoHouse tiến lên?              |
