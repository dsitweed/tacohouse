# Giải thích: Auth Persistence sau Reload Page

## 🔍 Vấn đề ban đầu

Khi reload page, trạng thái authentication bị mất mặc dù đã có token trong localStorage. Nguyên nhân:

### 1. **Hydration Mismatch trong Next.js SSR**

Next.js render 2 lần:
- **Server-side (SSR)**: Render HTML trên server → không có access vào `localStorage`
- **Client-side (CSR)**: Hydrate HTML với JavaScript → có access vào `localStorage`

**Vấn đề:**
```typescript
// Server render: isAuthenticated = false (default)
// Client hydrate: isAuthenticated = true (từ localStorage)
// → Mismatch → React warning/error
```

### 2. **Zustand Persist Middleware Hydration Flow**

Zustand `persist` middleware hoạt động như sau:

```
1. Component mount
2. Zustand đọc từ localStorage
3. Hydrate state vào store
4. Component re-render với state mới
```

**Vấn đề:** Có khoảng thời gian giữa bước 1-3 mà state chưa được hydrate, dẫn đến:
- `isAuthenticated = false` (default)
- Component redirect về `/login` ngay lập tức
- Trước khi hydration hoàn tất

---

## ✅ Các Fix và Giải thích

### Fix 1: `onRehydrateStorage` Callback

```typescript
onRehydrateStorage: () => (state) => {
  // Ensure isAuthenticated is set correctly after hydration
  if (state && state.accessToken) {
    state.isAuthenticated = true;
  }
}
```

**Tại sao cần:**

1. **Đảm bảo tính nhất quán**: Sau khi hydrate từ localStorage, có thể `isAuthenticated` không được set đúng nếu:
   - Data trong localStorage bị corrupt
   - Có token nhưng `isAuthenticated = false` (do bug trước đó)

2. **Derived state**: `isAuthenticated` là derived từ `accessToken`:
   ```typescript
   // Logic: Nếu có token → đã authenticated
   isAuthenticated = !!accessToken
   ```

3. **Timing**: Callback này chạy **sau khi** hydration hoàn tất, đảm bảo state đã được restore từ localStorage.

**Flow:**
```
localStorage → Zustand hydrate → onRehydrateStorage callback → State được fix → Component re-render
```

---

### Fix 2: `setTokens` cũng set `isAuthenticated`

```typescript
setTokens: (accessToken, refreshToken) => {
  set({ 
    accessToken, 
    refreshToken,
    isAuthenticated: !!accessToken,  // ← Fix này
  });
}
```

**Tại sao cần:**

1. **Token refresh flow**: Khi token hết hạn và được refresh:
   ```typescript
   // Trong api-client.ts interceptor
   const { accessToken, refreshToken } = await refreshToken();
   useAuthStore.getState().setTokens(accessToken, refreshToken);
   ```
   
   Nếu không set `isAuthenticated`, có thể:
   - Token mới được set
   - Nhưng `isAuthenticated` vẫn là `false`
   - → User bị logout mặc dù có token hợp lệ

2. **Single source of truth**: `isAuthenticated` luôn được sync với `accessToken`:
   ```typescript
   // Luôn đúng: Có token = Authenticated
   isAuthenticated = !!accessToken
   ```

---

### Fix 3: `mounted` State trong Layout

```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

useEffect(() => {
  if (mounted && !isAuthenticated) {
    router.push('/login');
  }
}, [mounted, isAuthenticated, router]);

if (!mounted || !isAuthenticated) {
  return null;
}
```

**Tại sao cần:**

1. **Hydration timing**: 
   ```
   Timeline:
   t0: Component mount (SSR) → mounted = false, isAuthenticated = false
   t1: useEffect chạy → setMounted(true)
   t2: Zustand hydrate từ localStorage → isAuthenticated = true
   t3: Component re-render với state đúng
   ```

2. **Tránh redirect sai**: 
   - **Không có `mounted`**: 
     ```typescript
     // t0: isAuthenticated = false → redirect ngay → SAI!
     if (!isAuthenticated) router.push('/login');
     ```
   
   - **Có `mounted`**:
     ```typescript
     // t0: mounted = false → return null → KHÔNG redirect
     // t1: mounted = true, nhưng chờ hydration
     // t2: isAuthenticated = true → KHÔNG redirect → ĐÚNG!
     if (!mounted || !isAuthenticated) return null;
     ```

3. **SSR-safe**: Trên server, `mounted` luôn là `false`, nên không redirect trên server.

---

## 🔄 Flow hoàn chỉnh sau khi fix

### Khi reload page:

```
1. Browser request → Next.js SSR
   ├─ Server render: mounted = false, isAuthenticated = false
   └─ Return HTML với mounted = false

2. HTML được gửi về browser

3. React hydrate trên client
   ├─ Component mount: mounted = false
   ├─ useEffect chạy: setMounted(true)
   └─ Zustand bắt đầu hydrate từ localStorage

4. Zustand persist middleware
   ├─ Đọc localStorage.getItem('auth-storage')
   ├─ Parse JSON → { user, accessToken, refreshToken, isAuthenticated }
   ├─ Hydrate vào store
   └─ onRehydrateStorage callback chạy
      └─ Nếu có accessToken → set isAuthenticated = true

5. Component re-render
   ├─ mounted = true
   ├─ isAuthenticated = true (từ localStorage)
   └─ Render DashboardLayout → ĐÚNG!

6. Nếu không có token
   ├─ mounted = true
   ├─ isAuthenticated = false
   └─ Redirect to /login → ĐÚNG!
```

---

## 📊 So sánh Trước và Sau

### ❌ Trước khi fix:

```typescript
// auth-store.ts
setTokens: (accessToken, refreshToken) => {
  set({ accessToken, refreshToken });  // ← Không set isAuthenticated
}

// layout.tsx
if (!isAuthenticated) {  // ← Check ngay, chưa hydrate xong
  router.push('/login');
}
```

**Vấn đề:**
- Hydration chưa xong → `isAuthenticated = false` → Redirect sai
- Token refresh không sync `isAuthenticated`
- State không nhất quán

### ✅ Sau khi fix:

```typescript
// auth-store.ts
setTokens: (accessToken, refreshToken) => {
  set({ 
    accessToken, 
    refreshToken,
    isAuthenticated: !!accessToken,  // ← Sync ngay
  });
}

onRehydrateStorage: () => (state) => {
  if (state && state.accessToken) {
    state.isAuthenticated = true;  // ← Fix sau hydration
  }
}

// layout.tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);  // ← Đợi mount
}, []);

if (!mounted || !isAuthenticated) {  // ← Check sau khi hydrate
  return null;
}
```

**Kết quả:**
- ✅ Đợi hydration xong mới check
- ✅ State luôn nhất quán
- ✅ Token refresh sync đúng
- ✅ Không redirect sai

---

## 🎯 Tóm tắt

**3 Fix chính:**

1. **`onRehydrateStorage`**: Đảm bảo `isAuthenticated` đúng sau khi hydrate từ localStorage
2. **`setTokens` sync**: Luôn sync `isAuthenticated` với `accessToken` 
3. **`mounted` state**: Đợi component mount và hydration xong trước khi check auth

**Tại sao persistence hoạt động:**

- Zustand `persist` middleware tự động lưu/đọc từ localStorage
- `onRehydrateStorage` đảm bảo state đúng sau hydration
- `mounted` state tránh check quá sớm
- Kết quả: Auth state được restore đúng từ localStorage sau reload

