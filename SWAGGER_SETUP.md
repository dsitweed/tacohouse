# Swagger API Documentation Setup

## ✅ Đã hoàn thành

### 1. Cài đặt Swagger
- ✅ Đã cài đặt `@nestjs/swagger` package
- ✅ Cấu hình Swagger trong `main.ts`

### 2. Port Configuration
- ✅ Backend port mặc định: **3001**
- ✅ Có thể override bằng biến môi trường `PORT`

### 3. Swagger Configuration
- ✅ Swagger UI: `http://localhost:3001/api/docs`
- ✅ API Base URL: `http://localhost:3001/api/v1`
- ✅ JWT Bearer Authentication đã được cấu hình
- ✅ Tags đã được thêm cho tất cả modules

### 4. Controllers đã được document
- ✅ Auth Controller
- ✅ Users Controller
- ✅ Buildings Controller
- ✅ Rooms Controller
- ✅ Rentals Controller
- ✅ Bills Controller
- ✅ Payments Controller
- ✅ Maintenance Controller
- ✅ Chat Controller
- ✅ Notifications Controller

## 📚 Cách sử dụng

### 1. Khởi động server
```bash
cd backend
npm run start:dev
```

### 2. Truy cập Swagger UI
Mở trình duyệt và vào: `http://localhost:3001/api/docs`

### 3. Authentication
1. Đăng nhập qua endpoint `/auth/login` để lấy JWT token
2. Click vào nút "Authorize" ở góc trên bên phải
3. Nhập token theo format: `Bearer <your-token>`
4. Click "Authorize" để lưu token

### 4. Test API
- Tất cả endpoints đã được document với:
  - Mô tả chi tiết
  - Request/Response schemas
  - Authentication requirements
  - Status codes

## 🔧 Configuration Details

### Port Configuration
- Default port: `3001` (trong `env.config.ts` và `main.ts`)
- Override: Set biến môi trường `PORT`

### Swagger Features
- **Persist Authorization**: Token được lưu giữa các requests
- **Tags Sorter**: Sắp xếp tags theo alphabet
- **Operations Sorter**: Sắp xếp operations theo alphabet
- **Bearer Auth**: JWT authentication scheme

## 📝 Notes

- Swagger sẽ tự động generate schemas từ DTOs
- Tất cả endpoints đều có `@ApiBearerAuth('JWT-auth')` decorator
- Public endpoints (như `/auth/login`, `/auth/register`) không yêu cầu authentication

