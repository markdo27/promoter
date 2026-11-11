# Bộ thiết kế web BLK46

Áp dụng cho Promoter trên Vercel từ đợt tinh gọn ngày 11/11/2026. Poster và in ấn vẫn theo bộ nhận diện gốc; giao diện web dùng nền trung tính để hợp với các poster đỏ.

## Nguồn và kiểm tra

- `public/index.html`, khối `:root`: nguồn duy nhất khai báo màu, cỡ chữ và bóng. CSS và JavaScript gọi token.
- `tools/bo-thiet-ke.html`: trang mẫu đọc CSS thật, không xuất bản cùng web.
- `node tools/kiem-token.cjs`: kiểm mã màu gõ thẳng, token thiếu và cỡ chữ ngoài thang.
- `tools/qa/regression.cjs`: kiểm luồng đặt bàn và voucher trong chế độ mẫu trên localhost. Không chạy bộ ghi dữ liệu lên Firebase thật.

## Bảng màu

| Token | Mã | Vai trò |
| --- | --- | --- |
| `--ink` | #100E0E | Nền đen than, chữ trên nền giấy |
| `--paper` | #F0ECE1 | Chữ trắng ngà và nền form |
| `--accent` | #B8332C | Nền đỏ của nút đặt bàn chính |
| `--accent-on` | #FBF7F0 | Chữ trên nền đỏ chính |
| `--acid` | #F4837B | Đỏ sáng cho chữ nhấn, tiêu điểm và trạng thái chọn trên nền tối; tên token giữ tương thích mã cũ |
| `--focus-wash` | rgba(184,51,44,.10) | Nền nhẹ khi ô nhập được chọn |
| `--idol-pink` | #D8D4C9 | Chữ ký promoter, tên token giữ tương thích |
| `--card`, `--card-2` | #191616, #211C1C | Bề mặt tối phụ |
| `--frame`, `--frame-mark` | #292323, #534747 | Ảnh đại diện dự phòng |
| `--paper-2`, `--paper-3` | #d8d4c9, #b9b5aa | Chữ phụ trên nền tối |
| `--line` | rgba(240,236,225,.14) | Đường phân cách |
| `--sheet`, `--sheet-2` | #F7F4EC, #FBF9F3 | Nền vé, form và đánh giá |
| `--muted-p`, `--hint-p` | #4a4842, #6e6a61 | Chữ phụ và gợi ý trên nền giấy |
| `--bad`, `--bad-text`, `--bad-p` | #E20810, #ff6a6f, #b3000b | Lỗi, dùng kèm nội dung giải thích |
| `--good` | #7fd18b | Trạng thái thành công |

Không dùng mảng vàng lớn. Trên nền tối, nút chính dùng `--accent` và `--accent-on`; chữ nhấn dùng `--acid` để đủ tương phản. Các form và nút cũ vẫn nhận màu tương thích qua token.

## Chữ

- Tên đêm dùng BT Brik 3XL Oblique từ blkmenu, đã bổ sung 95 glyph tiếng Việt bằng VinaDấu. Font WOFF2 nằm ở `public/fonts/BT-Brik-3XL-Oblique-VI.woff2`.
- `--brand-display`: `"BT Brik VN", "Helvetica Neue", Helvetica, Arial, sans-serif`, nghiêng, đậm 700.
- `--display` và `--body`: `"Helvetica Neue", Helvetica, Arial, sans-serif`.
- Chữ ký promoter giữ Yellowtail; màu chuyển về trung tính.
- Tiêu đề phân rã Unicode chuẩn hóa NFC, đo bằng canvas với font thực tế qua `flyFit`; tên Việt có giãn dòng 1,28. Khi font không tải được, dùng sans dự phòng.
- Chữ thường lấy thang `--fs-*` từ 11px đến 28px; thang display `--fs-d-*` từ 22px đến 84px. Tiêu đề lớn dùng phép tính đáp ứng, không gõ thêm cỡ px rời rạc.
- Giữ nguyên outline gốc, thông tin nguồn và giấy phép. Xem `tools/fonts/README.md`, `public/fonts/NOTICE.md`.

## Bố cục trang khách

1. Thanh đầu trang: logo, menu và hotline trên máy tính, nút đặt bàn luôn dùng được khi cuộn.
2. Lịch: chọn tuần rồi chọn một trong bốn đêm. Điện thoại chỉ hiện ngày và thứ; máy tính thêm tên đêm. Không lặp giờ, ưu đãi và nhãn có poster trong từng ô.
3. Đêm đang chọn: tên đêm, ngày, giờ, một mô tả ngắn, nút đặt bàn và đường dẫn chọn promoter. Poster có trên mọi kích thước màn hình.
4. Ưu đãi: đóng mặc định trong `<details>`, mở mới thấy điều kiện và nút nhận voucher.
5. Promoter: ảnh và tên là nội dung chính; điểm sao là thông tin phụ. Cách tính xếp hạng và giới hạn nhận bàn nằm trong phần mở rộng.
6. Chân trang: địa chỉ, giờ mở cửa, liên hệ và các biểu tượng mạng xã hội trung tính.

Poster chọn theo thứ tự: poster của đúng đêm đang xem, poster ưu đãi định kỳ cùng thứ, poster lịch tháng có nhãn rõ, ảnh quán, hình dự phòng. Không lấy poster của một ngày khác để minh họa ngày đang chọn. Poster giữ đủ ảnh, bấm để xem lớn.

Điện thoại dùng hai cột cho tiêu đề và poster nhỏ; phần mô tả và nút nằm dưới. Từ 900px, poster nằm ở cột phải. Thẻ promoter vẫn vuốt ngang dưới 700px, ba cột từ 700px, bốn cột từ 1100px.

## Nút và trạng thái

- `.btn-ink`, `.btn-acid`, `.hbook`: đỏ trầm, chữ trắng ngà. Tên class giữ để tương thích mã cũ.
- `.wk-n`: chọn đêm, có `aria-pressed`; đêm đang chọn có gạch đỏ sáng và bề mặt tối nhẹ.
- `.sq`: chọn tuần hoặc khoảng thời gian, chọn bằng gạch dưới thay cho nhiều khung nút cạnh tranh.
- `.promo summary`, `.ranking-details summary`: mở bằng chuột và bàn phím.
- `.pc`: mở hồ sơ, kể cả khi promoter kín bàn để khách có thể đặt ngày khác.
- `.pdlg`: xem poster; `.sdlg`: hồ sơ promoter. Các thao tác đặt bàn giữ ngày đang chọn.

Đổi tuần tự chọn đêm đầu trong tuần nếu ngày cũ không thuộc tuần mới. Voucher nhận qua nút ưu đãi hoặc poster giữ đúng ngày đã chọn; các lần render thường giữ dữ liệu khách đã sửa. Snapshot dữ liệu giữ phần đang mở và tiêu điểm; đổi đêm đóng ưu đãi cũ.

## Kiểm chứng

- Chạy kiểm token và bộ hồi quy bằng dữ liệu mẫu trước khi xuất bản.
- Chụp trước/sau ở 390px và 1440px; kiểm thêm 320/768/1024px.
- Kiểm chữ Việt thực tế bằng Chrome DevTools Protocol, không chỉ nhìn tên CSS.
- Kiểm axe và bàn phím; một lần axe đạt không thay thế kiểm khả năng tiếp cận thủ công đầy đủ.
- Không gửi đặt bàn hoặc voucher thử vào Firebase thật.
