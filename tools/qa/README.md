# Kiểm tra luồng đặt bàn

Chỉ chạy trên bản cục bộ có `?demo=1`. Bộ kiểm tra dùng dữ liệu mẫu, không đăng nhập hoặc gửi yêu cầu đến Firebase thật.

Từ thư mục gốc repo:

```sh
npm ci --prefix tools/qa
python -m http.server 8791 --bind 127.0.0.1 --directory public
```

Giữ máy chủ chạy và mở terminal thứ hai:

```sh
npm test --prefix tools/qa
```

Cần Google Chrome được cài trên máy. Kết quả JSON lưu ở `.qa/booking-results.json`. Biến `PROMOTER_BASE_URL` đổi địa chỉ máy chủ cục bộ; `PROMOTER_QA_OUTPUT` đổi nơi ghi kết quả. Bộ kiểm tra từ chối địa chỉ bên ngoài máy cục bộ.

Các ca bao gồm ngày đêm được chọn, ngày sau nửa đêm, bảo toàn thông tin khi đổi promoter, giữ bàn khi ngày chỉ đổi cách viết, promoter kín bàn, radio bàn phím, sơ đồ bàn tùy chọn, tên dài, tiếng Việt và font dự phòng.

Đợt tinh gọn giao diện bổ sung kiểm poster trên điện thoại, ưu đãi gập lại, ngày voucher tuần sau qua nút và poster, giữ tên/số điện thoại khi xem lại poster, và giữ phần chi tiết cùng tiêu điểm khi dữ liệu tự cập nhật. Tổng cộng 18 ca.

Chạy `npm run test:typography --prefix tools/qa` để kiểm thêm 320/390/768/1280/1440px với BT Brik đã được VinaDấu tạo dấu. Bộ này đọc font thực tế của glyph qua Chrome DevTools Protocol, kiểm NFC, dấu chồng và tràn ngang; ảnh và kết quả nằm ở `docs/audit-2026-11-11/vietnamese/`.
