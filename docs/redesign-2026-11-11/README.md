# Promoter: bảng màu đỏ và bố cục gọn hơn

Thay mảng vàng bằng nền đen than và chữ trắng ngà. Màu đỏ dành cho hành động chính và trạng thái chọn, để poster đỏ là điểm nhấn của trang.

- Lịch chọn tuần và đêm nằm trước nội dung đêm; bỏ thông tin giờ và ưu đãi lặp trong từng ô.
- Poster có trên điện thoại, khớp với đêm, ưu đãi cùng thứ hoặc lịch tháng có nhãn rõ.
- Ưu đãi và cách tính xếp hạng đóng mặc định; giữ trạng thái mở và bàn phím khi dữ liệu cập nhật.
- Thu gọn mô tả, liên kết phụ, nhãn và phần chân trang; giữ nguyên BT Brik có dấu do VinaDấu tạo.
- Ngày đã chọn đi theo nút đặt bàn, voucher và nút nhận voucher trong poster; dữ liệu khách vẫn giữ khi đổi người hoặc xem lại poster.

## Ảnh trước và sau

Các ảnh dùng dữ liệu mẫu, cùng đêm 12/11/2026.

| Kích thước | Trước | Sau |
| --- | --- | --- |
| Điện thoại 390px | [trước](before-390.png) | [sau](after-390.png) |
| Máy tính 1440px | [trước](before-1440.png) | [sau](after-1440.png) |

## Kiểm chứng

- `node tools/kiem-token.cjs`: đạt, không có mã màu ngoài token hoặc cỡ chữ ngoài thang.
- Bộ hồi quy: **18/18 đạt**, có ca voucher tuần sau qua hai lối vào, xem poster khi tên và số điện thoại chưa đồng bộ, cập nhật dữ liệu khi phần chi tiết đang mở.
- Chrome ở 320/390/768/1024/1440px: không tràn ngang hoặc lỗi JavaScript; tiêu đề tiếng Việt thực sự dùng BT Brik 3XL Viet.
- axe-core 4.14.0: không phát hiện vi phạm trong các nhóm WCAG A/AA đã chạy ở trang đầu và form, trên năm kích thước. Đây là kiểm tự động, chưa phải đánh giá khả năng tiếp cận đầy đủ.
- Hai lượt review mã đã phát hiện và kiểm lại lỗi ngày voucher, mất dữ liệu khi xem lại poster, phần mở rộng và logo dự phòng.

Kết quả thô: [đặt bàn và voucher](booking-results.json), [giao diện, font và axe](local-visual-qa.json). Bộ hồi quy chỉ gửi dữ liệu vào bản demo cục bộ; chưa kiểm thao tác ghi trên Firebase thật.
