# Bộ thiết kế web BLK46

Áp dụng cho Promoter trên Vercel từ đợt thiết kế lại ngày 11/11/2026. Trang chính dùng giấy ngà, mảng đỏ và đen theo bố cục poster biên tập. Các form và cửa sổ hồ sơ giữ nền riêng; màu trang chính được giới hạn trong `body.v-lineup`.

## Nguồn và kiểm tra

- `public/index.html`, khối `:root`: nguồn duy nhất khai báo màu, cỡ chữ và bóng. CSS và JavaScript gọi token.
- `tools/bo-thiet-ke.html`: trang mẫu đọc CSS thật, không xuất bản cùng web.
- `node tools/kiem-token.cjs`: kiểm mã màu gõ thẳng, token thiếu và cỡ chữ ngoài thang.
- `tools/qa/regression.cjs`: kiểm luồng đặt bàn và voucher trong chế độ mẫu trên localhost. Không chạy bộ ghi dữ liệu lên Firebase thật.

## Bảng màu

| Token | Mã | Vai trò |
| --- | --- | --- |
| `--ink` | #100E0E | Nền đen than, chữ trên nền giấy |
| `--paper` | #F0ECE1 | Nền giấy ngà của trang chính, chữ trên nền tối |
| `--accent` | #B8332C | Khối đêm đang chọn, nhãn thứ tự và nút đặt bàn trên thanh đầu |
| `--accent-on` | #FBF7F0 | Chữ trên nền đỏ chính |
| `--acid` | #F4837B | Đỏ sáng cho chữ nhấn, tiêu điểm và trạng thái chọn trên nền tối; tên token giữ tương thích mã cũ |
| `--focus-wash` | rgba(184,51,44,.10) | Nền nhẹ khi ô nhập được chọn |
| `--stage-line` | rgba(251,247,240,.4) | Nét phân cách trên khối đỏ |
| `--portrait`, `--portrait-mark` | #DFD9CC, #B1A798 | Nền và hình dự phòng khi promoter chưa có ảnh |
| `--idol-pink` | #D8D4C9 | Chữ ký promoter, tên token giữ tương thích |
| `--card`, `--card-2` | #191616, #211C1C | Bề mặt tối phụ |
| `--frame`, `--frame-mark` | #292323, #534747 | Ảnh đại diện dự phòng |
| `--paper-2`, `--paper-3` | #d8d4c9, #b9b5aa | Chữ phụ trên nền tối |
| `--line` | rgba(240,236,225,.14) | Đường phân cách |
| `--sheet`, `--sheet-2` | #F7F4EC, #FBF9F3 | Nền vé, form và đánh giá |
| `--muted-p`, `--hint-p` | #4a4842, #6e6a61 | Chữ phụ và gợi ý trên nền giấy |
| `--bad`, `--bad-text`, `--bad-p` | #E20810, #ff6a6f, #b3000b | Lỗi, dùng kèm nội dung giải thích |
| `--good` | #7fd18b | Trạng thái thành công |

Không dùng mảng vàng lớn. Trang chính có ba cấp bề mặt: lịch và danh sách promoter sáng, đêm đang chọn đỏ, thanh đầu và footer đen. Trên khối đỏ, nút đặt bàn dùng nền `--accent-on` và chữ `--ink`. Chữ nhấn trên nền tối dùng `--acid`; form giữ các token tương thích cũ.

## Chữ

- Tên đêm và tiêu đề chọn promoter dùng BT Brik 3XL Oblique từ blkmenu, đã bổ sung 95 glyph tiếng Việt bằng VinaDấu. Ngày nhỏ cạnh tiêu đề dùng sans để dễ đọc. Font WOFF2 nằm ở `public/fonts/BT-Brik-3XL-Oblique-VI.woff2`.
- `--brand-display`: `"BT Brik VN", "Helvetica Neue", Helvetica, Arial, sans-serif`, nghiêng, đậm 700.
- `--display` và `--body`: `"Helvetica Neue", Helvetica, Arial, sans-serif`.
- Chữ ký promoter giữ Yellowtail; màu chuyển về trung tính.
- Tiêu đề phân rã Unicode chuẩn hóa NFC, đo bằng canvas với font thực tế qua `flyFit`; tên Việt có giãn dòng 1,28. Khi font không tải được, dùng sans dự phòng.
- Chữ thường lấy thang `--fs-*` từ 11px đến 28px; thang display `--fs-d-*` từ 22px đến 84px. Tiêu đề lớn dùng phép tính đáp ứng, không gõ thêm cỡ px rời rạc.
- Giữ nguyên outline gốc, thông tin nguồn và giấy phép. Xem `tools/fonts/README.md`, `public/fonts/NOTICE.md`.

