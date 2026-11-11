# Audit UX/UI Promoter, 11/11/2026

Kết luận: mức đánh giá 4/10 của người dùng có cơ sở. Trang đang đặt quá nhiều hành động và hiệu ứng ở cùng một cấp; ngoài hình thức còn có lỗi nối ngày và bảo toàn form. Bản sửa trong nhánh này được reviewer thị giác đánh giá chủ quan khoảng 7/10 với dữ liệu mẫu, chưa có cơ sở xác nhận 8/10.

Nguồn mã trước sửa: Promoter `e97d999`. Font tham chiếu: blkmenu `438a856aee283c21d7ac3782eccbff88869a6e19`. Ba hướng audit độc lập: luồng khách/nhân viên, thị giác/khả năng tiếp cận, font. Hai reviewer mã nguồn tiếp tục kiểm bản sửa và xác minh lại lỗi tìm được.

## Vấn đề và bản sửa

| Ưu tiên | Trước sửa | Trong bản sửa |
|---|---|---|
| P1 | Ngày của hero, header, roster và hồ sơ không nhất quán | Ngày đang xem đi theo luồng đặt bàn; tình trạng promoter đọc đúng ngày |
| P1 | Đổi promoter xóa dữ liệu khách đã nhập | Giữ tên, điện thoại, lịch, số khách, ghi chú, lựa chọn bàn và voucher |
| P2 | Thẻ kín bàn bị khóa, không mở được nút đổi ngày | Vẫn xem hồ sơ, focus ô ngày khi chọn ngày khác; vẫn chặn gửi ngày đã kín |
| P2 | Nút đặt bàn, chọn promoter, menu, điện thoại và voucher cùng tranh chú ý | Một nút chính, các hành động phụ nhẹ hơn; voucher giảm viền và bóng |
| P2 | Font không giống blkmenu; phép tính tiêu đề cố định theo Anton | BT Brik 3XL Oblique thật, thêm dấu Việt bằng VinaDấu; đo font thực bằng canvas |
| P2 | Nhiễu nền, thẻ xoay, băng keo và nhãn hạng quá mạnh | Bỏ lớp nhiễu và góc xoay; bốn cột desktop lớn, ba cột tablet, mobile vuốt ngang |
| P2 | Sơ đồ bàn mở sẵn trước nút gửi | Gập sơ đồ tùy chọn, nhãn bàn cập nhật khi chọn và bỏ chọn |
| P2 | Radio danh xưng sai ARIA và mất focus khi dựng lại | `aria-checked`, một điểm Tab, phím mũi tên/Home/End, phục hồi focus |

Trong vòng review còn phát hiện và đã sửa: so sánh ngày theo chuỗi làm mất bàn khi `20/11/2026` đổi thành `20/11`; watcher bỏ counts đêm hôm trước sau nửa đêm; nhãn bàn bị cũ khi bỏ chọn.

## Font dùng chính xác

- blkmenu thực tế dùng BT Brik cho display và `"Helvetica Neue", Helvetica, Arial, sans-serif` cho chữ thường, không phải Helvetica Now đã được tải lên web.
- BT Brik 3XL Oblique dùng outline nghiêng thật, `font-style: oblique`, `font-weight: 700`. Tệp triển khai được kiểm trả HTTP 200 và CORS `*`.
- Theo yêu cầu tiếp theo của người dùng, dùng bộ tạo dấu thật của VinaDấu để thêm 95 ký tự Việt còn thiếu, giữ 40 ký tự đã có. Cả tiêu đề Latin và Việt dùng cùng BT Brik, không còn chuyển cả dòng tiếng Việt sang sans. NFC xử lý cả chữ phân rã.
- Font nguồn khớp SHA-256 với tệp đang phục vụ tại blkmenu. Bản mở rộng WOFF2 được lưu cùng Promoter, giữ thông tin gốc và ghi nhận nguồn dấu; có sans dự phòng khi tải lỗi. Yellowtail cạnh logo giữ nguyên. [Ảnh, bảng glyph và kiểm chứng mới](vietnamese/README.md).

