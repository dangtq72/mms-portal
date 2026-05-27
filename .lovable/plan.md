## Mục tiêu

Tạo module "CBTT định kỳ" với 4 chức năng: danh sách, thêm mới, sửa, xóa, xem chi tiết — truy cập từ submenu "Công bố thông tin > CBTT định kỳ".

## Cấu trúc route (TanStack Start, file-based routing)

```
src/routes/
  cbtt.dinh-ky.tsx           -> /cbtt/dinh-ky          (danh sách)
  cbtt.dinh-ky.moi.tsx       -> /cbtt/dinh-ky/moi      (thêm mới)
  cbtt.dinh-ky.$id.tsx       -> /cbtt/dinh-ky/:id      (xem chi tiết)
  cbtt.dinh-ky.$id.sua.tsx   -> /cbtt/dinh-ky/:id/sua  (sửa)
```

Submenu "CBTT định kỳ" trong header (`src/routes/index.tsx`) sẽ trỏ tới `/cbtt/dinh-ky`.

## Lưu trữ dữ liệu

Dùng `localStorage` với key `cbtt-dinh-ky` (mock, không cần backend ở giai đoạn này). Tạo helper `src/lib/cbtt-store.ts` với các hàm: `listReports()`, `getReport(id)`, `createReport(data)`, `updateReport(id, data)`, `deleteReport(id)`. Nếu sau này muốn lưu thực, sẽ chuyển sang Lovable Cloud.

## Màn hình danh sách (`/cbtt/dinh-ky`)

- Tiêu đề trang + nút "+ Thêm mới" (link sang `/cbtt/dinh-ky/moi`)
- Bảng (shadcn Table) với cột:
  - STT, Tiêu đề, Trạng thái (badge: Nháp / Chờ duyệt / Đã duyệt), Ngày tạo, Người tạo, Ghi chú, Hành động (Xem / Sửa / Xóa)
- Thanh lọc đơn giản: tìm theo tiêu đề, lọc theo trạng thái
- Xóa: dùng `AlertDialog` xác nhận
- Nếu chưa có dữ liệu: empty state

## Màn hình thêm mới / sửa (`/cbtt/dinh-ky/moi`, `/cbtt/dinh-ky/:id/sua`)

Form (react-hook-form + zod, shadcn Form) gồm các trường:

| Trường | Kiểu | Ghi chú |
|---|---|---|
| Kỳ CBTT | Select | `Theo quý`, `6 tháng đầu năm`, `Theo năm` |
| Loại tin | Select | Phụ thuộc Kỳ CBTT (xem bảng dưới) |
| Tiêu đề | Input text | bắt buộc |
| Năm tài chính | Select số (vd 2020–2026) | bắt buộc |
| Quý | Select (Q1–Q4) | chỉ enable khi Kỳ = Theo quý |
| Ngày ban hành | DatePicker (shadcn Calendar + Popover) | bắt buộc |
| Toàn văn báo cáo tài chính | Nhóm 4 nút mở dialog | xem dưới |

Mapping Kỳ CBTT → Loại tin:
- **Theo quý**: Báo cáo tài chính quý
- **6 tháng đầu năm**: Báo cáo tài chính bán niên / Báo cáo tỷ lệ an toàn tài chính tại ngày 30/6 / Báo cáo tình hình quản trị công ty bán niên
- **Theo năm**: Báo cáo tài chính năm / Báo cáo tỷ lệ an toàn tài chính tại ngày 31/12 / Báo cáo tình hình quản trị công ty năm / Báo cáo thường niên

Khi đổi Kỳ CBTT → reset Loại tin và Quý.

### Khu vực "Toàn văn báo cáo tài chính"

Card chứa 4 nút, mỗi nút mở một Dialog với form nhập liệu (Textarea + một vài trường số cơ bản, lưu cùng record):
1. Nhập bảng cân đối kế toán
2. Nhập báo cáo kết quả hoạt động kinh doanh
3. Nhập báo cáo lưu chuyển tiền tệ
4. Giải trình lợi nhuận sau thuế

Mỗi mục sau khi nhập sẽ hiện badge "Đã nhập".

### Nút hành động cuối form
- **Hủy**: quay lại `/cbtt/dinh-ky` (nếu form dirty → confirm)
- **Lưu nháp**: lưu với `status = "Nháp"`, toast thành công, về danh sách
- **Gửi duyệt**: validate đầy đủ, lưu với `status = "Chờ duyệt"`, toast, về danh sách

## Màn hình xem chi tiết (`/cbtt/dinh-ky/:id`)

- Hiển thị read-only toàn bộ trường + 4 mục báo cáo tài chính (nếu đã nhập, hiện nội dung)
- Nút: Quay lại, Sửa (nếu trạng thái = Nháp)

## Files mới/sửa

- **Mới**: 4 route files, `src/lib/cbtt-store.ts`, `src/components/cbtt/ReportFormDialog.tsx` (dùng chung cho 4 dialog báo cáo)
- **Sửa**: `src/routes/index.tsx` — submenu "CBTT định kỳ" dùng `<Link to="/cbtt/dinh-ky">`

## Thiết kế

Tận dụng design tokens hiện có (`var(--color-brand)`, shadow đã định nghĩa). Form chia 2 cột trên desktop, 1 cột mobile. Dùng shadcn: Form, Input, Select, Textarea, Calendar, Popover, Dialog, AlertDialog, Table, Badge, Button, Card, Toast (sonner).
