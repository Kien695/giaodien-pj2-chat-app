# Chat App

## Tổng quan

Chat App là ứng dụng mạng xã hội và nhắn tin thời gian thực, hỗ trợ trò chuyện cá nhân, trò chuyện nhóm, kết bạn, chia sẻ nội dung, gọi video và quản lý tài khoản trên nhiều thiết bị.

Frontend được xây dựng bằng React và giao tiếp với BE thông qua REST API, Socket.IO và WebRTC.

## Tính năng

### Xác thực và bảo mật tài khoản

- Đăng ký và đăng nhập bằng email, mật khẩu.
- Xác minh tài khoản bằng mã OTP.
- Đăng nhập bằng Google OAuth 2.0.
- Đăng nhập không mật khẩu bằng Passkey/WebAuthn.
- Đăng nhập bằng mã QR và xác nhận trên thiết bị đã đăng nhập.
- Quên mật khẩu, xác minh OTP và đặt lại mật khẩu.
- Đổi mật khẩu trong trang cài đặt.
- Tự động làm mới access token khi phiên đăng nhập còn hợp lệ.
- Route bảo vệ dành cho người dùng đã xác thực.
- Xem danh sách thiết bị/phiên đăng nhập, thu hồi từng phiên hoặc đăng xuất các thiết bị khác.

### Nhắn tin thời gian thực

- Chat 1-1 và chat nhóm bằng Socket.IO.
- Gửi tin nhắn văn bản, emoji, biểu tượng cảm xúc, hình ảnh và tệp đính kèm.
- Xem trước hình ảnh và thông tin tệp trước khi gửi.
- Hiển thị trạng thái đang nhập tin nhắn.
- Hiển thị trạng thái online/offline và thời gian hoạt động gần nhất.
- Theo dõi trạng thái tin nhắn: đang chờ, đang gửi, đã gửi, đã nhận, đã xem và gửi lỗi.
- Hàng đợi tin nhắn tạm thời khi mất kết nối và gửi lại sau khi Socket.IO kết nối lại.
- Đồng bộ các tin nhắn bị bỏ lỡ sau khi kết nối lại.
- Phân trang lịch sử tin nhắn bằng cursor.
- Đếm số tin nhắn chưa đọc theo từng cuộc hội thoại.
- Xóa tin nhắn và cập nhật hội thoại theo thời gian thực.
- Chuyển tiếp/chia sẻ nội dung sang cuộc hội thoại khác.
- Tìm kiếm tin nhắn trong cuộc hội thoại, có debounce và phân trang kết quả.

### Gọi video và âm thanh

- Gọi ngang hàng bằng WebRTC thông qua `simple-peer`.
- Socket.IO được sử dụng làm kênh signaling cho cuộc gọi.
- Nhận, chấp nhận, từ chối và kết thúc cuộc gọi.
- Xử lý trạng thái người dùng bận, không khả dụng và cuộc gọi được trả lời trên thiết bị khác.
- Phát nhạc chuông và quản lý camera/microphone trong cuộc gọi.

### Bạn bè và hồ sơ cá nhân

- Tìm kiếm người dùng.
- Gửi, hủy, chấp nhận hoặc từ chối lời mời kết bạn.
- Hủy kết bạn và quản lý danh sách bạn bè.
- Xem và cập nhật thông tin cá nhân.
- Cập nhật ảnh đại diện và ảnh bìa.

### Nhóm chat

- Tạo nhóm chat từ danh sách bạn bè.
- Thêm hoặc xóa thành viên.
- Chỉnh sửa thông tin và ảnh đại diện nhóm.
- Rời nhóm hoặc xóa nhóm theo quyền được cấp.
- Cập nhật danh sách nhóm và thông tin thành viên theo thời gian thực.

### Thông báo đẩy

- Bật hoặc tắt Web Push từ trang cài đặt.
- Chỉ yêu cầu quyền thông báo sau thao tác chủ động của người dùng.
- Đăng ký Service Worker ở phạm vi gốc của ứng dụng.
- Duy trì định danh thiết bị và subscription ổn định.
- Hiển thị thông báo khi ứng dụng không hoạt động ở foreground.

### Giao diện và trải nghiệm

- Responsive cho desktop và mobile.
- Light Mode và Dark Mode dùng chung hệ thống theme token.
- Áp dụng theme tức thời, lưu lựa chọn trong `localStorage` và dùng theme hệ thống nếu người dùng chưa chọn.
- Hạn chế chớp nền sáng khi khởi động ở Dark Mode.
- Toast, modal, menu, form và các trạng thái tương tác đồng bộ theo theme.
- Error Boundary xử lý lỗi render ngoài dự kiến.

## Công nghệ sử dụng

### Frontend cốt lõi

- React 19 và React DOM.
- Vite 6.
- React Router DOM 7.
- Redux Toolkit và React Redux.
- Axios.

### Giao diện

- Tailwind CSS.
- Material UI 7.
- Emotion (`@emotion/react`, `@emotion/styled`).
- React Icons.
- React Toastify.
- Emoji Picker React.
- React Photo View và React Images Uploading.
- Day.js.

### Realtime, media và bảo mật

- Socket.IO Client.
- WebRTC với `simple-peer`.
- SimpleWebAuthn Browser cho Passkey/WebAuthn.
- React QR Code và React QR Scanner.
- Service Worker và Web Push API.
- Howler.js để phát âm thanh cuộc gọi.

### Backend liên quan

Ứng dụng client kết nối tới backend sử dụng Node.js, Express, Socket.IO, MongoDB/Mongoose, Redis, JWT, Passport Google OAuth, WebAuthn, Cloudinary, Nodemailer và Web Push.

## Cấu hình môi trường

Tạo file `.env` trong thư mục `chat-app`:

```env
VITE_SOCKET_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=your_public_vapid_key
```

- `VITE_SOCKET_URL`: địa chỉ REST API và Socket.IO server.
- `VITE_VAPID_PUBLIC_KEY`: public key dùng để đăng ký Web Push; không phải khóa bí mật.

Sau khi thay đổi biến môi trường, cần khởi động lại Vite.

## Chạy ứng dụng local

```bash
npm install
npm run dev
```

Các lệnh hỗ trợ:

```bash
npm run lint
npm run build
npm run preview
```

## Cấu trúc chính

```text
src/
├── Components/     # Component dùng chung, Settings, cuộc gọi và dialog
├── Layout/         # Bố cục chính sau khi đăng nhập
├── Page/           # Auth, chat, bạn bè, QR, video và các màn hình nghiệp vụ
├── Router/         # Cấu hình route
├── hooks/          # Custom hooks
├── redux/          # Store và các slice người dùng, socket, theme
├── theme/          # MUI theme và design token
└── utils/          # API client, push notification, upload và xử lý tin nhắn

public/
└── push-worker.js  # Service Worker xử lý Web Push
```

## Lưu ý

- Không commit file `.env` hoặc các khóa bí mật.
- WebRTC cần quyền camera/microphone và hoạt động tốt nhất trong secure context.
- Push notification không hoạt động nếu trình duyệt không hỗ trợ Service Worker/Push API hoặc người dùng từ chối quyền.
- API backend phải cấu hình CORS cho đúng origin của frontend.
