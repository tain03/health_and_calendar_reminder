# 💊 Nhắc nhở sức khỏe hàng ngày (HealthSync Console)

Ứng dụng chạy ngầm hệ thống (system tray), nhắc nhở uống thuốc, uống nước định kỳ và đi bộ vận động trên Windows. Cấu hình và quản trị trực tiếp thông qua giao diện Web UI siêu đẳng cấp, mượt mà và trực quan!

---

## 🎨 Điểm Nhấn Thiết Kế & Font Tiếng Việt Hoàn Hảo (UI/UX)
* **Be Vietnam Pro & Inter Font Pairing**:
  - Sử dụng **Be Vietnam Pro** làm font chữ chủ đạo cho các tiêu đề lớn nhỏ. Font chữ này được tối ưu hóa xuất sắc cho tiếng Việt, loại bỏ hoàn toàn hiện tượng lỗi hiển thị dấu tiếng Việt hoặc lệch kerning thường gặp trên các font mặc định.
  - Kết hợp với **Inter** mượt mà cho các thông số và mô tả, mang lại cảm giác cực kỳ cao cấp, chuẩn chỉ kiểu dáng SaaS quốc tế.
* **Premium OLED Dark Mode**: Tông màu nền sâu thẳm cực sang trọng (`#020617`), kết hợp hiệu ứng kính mờ thời thượng (**Glassmorphism** với `backdrop-filter: blur(16px)`) và các đường viền Indigo mờ phát sáng nhẹ.
* **Micro-animations & Custom Controls**: Các nút gạt chuyển động phản hồi cực kỳ nhanh nhạy, tự động làm mờ (`opacity: 0.45`) các phần cài đặt tương ứng khi vô hiệu hóa hoạt động.
* **100% Vector Icons**: Thay thế toàn bộ emoji bằng các biểu tượng SVG tùy chỉnh sắc nét, giúp giao diện tối giản và tinh tế.

---

## 🚀 Hoạt Ảnh Bento Grid Tương Tác Sống Động
Không chỉ là trang cấu hình tĩnh, HealthSync Console sở hữu bộ ba hoạt ảnh Bento cực kỳ bắt mắt:
1. **Uống nước — Liquid Wave (Dâng nước sóng sánh)**:
   - Bình nước thủy tinh 3D mượt mà. Khi bạn nhấn nút `+` hoặc `-`, mực nước xanh lam tinh khiết dâng lên/hạ xuống theo chu kỳ 8 ly, chuyển động sóng nước gợn đều nhờ CSS Keyframe Animation!
2. **Dùng thuốc — Capsule Release (Tách vỏ nhả hạt)**:
   - Một viên thuốc con nhộng (capsule) thủy tinh nghiêng 45 độ. Khi bạn nhấn chọn "Đã uống", viên thuốc sẽ **xoay góc, tách đôi vỏ con nhộng và thả rơi các hạt hạt nano phát sáng màu xanh lá**, tạo cảm giác thuốc đang được giải phóng đầy chân thực!
3. **Đi bộ — Walking Path Trail (Đường đi phát sáng)**:
   - Một bản đồ đường đi uốn lượn dạng chấm mờ.
   - **Tương tác Hộp kiểm Kép (Morning & Afternoon Checkboxes)**:
     Thẻ Đi bộ trong Bento Grid sở hữu **2 checkbox độc lập** cho **Buổi sáng** và **Buổi chiều**.
     - Khi bạn chỉ tick một trong hai buổi, dòng trạng thái dưới bản đồ sẽ thông báo trực quan (ví dụ: *"Đã đi buổi sáng, còn buổi chiều"* hoặc *"Đã đi buổi chiều, còn buổi sáng"*) và thanh tiến độ chính **chưa tăng thêm điểm**.
     - Ngay khi **tick chọn cả hai buổi** $\rightarrow$ Hệ thống đánh giá là hoàn thành hoàn toàn mục tiêu đi bộ ngày: Vệt sáng xanh lá (Walker Dot) sẽ **chạy dọc cung đường uốn lượn**, đường vẽ sáng lên rực rỡ, dòng trạng thái đổi sang màu xanh báo hiệu *"Đã hoàn thành cả 2 buổi! 🎉"*, và thanh tiến độ tổng lập tức **tăng thêm đúng 1/3 (33%)**!

