# CLAUDE.md — avpg-newemployee

## Project
Ứng dụng tạo ảnh chào mừng nhân viên mới của AVP Group.

- **Live:** https://avpg-newemployee.vercel.app/
- **Repo:** https://github.com/arikita/avpg-newemployee
- **Backend API:** https://avpg-newemployee.onrender.com

## Kiến trúc
```
Frontend (Vue 3 + Vite)  →  Backend API (Express + Sharp)
      Vercel                        Render
```

## Thư mục làm việc
| Thư mục | Mô tả |
|---|---|
| `frontend-new/` | Frontend hiện tại — Vue 3 + Vite + Vuetify. **Đây là thư mục chính.** |
| `backend/` | Express.js API server xử lý ảnh bằng Sharp |
| `frontend/` | Phiên bản cũ — không dùng nữa |

## Files quan trọng
| File | Vai trò |
|---|---|
| `frontend-new/src/views/EmployeeForm.vue` | Form nhập liệu + crop ảnh + gọi API `/generate` |
| `frontend-new/vite.config.js` | Dev server config (port 5173, host `newstaff.anvietphatgroup.com`) |
| `backend/server.js` | API POST `/generate` — nhận form data, ghép ảnh PNG trả về |
| `backend/assets/bg.jpg` | Ảnh nền template (1000×700px) |
| `backend/assets/logo.png` | Logo công ty trên ảnh kết quả |
| `ecosystem.config.js` | PM2 config cho server nội bộ `dksvr` |

## Deploy

### Frontend → Vercel
Vercel kết nối GitHub, tự deploy khi push `main`.
- Root dir: `frontend-new`
- Build: `npm run build`
- Output: `frontend-new/dist`

### Backend → Render
Render kết nối GitHub, tự deploy khi push `main`.
- Root dir: `backend`
- Start: `node server.js`
- **Cold start:** backend ngủ sau 15 phút không dùng, lần đầu gọi chậm ~30-60 giây.

```bash
# Push sau khi sửa là đủ
git add .
git commit -m "..."
git push
```

## Lưu ý quan trọng
- **URL backend** hardcode trong `frontend-new/src/views/EmployeeForm.vue`:
  `https://avpg-newemployee.onrender.com/generate` — nếu đổi backend host thì phải đổi ở đây.
- **Crop ảnh** dùng `vue-cropperjs`, output 500×500px JPEG trước khi gửi lên backend.
- Backend dùng **Sharp** để ghép ảnh — không có database, không có lưu file, trả về blob thẳng.
- **PM2 trên dksvr** (`/home/dksvr/Documents/welcome-employee/`) là môi trường nội bộ cũ, backend production hiện đang trên Render.
- Repo SSH alias: `github-avpg-newemployee` (deploy key trên server `clasvr`).

## Liên hệ hệ thống
- Portal tuyển dụng: https://arikita.github.io/avpg-portal/ (repo: `arikita/avpg-portal`)
- Portal có button "Welcome to new employee" trỏ thẳng về app này
