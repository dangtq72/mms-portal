import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Paperclip, Eye, Mail, MailOpen, Filter } from "lucide-react";
import { format } from "date-fns";

import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/thong-bao")({
  head: () => ({
    meta: [
      { title: "Thông báo từ VNX — Cổng thành viên" },
      { name: "description", content: "Danh sách thông báo chính thức từ Sở Giao dịch Chứng khoán Việt Nam (VNX)." },
    ],
  }),
  component: ThongBaoPage,
});

type Priority = "Cao" | "Trung bình" | "Thấp";
type Category =
  | "Quy chế"
  | "Nghiệp vụ"
  | "Thành viên"
  | "Hệ thống"
  | "Sự kiện";

type Notice = {
  id: string;
  code: string;
  title: string;
  category: Category;
  priority: Priority;
  sentAt: string; // ISO
  sender: string;
  read: boolean;
  attachments: number;
  summary: string;
  body: string;
};

const NOTICES: Notice[] = [
  {
    id: "n1",
    code: "VNX-2026/0512",
    title: "Thông báo lịch nghỉ giao dịch dịp Quốc khánh 02/09/2026",
    category: "Sự kiện",
    priority: "Cao",
    sentAt: "2026-05-24T08:30:00",
    sender: "Ban Điều hành VNX",
    read: false,
    attachments: 2,
    summary:
      "VNX thông báo lịch nghỉ giao dịch và lịch thanh toán bù trừ trong dịp lễ Quốc khánh năm 2026.",
    body:
      "Kính gửi Quý thành viên,\n\nSở Giao dịch Chứng khoán Việt Nam (VNX) trân trọng thông báo lịch nghỉ giao dịch dịp Quốc khánh 02/09/2026 như sau:\n- Ngày nghỉ: 01/09 - 02/09/2026.\n- Giao dịch trở lại bình thường từ ngày 03/09/2026.\n\nĐề nghị Quý thành viên chủ động sắp xếp công việc, thông báo tới khách hàng và đảm bảo vận hành hệ thống.",
  },
  {
    id: "n2",
    code: "VNX-2026/0498",
    title: "Cập nhật quy chế công bố thông tin định kỳ áp dụng từ Quý III/2026",
    category: "Quy chế",
    priority: "Cao",
    sentAt: "2026-05-22T14:05:00",
    sender: "Phòng Giám sát Công bố Thông tin",
    read: false,
    attachments: 3,
    summary:
      "Ban hành phiên bản mới quy chế công bố thông tin định kỳ với một số điều chỉnh về biểu mẫu và thời hạn nộp.",
    body:
      "Sở Giao dịch Chứng khoán Việt Nam ban hành Quy chế công bố thông tin định kỳ phiên bản 3.0 áp dụng từ 01/07/2026. Quý thành viên vui lòng tải tài liệu đính kèm và triển khai theo hướng dẫn.",
  },
  {
    id: "n3",
    code: "VNX-2026/0487",
    title: "Bảo trì hệ thống tiếp nhận CBTT vào tối 28/05/2026",
    category: "Hệ thống",
    priority: "Trung bình",
    sentAt: "2026-05-20T17:45:00",
    sender: "Trung tâm CNTT",
    read: true,
    attachments: 0,
    summary:
      "Hệ thống sẽ tạm dừng phục vụ từ 22:00 ngày 28/05 đến 02:00 ngày 29/05/2026 để nâng cấp.",
    body:
      "Trong thời gian bảo trì, Quý thành viên không thể truy cập Cổng thành viên và hệ thống tiếp nhận CBTT. Đề nghị Quý thành viên hoàn tất các tác vụ trước 21:30 ngày 28/05/2026.",
  },
  {
    id: "n4",
    code: "VNX-2026/0476",
    title: "Hướng dẫn nộp Báo cáo tài chính bán niên 2026",
    category: "Nghiệp vụ",
    priority: "Trung bình",
    sentAt: "2026-05-18T09:15:00",
    sender: "Phòng Quản lý Thành viên",
    read: true,
    attachments: 1,
    summary:
      "Quy trình, biểu mẫu và thời hạn nộp Báo cáo tài chính bán niên 2026 dành cho thành viên giao dịch.",
    body:
      "Quý thành viên thực hiện nộp Báo cáo tài chính bán niên 2026 chậm nhất ngày 30/08/2026 qua chức năng CBTT định kỳ trên Cổng thành viên.",
  },
  {
    id: "n5",
    code: "VNX-2026/0462",
    title: "Mời tham dự Hội nghị thành viên thường niên 2026",
    category: "Thành viên",
    priority: "Thấp",
    sentAt: "2026-05-15T10:00:00",
    sender: "Ban Tổ chức",
    read: true,
    attachments: 2,
    summary:
      "Hội nghị thành viên thường niên 2026 dự kiến tổ chức ngày 18/06/2026 tại Hà Nội.",
    body:
      "Trân trọng kính mời Quý thành viên cử đại diện tham dự Hội nghị thành viên thường niên 2026. Vui lòng xác nhận trước ngày 05/06/2026.",
  },
  {
    id: "n6",
    code: "VNX-2026/0451",
    title: "Thông báo kết quả giám sát giao dịch tuần 19/2026",
    category: "Nghiệp vụ",
    priority: "Thấp",
    sentAt: "2026-05-12T16:20:00",
    sender: "Phòng Giám sát Giao dịch",
    read: true,
    attachments: 1,
    summary:
      "Kết quả giám sát giao dịch và một số lưu ý nghiệp vụ trong tuần 19/2026.",
    body:
      "Phòng Giám sát Giao dịch gửi tới Quý thành viên báo cáo kết quả giám sát giao dịch tuần 19/2026 kèm các khuyến nghị tuân thủ.",
  },
];