---

## 📅 Hẹn Giờ Thông Minh & Tự Động Reset
* **2 Lần Đi Bộ Mỗi Ngày**: Hỗ trợ cấu hình hai khung giờ nhắc nhở riêng biệt cho hoạt động đi bộ:
  - **Nhắc nhở Buổi sáng**: Đặt giờ cụ thể (mặc định `08:30`), tự động gửi thông báo vận động đón ngày mới.
  - **Nhắc nhở Buổi chiều**: Đặt giờ cụ thể (mặc định `17:30`), gửi thông báo thư giãn sau ngày làm việc.
  - Mỗi khung giờ sở hữu một **đồng hồ đếm ngược thời gian thực (Live Countdown Timer)** riêng biệt, hiển thị cực kỳ trực quan!
* **Reset Lúc 7:00 AM Hàng Ngày**: Thay vì reset lúc nửa đêm làm mất thống kê của những hôm thức khuya, hệ thống tự động thiết lập ranh giới ngày thống kê mới lúc **7:00 AM**. 
  - Toàn bộ chỉ số stats sẽ được lưu giữ nguyên vẹn cho tới 7 giờ sáng hôm sau và tự động làm mới hoàn toàn nhờ luồng chạy quét ngầm (Background thread).

---

## 🛠️ Cài đặt & Khởi chạy

### Bước 1 — Cài đặt thư viện cần thiết
Mở Terminal tại thư mục dự án và chạy:
```bash
pip install -r requirements.txt
```

### Bước 2 — Khởi chạy ứng dụng
Chạy lệnh sau:
```bash
python app.py
```
*Ứng dụng sẽ tự động khởi động máy chủ Web tại địa chỉ `http://127.0.0.1:5678` và mở trang quản trị trên trình duyệt mặc định của bạn.*

---

## 🎮 Cách dùng & Tương tác

| Hành động | Kết quả |
|-----------|---------|
| **Double-click icon khay hệ thống** | Mở bảng điều khiển Web UI trên trình duyệt |
| **Click phải → Cài đặt (Web)** | Mở bảng điều khiển Web UI trên trình duyệt |
| **Click phải → Test thông báo** | Gửi thử thông báo kiểm tra ngay lập tức |
| **Click phải → Thoát** | Đóng hoàn toàn ứng dụng ngầm và dừng nhắc nhở |

### Trong giao diện Web điều khiển:
* **Bật/tắt & Chỉnh giờ**: Cho phép bật/tắt riêng lẻ từng loại nhắc nhở và cấu hình giờ giấc (`HH:MM`). Khi tắt một loại, phần nhập liệu sẽ mờ đi rất thông minh.
* **Nhắc uống nước theo chu kỳ**: Nhắc nhở sau mỗi `N` giờ (tùy chỉnh 1 đến 8 giờ/lần).
* **Gửi thử thông báo**: Nút "Gửi thử thông báo" trên từng thẻ giúp bạn kiểm tra hoạt động của loại nhắc nhở đó ngay lập tức.
* **Thoát App từ trình duyệt**: Tắt an toàn hoàn toàn ứng dụng chạy ngầm ngay trên Web Dashboard.

---

## 📅 Tích Hợp Lịch Làm Việc LG 2026 (Mới)
Hệ thống **HealthSync Console** đã tích hợp trọn vẹn ứng dụng **Lịch làm việc LG 2026** chạy chung trên cùng một máy chủ nội bộ:
* **Địa chỉ truy cập Lịch**: `http://127.0.0.1:5678/calendar`
* **Điều hướng 2 chiều siêu mượt**:
  - Tại **HealthSync Console**: Có nút **"Lịch Làm Việc LG 📅"** phát sáng trên Header giúp bạn chuyển sang xem lịch tức thì.
  - Tại **LG Work Calendar**: Có nút **"HealthSync Console 💊"** nổi bật ở Sidebar bên trái giúp bạn quay lại trang điều khiển sức khỏe chỉ với 1 click!
* **Độc lập & Tối ưu**: Cả hai trang chia sẻ chung tài nguyên máy chủ Python siêu nhẹ, giúp tiết kiệm bộ nhớ tối đa!

