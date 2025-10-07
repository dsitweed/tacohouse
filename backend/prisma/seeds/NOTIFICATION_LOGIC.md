# 🔔 Notification Logic Guide

## Tổng quan

File `notifications.seed.ts` hiện tại đã được cải thiện để tạo notifications **dựa trên dữ liệu thực tế** thay vì hard-code.

## Cách sử dụng `relatedId` và `relatedType`

### 1. **BILL_GENERATED** (Hóa đơn mới)
```typescript
relatedId: bill.id
relatedType: 'Bill'
```
- **Khi nào**: Mỗi khi có bill mới được tạo
- **Người nhận**: Tenant của phòng đó
- **Mục đích**: User có thể click vào notification để xem chi tiết bill

### 2. **PAYMENT_REMINDER** (Nhắc nhở thanh toán)
```typescript
relatedId: bill.id
relatedType: 'Bill'
```
- **Khi nào**: Bill ở trạng thái PENDING hoặc OVERDUE
- **Người nhận**: Tenant của phòng đó
- **Mục đích**: Nhắc nhở thanh toán, click vào để xem chi tiết bill và thanh toán

### 3. **MAINTENANCE_UPDATE** (Cập nhật bảo trì)
```typescript
relatedId: maintenanceRequest.id
relatedType: 'MaintenanceRequest'
```
- **Khi nào**: 
  - Tenant tạo request mới
  - Landlord cập nhật trạng thái (IN_PROGRESS, COMPLETED, CANCELLED)
- **Người nhận**: 
  - **Tenant**: Nhận thông báo về trạng thái request của họ
  - **Landlord**: Nhận thông báo về request mới từ tenant
- **Mục đích**: Click vào để xem chi tiết maintenance request

### 4. **ANNOUNCEMENT** (Thông báo hệ thống)
```typescript
relatedId: null
relatedType: null
```
- **Khi nào**: Thông báo chung cho tất cả users
- **Người nhận**: Tenant, Landlord (có thể filter theo building)
- **Mục đích**: Thông báo maintenance hệ thống, sự kiện, thay đổi chính sách

### 5. **SYSTEM** (Xác nhận thanh toán cho landlord)
```typescript
relatedId: bill.id
relatedType: 'Bill'
```
- **Khi nào**: Tenant xác nhận thanh toán (TENANT_CONFIRMED, PAID)
- **Người nhận**: Landlord của building
- **Mục đích**: Landlord biết tenant đã xác nhận thanh toán, click vào để xác nhận

### 6. **CHAT_MESSAGE** (Tin nhắn chat - chưa implement trong seed)
```typescript
relatedId: message.id
relatedType: 'Message'
```
- **Khi nào**: Có tin nhắn mới trong group chat hoặc direct message
- **Người nhận**: Các thành viên trong group chat
- **Mục đích**: Click vào để xem tin nhắn

## Logic isRead và readAt

### `isRead = true` khi:
1. **Bill đã PAID hoặc LANDLORD_CONFIRMED**
   - User đã xử lý xong, đã đọc notification
   
2. **MaintenanceRequest đã COMPLETED hoặc CANCELLED**
   - Request đã kết thúc, user đã biết kết quả

3. **Payment confirmation cho landlord khi bill đã PAID**
   - Landlord đã xác nhận thanh toán

### `isRead = false` khi:
1. **Bill PENDING hoặc OVERDUE**
   - Cần tenant hành động
   
2. **MaintenanceRequest PENDING hoặc IN_PROGRESS**
   - Đang chờ xử lý

3. **ANNOUNCEMENT mới**
   - User chưa đọc

## Cải tiến so với phiên bản cũ

### ❌ Phiên bản cũ (Hard-coded)
```typescript
{
  userId: user.id,
  title: 'Hóa đơn mới',
  message: 'Hóa đơn tháng 1/2025 đã được tạo. Tổng số tiền: 3,695,000 VND',
  type: NotificationType.BILL_GENERATED,
  isRead: true,
  // ❌ Không có relatedId và relatedType
}
```

### ✅ Phiên bản mới (Data-driven)
```typescript
// Tự động tạo notification cho mỗi bill
for (const bill of bills) {
  const room = await prisma.room.findUnique({
    where: { id: bill.roomId },
    include: { rentals: { where: { status: 'ACTIVE' } } },
  });
  
  const tenant = tenants.find((t) => t.tenant?.id === rental.tenantId);
  
  notifications.push({
    userId: tenant.id, // ✅ Đúng: Lấy từ tenant thực tế
    title: 'Hóa đơn mới',
    message: `Hóa đơn tháng ${billingMonth} đã được tạo. Tổng số tiền: ${bill.totalAmount.toLocaleString()} VND`,
    type: NotificationType.BILL_GENERATED,
    isRead: bill.status === 'PAID' || bill.status === 'LANDLORD_CONFIRMED',
    relatedId: bill.id, // ✅ Link đến bill thực tế
    relatedType: 'Bill', // ✅ Định nghĩa type của entity
  });
}
```

## Best Practices

### 1. **Luôn set relatedId và relatedType khi có thể**
Giúp frontend navigate đến đúng trang chi tiết khi user click vào notification.

### 2. **Notification message nên có context**
```typescript
// ❌ Bad
message: "Có cập nhật mới"

// ✅ Good
message: `Yêu cầu bảo trì "${request.title}" đang được xử lý`
```

### 3. **isRead logic nên dựa trên trạng thái của entity liên quan**
```typescript
isRead: bill.status === 'PAID' || bill.status === 'LANDLORD_CONFIRMED'
```

### 4. **readAt nên set khi isRead = true**
```typescript
readAt: bill.status === 'PAID' ? new Date(bill.updatedAt) : undefined
```

## Frontend Integration

Khi implement notification system ở frontend, có thể:

```typescript
// Click handler
const handleNotificationClick = (notification: Notification) => {
  if (notification.relatedType === 'Bill') {
    router.push(`/bills/${notification.relatedId}`);
  } else if (notification.relatedType === 'MaintenanceRequest') {
    router.push(`/maintenance/${notification.relatedId}`);
  } else if (notification.relatedType === 'Message') {
    router.push(`/chat/${notification.relatedId}`);
  }
  
  // Mark as read
  markNotificationAsRead(notification.id);
};
```

## Summary

- ✅ **Đúng**: Chỉ bắn thông báo cho tenant đang có thuê phòng, **rental.status === 'ACTIVE'**
- ✅ **Đúng**: Notifications được tạo dựa trên dữ liệu thực tế (bills, maintenance requests)
- ✅ **Đúng**: `relatedId` và `relatedType` giúp link đến entity cụ thể
- ✅ **Đúng**: Logic `isRead` dựa trên trạng thái của entity
- ✅ **Đúng**: Message có context và thông tin cụ thể
- ✅ **Đúng**: Scalable - dễ extend cho các loại notification mới
