# Tạo dấu tiếng Việt bằng VinaDấu

Chạy bộ tạo dấu thật của VinaDấu từ bản nguồn có sẵn của chủ dự án. Không sao chép mã hoặc thư viện dấu riêng của VinaDấu vào Promoter.

Yêu cầu: Node.js, bản nguồn VinaDấu đã cài dependencies, Python với FontTools và Brotli. Từ gốc Promoter:

```powershell
node tools/fonts/generate-vietnamese.mjs G:/OPENCODE/vietnamesefont G:/OPENCODE/blkmenu/assets/fonts/Brik-3XL-Oblique.ttf .qa/brik-vn.otf .qa/brik-vn-generation.json
python tools/fonts/package-woff2.py G:/OPENCODE/blkmenu/assets/fonts/Brik-3XL-Oblique.ttf .qa/brik-vn.otf public/fonts/BT-Brik-3XL-Oblique-VI.woff2 .qa/brik-vn-generation.json
```

Đổi hai đường dẫn đầu nếu VinaDấu và blkmenu nằm nơi khác. Bản dùng trong đợt này: VinaDấu `7f0a11fc950773d2e65af7bfef6fee51cf0ae6a2`. Font gốc khớp SHA-256 với tệp đang phục vụ trên blkmenu.

Script đầu gọi `analyzeFont`, `ensureLibraryMatch`, `processFont`, `buildExportFont` và `compileFont` của VinaDấu. Nó giữ ký tự đã có, chỉ sinh ký tự thiếu, kiểm đủ bảng Việt và chặn mất bảng layout. Script thứ hai đóng gói WOFF2, chỉnh giới hạn dọc để chứa cả dấu chồng và chấm dưới, giữ bản quyền và các thông số nhúng. Kết quả kiểm hình học trước bước mở rộng giới hạn dọc được lưu nguyên trạng, không xóa cảnh báo để tăng điểm.

VinaDấu không giữ hinting gốc khi xuất. Font nguồn không có `GPOS` hoặc `kern`; `GSUB`, outline và độ rộng ký tự gốc đã được đối chiếu độc lập và giữ nguyên. Tệp WOFF2 dùng cho tiêu đề lớn, không đổi font chữ thường.

Kiểm hiển thị trên máy chủ demo theo [hướng dẫn QA](../qa/README.md), rồi chạy:

```powershell
npm run test:typography --prefix tools/qa
```

Chữ phân rã Unicode được chuẩn hóa NFC trước khi đo và vẽ tiêu đề. Bộ kiểm dùng Chrome để xác nhận font thực tế của glyph, kiểm dấu chồng vừa dòng và chụp năm kích thước màn hình. Xem [bằng chứng](../../docs/audit-2026-11-11/vietnamese/README.md).
