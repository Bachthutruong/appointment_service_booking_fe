# Deployment Guide for Vercel

## Cấu hình đã được thiết lập

### 1. File cấu hình Vercel
- `vercel.json`: Cấu hình rewrite rules để tránh lỗi 404
- `.vercelignore`: Loại trừ các file không cần thiết

### 2. Cấu hình Vite
- `vite.config.ts`: Tối ưu build cho production
- Code splitting để tải nhanh hơn
- Tối ưu assets

### 3. Environment Variables
Cần thiết lập trong Vercel Dashboard:
```
VITE_API_URL=https://your-backend-domain.com/api
```

## Các bước deploy

### 1. Chuẩn bị
```bash
cd client
npm install
npm run build
```

### 2. Deploy lên Vercel
1. Kết nối GitHub repository với Vercel
2. Chọn folder `client` làm root directory
3. Thiết lập environment variables
4. Deploy

### 3. Cấu hình Domain
- Thiết lập custom domain nếu cần
- Cấu hình SSL certificate

## Troubleshooting

### Lỗi 404 khi refresh trang
- Kiểm tra `vercel.json` có đúng cấu hình rewrite
- Đảm bảo tất cả routes đều được handle bởi React Router

### Lỗi API connection
- Kiểm tra `VITE_API_URL` environment variable
- Đảm bảo backend API đã được deploy và accessible

### Performance issues
- Kiểm tra code splitting trong `vite.config.ts`
- Sử dụng Vercel Analytics để monitor performance
