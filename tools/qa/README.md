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