const PRIORITY_TONE: Record<Priority, string> = {
  "Cao": "bg-[#fbeaea] text-[#de3b3d]",
  "Trung bình": "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  "Thấp": "bg-muted text-foreground",
};

const CATEGORY_TONE: Record<Category, string> = {
  "Quy chế": "bg-[var(--color-brand)]/10 text-[var(--color-brand)]",
  "Nghiệp vụ": "bg-[var(--color-purple)]/10 text-[var(--color-purple)]",
  "Thành viên": "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  "Hệ thống": "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  "Sự kiện": "bg-[#fbeaea] text-[#de3b3d]",
};

function ThongBaoPage() {
  const [items, setItems] = useState<Notice[]>(NOTICES);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [readState, setReadState] = useState<"ALL" | "READ" | "UNREAD">("ALL");
  const [open, setOpen] = useState<Notice | null>(null);

  // Snapshot id phù hợp với bộ lọc Đã đọc / Chưa đọc tại thời điểm chọn.
  // Item vừa đọc trong phiên xem vẫn nằm lại danh sách (đổi style), chỉ bị
  // lọc khỏi danh sách khi người dùng đổi bộ lọc hoặc reload trang.
  const [stickyIds, setStickyIds] = useState<Set<string> | null>(null);

  const changeReadState = (v: "ALL" | "READ" | "UNREAD") => {
    setReadState(v);
    if (v === "ALL") {
      setStickyIds(null);
    } else if (v === "UNREAD") {
      setStickyIds(new Set(items.filter((n) => !n.read).map((n) => n.id)));
    } else {
      setStickyIds(new Set(items.filter((n) => n.read).map((n) => n.id)));
    }
  };

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (category !== "ALL" && n.category !== category) return false;
      if (priority !== "ALL" && n.priority !== priority) return false;
      if (readState !== "ALL" && stickyIds && !stickyIds.has(n.id)) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !n.title.toLowerCase().includes(s) &&
          !n.code.toLowerCase().includes(s) &&
          !n.summary.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [items, q, category, priority, readState, stickyIds]);

  const unreadCount = items.filter((n) => !n.read).length;

  const openNotice = (n: Notice) => {
    setOpen(n);
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
  };

  const markAllRead = () =>
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));

  return (
    <AppShell activeKey="thong-bao">
      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Thông tin chính thức
            </p>
            <h1 className="text-xl font-semibold">
              Thông báo từ VNX
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-[#fbeaea] px-2 py-0.5 text-xs font-medium text-[#de3b3d]">
                  {unreadCount} chưa đọc
                </span>
              )}
            </h1>
          </div>
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <MailOpen className="mr-1 h-4 w-4" /> Đánh dấu đã đọc tất cả
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tiêu đề, mã hoặc tóm tắt..."
                className="h-9 w-[300px] pl-8"
              />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v as Category | "ALL")}>
              <SelectTrigger className="h-9 w-[170px]">
                <Filter className="mr-1 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                <SelectItem value="Quy chế">Quy chế</SelectItem>
                <SelectItem value="Nghiệp vụ">Nghiệp vụ</SelectItem>
                <SelectItem value="Thành viên">Thành viên</SelectItem>
                <SelectItem value="Hệ thống">Hệ thống</SelectItem>
                <SelectItem value="Sự kiện">Sự kiện</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority | "ALL")}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả mức độ</SelectItem>
                <SelectItem value="Cao">Cao</SelectItem>
                <SelectItem value="Trung bình">Trung bình</SelectItem>
                <SelectItem value="Thấp">Thấp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={readState} onValueChange={(v) => changeReadState(v as typeof readState)}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="UNREAD">Chưa đọc</SelectItem>
                <SelectItem value="READ">Đã đọc</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto text-xs text-muted-foreground">
              {filtered.length} thông báo
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-[140px]">Mã thông báo</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="w-[130px]">Danh mục</TableHead>
                  <TableHead className="w-[120px]">Mức độ</TableHead>
                  <TableHead className="w-[160px]">Ngày gửi</TableHead>
                  <TableHead className="w-[80px] text-center">Tệp</TableHead>
                  <TableHead className="w-[80px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      Không có thông báo phù hợp với bộ lọc.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((n) => (
                  <TableRow
                    key={n.id}
                    className={!n.read ? "bg-[var(--color-brand)]/5" : undefined}
                  >
                    <TableCell>
                      {n.read ? (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Mail className="h-4 w-4 text-[var(--color-brand)]" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {n.code}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => openNotice(n)}
                        className={`text-left hover:text-[var(--color-brand)] ${
                          !n.read ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {n.title}
                      </button>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {n.summary}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={CATEGORY_TONE[n.category]} variant="secondary">
                        {n.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={PRIORITY_TONE[n.priority]} variant="secondary">
                        {n.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(n.sentAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {n.attachments > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5" />
                          {n.attachments}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Xem chi tiết"
                        onClick={() => openNotice(n)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge className={CATEGORY_TONE[open.category]} variant="secondary">
                    {open.category}
                  </Badge>
                  <Badge className={PRIORITY_TONE[open.priority]} variant="secondary">
                    Mức độ: {open.priority}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">{open.code}</span>
                </div>
                <DialogTitle className="text-lg leading-snug">{open.title}</DialogTitle>
                <DialogDescription>
                  {open.sender} • {format(new Date(open.sentAt), "dd/MM/yyyy HH:mm")}
                </DialogDescription>
              </DialogHeader>
              <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {open.body}
              </div>
              {open.attachments > 0 && (
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tệp đính kèm ({open.attachments})
                  </p>
                  <ul className="space-y-1.5">
                    {Array.from({ length: open.attachments }).map((_, i) => (
                      <li key={i}>
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="inline-flex items-center gap-2 text-sm text-[var(--color-brand)] hover:underline"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          {open.code}-tep-{i + 1}.pdf
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(null)}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