## Bằng chứng

Ảnh chỉ dùng hồ sơ và đánh giá mẫu; không phải số liệu kinh doanh hoặc hồ sơ khách thật.

| Kích thước | Trước | Sau |
|---|---|---|
| Máy tính 1280px | [Ảnh trước](before-lineup-1280.png) | [Ảnh sau](after-lineup-1280.png) |
| Điện thoại 390px | [Ảnh trước](before-lineup-390.png) | [Ảnh sau](after-lineup-390.png) |

Ảnh bổ sung: [form điện thoại](after-booking-390.png), [hồ sơ điện thoại](after-profile-390.png).

- [13/13 ca hồi quy đạt](regression.json), có assertion kiểm dữ liệu booking thực lưu vào localStorage của bản demo; chạy lại theo [hướng dẫn](../../tools/qa/README.md).
- [Kiểm chữ Việt trên năm độ rộng 320/390/768/1280/1440px](vietnamese/browser-results.json): font thực của glyph là BT Brik 3XL Viet, không rơi sang font hệ thống, dấu chồng vừa dòng, không tràn ngang. Ba reviewer duyệt phần bổ sung dấu và tích hợp.
- Bốn viewport 390, 768, 1280, 1440px: không tràn ngang, không có `pageerror`, không có phản hồi HTTP lỗi trong lần chụp cục bộ.
- Axe trên lineup và form: trước có lỗi `aria-allowed-attr` ở hai nút danh xưng; sau không còn violation ở các rule WCAG 2 A/AA, 2.1 AA, 2.2 AA đã chạy. Kết quả này không tương đương chứng nhận WCAG hoặc kiểm trình đọc màn hình.
- Kiểm token của repo và `git diff --check` đạt. Không có bộ build hoặc typecheck TypeScript trong repo thuần HTML/JS này.
- [Kết quả chụp trước](before-results.json), [kết quả chụp sau](after-results.json). Ảnh hồ sơ trước bắt giữa hoạt ảnh nên không dùng để kết luận lỗi hiển thị; ảnh cuối đã đợi hoạt ảnh xong.

Đánh giá thị giác độc lập cuối: phân cấp 7/10, nhất quán 7,5/10, điện thoại 7/10. Đây là nhận định thiết kế từ ảnh 390/1280px, không phải thang đo tự động.

## Giới hạn và việc còn mở

- Chưa xác minh luồng với dữ liệu Firebase production. URL live trả HTTP 200 nhưng ảnh chụp chỉ bắt được phần khung và trạng thái đang tải, không dùng làm bằng chứng ứng dụng production hoạt động đầy đủ. Bản sửa chưa merge hoặc triển khai.
- Sau nửa đêm, hero/roster theo đêm bắt đầu hôm trước; form giữ quy ước ngày dân sự Việt Nam của giờ đến hiện có. Đã kiểm riêng tải counts cho đêm đang diễn ra và ngày form hợp lệ; không đổi schema booking.
- Trang quản lý còn nên ưu tiên yêu cầu chờ xác nhận trước cấu hình/dung lượng. Đợt này ghi nhận, chưa sắp xếp lại nghiệp vụ quản lý.
- Bộ chấm sao trên tablet còn cần hoàn thiện bàn phím nhóm radio; lỗi form còn cần nối thông báo tới từng trường. Không tuyên bố đã audit đầy đủ mọi trạng thái quản lý/tablet hoặc đạt WCAG toàn site.
- Cần xem thêm với ảnh và tên promoter thật trước khi chốt thẩm mỹ cuối.

Ba bước tiếp theo: xem bản trước/sau, thử form với dữ liệu thật trên môi trường xem trước, rồi mới quyết định merge và kiểm production.
