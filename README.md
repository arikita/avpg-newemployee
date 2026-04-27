# AVP Group - New Employee App

Ứng dụng tạo **ảnh chào mừng nhân viên mới** của **Công ty Cổ phần Năng lượng An Việt Phát**.

**Live URL:** https://avpg-newemployee.vercel.app/

---

## Tính năng

1. Nhập thông tin nhân viên: họ tên, chức vụ, phòng ban, SĐT, ngày bắt đầu, giới tính
2. Upload và căn chỉnh ảnh đại diện (crop hình tròn)
3. Gửi lên backend → nhận về ảnh chào mừng PNG đã ghép sẵn
4. Tải ảnh về máy

---

## Kiến trúc hệ thống

```
[Trình duyệt nhân viên]
        │
        ▼
[Frontend — Vercel]                     [Frontend — Local (dksvr)]
https://avpg-newemployee.vercel.app     http://newstaff.anvietphatgroup.com
        │                                         │
        └──────────────┬───────────────────────────┘
                       │ POST /generate (multipart)
                       ▼
             [Backend — Render]
       https://avpg-newemployee.onrender.com
```

| Layer | Công nghệ | Hosting |
|---|---|---|
| Frontend (production) | Vue 3 + Vite + Vuetify | Vercel |
| Frontend (nội bộ) | Vue 3 + Vite | PM2 trên `dksvr` |
| Backend API | Express.js + Sharp | Render (cloud) |

> **Lưu ý:** Backend trên Render có thể **ngủ (cold start)** sau 15 phút không hoạt động. Lần gọi đầu tiên có thể chậm 30-60 giây.

---

## Cấu trúc thư mục

```
avpg-newemployee/
├── backend/               # Express.js API server
│   ├── assets/
│   │   ├── bg.jpg         # Ảnh nền template (1000x700)
│   │   └── logo.png       # Logo công ty
│   ├── server.js          # API /generate — xử lý ảnh với Sharp
│   ├── package.json
│   └── package-lock.json
├── frontend/              # Phiên bản frontend cũ (không dùng)
├── frontend-new/          # Frontend hiện tại (Vue 3 + Vite)
│   ├── src/
│   │   ├── views/
│   │   │   ├── EmployeeForm.vue   # Form nhập thông tin + gọi API
│   │   │   └── HomeView.vue
│   │   ├── router/index.js
│   │   └── main.js
│   ├── public/
│   │   └── avpgicon.ico
│   ├── vite.config.js     # Config dev server (port 5173, host dksvr)
│   └── package.json
├── ecosystem.config.js    # PM2 config cho server dksvr
├── package.json           # cropperjs dependency
└── README.md
```

---

## Backend API

**Endpoint:** `POST https://avpg-newemployee.onrender.com/generate`

**Form fields:**
| Field | Kiểu | Mô tả |
|---|---|---|
| `name` | text | Họ và tên |
| `position` | text | Chức vụ |
| `department` | text | Phòng ban |
| `phone` | text | Số điện thoại |
| `startDate` | text | Ngày bắt đầu (YYYY-MM-DD) |
| `gender` | text | `Nam` hoặc `Nữ` |
| `image` | file | Ảnh đại diện (JPEG/PNG, max 5MB) |

**Response:** PNG image buffer

---

## Hướng dẫn chỉnh sửa

### Thay đổi ảnh nền hoặc logo
Thay file trong `backend/assets/`:
- `bg.jpg` — template nền (kích thước 1000x700px)
- `logo.png` — logo hiển thị trên ảnh

Commit và push → Render tự redeploy.

### Thay đổi nội dung text trên ảnh
Mở `backend/server.js`, tìm phần tạo SVG (`<svg>`) để chỉnh font, vị trí, nội dung text.

### Thêm trường thông tin mới
1. Thêm `<input>` vào `frontend-new/src/views/EmployeeForm.vue`
2. Thêm field vào `formData.append(...)` trong method `generateImage()`
3. Nhận và xử lý field trong `backend/server.js`

---

## Triển khai

### Frontend (Vercel)
- Kết nối với repo GitHub → Vercel auto-deploy khi push lên `main`
- Build command: `npm run build` (trong thư mục `frontend-new`)
- Output dir: `frontend-new/dist`

### Backend (Render)
- Kết nối với repo GitHub → Render auto-deploy khi push lên `main`
- Root dir: `backend`
- Start command: `node server.js`
- Port: `3000` (Render tự map ra public)

### PM2 trên dksvr (nội bộ)
```bash
# Khởi động
pm2 start ecosystem.config.js

# Kiểm tra trạng thái
pm2 status

# Xem log
pm2 logs frontend
pm2 logs backend
```

---

## Liên kết hệ thống

| Hệ thống | URL |
|---|---|
| App nhân viên mới (site này) | https://avpg-newemployee.vercel.app/ |
| Portal tuyển dụng | https://arikita.github.io/avpg-portal/ |
| Backend API | https://avpg-newemployee.onrender.com |
| Repo portal | https://github.com/arikita/avpg-portal |

---

## Quản lý từ server

Repository được clone tại server `kontumenery` (`clasvr`):
```
/home/clasvr/projects/avpg-newemployee/
```
SSH deploy key đã được cấu hình — có thể push trực tiếp từ server.
