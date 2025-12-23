# CORS Configuration Guide

## ✅ Đã hoàn thành

### 1. Backend CORS Configuration
- ✅ Đã enable CORS trong `backend/src/main.ts`
- ✅ Cho phép frontend từ `http://localhost:3000`
- ✅ Hỗ trợ credentials (cookies, authorization headers)
- ✅ Cho phép các methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- ✅ Cho phép headers: Content-Type, Authorization

### 2. Frontend API Configuration
- ✅ Frontend đã được cấu hình để kết nối với backend ở port 3001
- ✅ API URL: `http://localhost:3001/api/v1`
- ✅ Có thể override bằng biến môi trường `NEXT_PUBLIC_API_URL`

## 🔧 Configuration Details

### Backend (`backend/src/main.ts`)
```typescript
const allowedOrigins: string[] = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.enableCors({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Frontend (`frontend/src/lib/api-client.ts`)
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE_PATH = '/api/v1';
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3001
# Single origin
FRONTEND_URL=http://localhost:3000

# Multiple origins (comma-separated)
FRONTEND_URL=http://localhost:3000,http://localhost:3001,https://staging.example.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚀 Usage

### 1. Start Backend
```bash
cd backend
npm run start:dev
# Backend sẽ chạy ở http://localhost:3001
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Frontend sẽ chạy ở http://localhost:3000
```

### 3. Test Connection
- Frontend sẽ tự động gửi requests đến backend ở port 3001
- CORS headers sẽ được tự động thêm vào responses
- JWT tokens sẽ được gửi qua Authorization header

## 🔒 Security Notes

- **Development**: CORS mặc định cho phép `http://localhost:3000` và `http://localhost:3001`
- **Multiple Origins**: Có thể cấu hình nhiều origins bằng cách phân tách bằng dấu phẩy trong `FRONTEND_URL`
- **Production**: Cần cập nhật `FRONTEND_URL` trong production environment với các domains được phép
- **Credentials**: Đã enable để hỗ trợ cookies và authorization headers
- **No Origin**: Requests không có origin (như mobile apps hoặc curl) sẽ được cho phép

## 🐛 Troubleshooting

### CORS Error
Nếu gặp lỗi CORS:
1. Kiểm tra `FRONTEND_URL` trong backend `.env` file
2. Đảm bảo frontend đang chạy ở đúng port (3000)
3. Kiểm tra browser console để xem chi tiết lỗi

### Connection Error
Nếu không kết nối được:
1. Kiểm tra backend đang chạy ở port 3001
2. Kiểm tra `NEXT_PUBLIC_API_URL` trong frontend
3. Kiểm tra network tab trong browser DevTools