## Bố cục trang khách

1. Thanh đầu trang: logo, menu và hotline trên máy tính, nút đặt bàn luôn dùng được khi cuộn.
2. Lịch: chọn tuần rồi chọn một trong bốn đêm. Điện thoại chỉ hiện ngày và thứ; máy tính thêm tên đêm. Không lặp giờ, ưu đãi và nhãn có poster trong từng ô.
3. Đêm đang chọn: khối đỏ chứa tên đêm lớn, ngày, giờ, một mô tả ngắn, nút đặt bàn sáng và đường dẫn chọn promoter. Poster có khung ngà và bóng đen cứng, giữ đủ ảnh trên mọi kích thước.
4. Ưu đãi: đóng mặc định trong `<details>`, mở mới thấy điều kiện và nút nhận voucher.
5. Promoter: thẻ giấy sáng có nhãn thứ tự đỏ hoặc đen; ảnh và tên là nội dung chính, điểm sao là thông tin phụ. Không thêm ảnh giả khi hồ sơ chưa có ảnh. Cách tính xếp hạng và giới hạn nhận bàn nằm trong phần mở rộng.
6. Chân trang: giữ bố cục gọn của PR #3, nền đen và một nét đỏ phía trên. Địa chỉ, giờ mở cửa, liên hệ và mạng xã hội vẫn hiện đủ.

Poster chọn theo thứ tự: poster của đúng đêm đang xem, poster ưu đãi định kỳ cùng thứ, poster lịch tháng có nhãn rõ, ảnh quán, hình dự phòng. Không lấy poster của một ngày khác để minh họa ngày đang chọn. Poster giữ đủ ảnh, bấm để xem lớn.

Điện thoại và máy tính bảng dọc: tiêu đề dùng cả chiều ngang, nút đặt bàn nằm trước phần mô tả và poster. Từ 900px, tiêu đề/nội dung bên trái, poster bên phải. Thẻ promoter vẫn vuốt ngang dưới 700px, ba cột từ 700px, bốn cột từ 1100px.

## Nút và trạng thái

- `.btn-ink` trên khối đỏ: nền ngà, chữ đen; `.btn-acid`, `.hbook` và các form giữ nút đỏ trầm. Tên class giữ để tương thích mã cũ.
- `.wk-n`: chọn đêm, có `aria-pressed`; đêm đang chọn nền đen, ngày đỏ sáng. Tên truy cập lấy từ nội dung hiển thị.
- `.sq`: chọn tuần bằng gạch dưới; khoảng xếp hạng đang chọn có nền đen trên giấy.
- `.promo summary`, `.ranking-details summary`: mở bằng chuột và bàn phím.
- `.pc`: mở hồ sơ, kể cả khi promoter kín bàn để khách có thể đặt ngày khác.
- `.pdlg`: xem poster; `.sdlg`: hồ sơ promoter. Các thao tác đặt bàn giữ ngày đang chọn.
- Thẻ promoter lấy tên truy cập từ nội dung, mô tả bổ sung qua `rosterTitle`. Radio voucher chỉ dùng `aria-checked`, không kết hợp `aria-pressed`.
- Hiệu ứng nhấc thẻ khi rê chuột chỉ áp dụng khi thiết bị có hover và người dùng không yêu cầu giảm chuyển động.

Đổi tuần tự chọn đêm đầu trong tuần nếu ngày cũ không thuộc tuần mới. Voucher nhận qua nút ưu đãi hoặc poster giữ đúng ngày đã chọn; các lần render thường giữ dữ liệu khách đã sửa. Snapshot dữ liệu giữ phần đang mở và tiêu điểm; đổi đêm đóng ưu đãi cũ.

## Kiểm chứng

- Chạy kiểm token và bộ hồi quy bằng dữ liệu mẫu trước khi xuất bản.
- Chụp trước/sau ở 390px và 1440px; kiểm thêm 320/768/1024px.
- Kiểm chữ Việt thực tế bằng Chrome DevTools Protocol, không chỉ nhìn tên CSS.
- Kiểm axe và bàn phím; một lần axe đạt không thay thế kiểm khả năng tiếp cận thủ công đầy đủ.
- Không gửi đặt bàn hoặc voucher thử vào Firebase thật.
