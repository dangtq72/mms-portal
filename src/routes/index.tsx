import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  CheckCheck,
  Check,
  Bell,
  ChevronDown,
  Megaphone,
  Mail,
  MailOpen,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

type Tone = "info" | "warning" | "purple" | "danger" | "success" | "brand";

const toneMap: Record<Tone, { bar: string; text: string; bg: string }> = {
  info: { bar: "bg-[var(--color-info)]", text: "text-[var(--color-info)]", bg: "bg-[var(--color-info)]/10" },
  warning: { bar: "bg-[var(--color-warning)]", text: "text-[var(--color-warning)]", bg: "bg-[var(--color-warning)]/10" },
  purple: { bar: "bg-[var(--color-purple)]", text: "text-[var(--color-purple)] text-[#de3b3d]", bg: "bg-[var(--color-purple)]/10 bg-[#fbeaea]" },
  danger: { bar: "bg-[var(--color-danger)]", text: "text-[var(--color-danger)]", bg: "bg-[var(--color-danger)]/10" },
  success: { bar: "bg-[var(--color-success)]", text: "text-[var(--color-success)]", bg: "bg-[var(--color-success)]/10" },
  brand: { bar: "bg-[var(--color-brand)]", text: "text-[var(--color-brand)]", bg: "bg-[var(--color-brand)]/10" },
};

type StatKey = "due" | "soon" | "waiting" | "rejected" | "late" | "approved";

const stats: {
  key: StatKey;
  label: string;
  value: number;
  desc: string;
  tone: Tone;
}[] = [
  { key: "due", label: "ĐẾN HẠN", value: 4, desc: "Báo cáo, tin công bố cần nộp trong ngày hôm nay.", tone: "danger" },
  { key: "soon", label: "SẮP ĐẾN HẠN", value: 7, desc: "Sẽ đến hạn nộp trong 7 ngày tới.", tone: "warning" },
  { key: "waiting", label: "CHỜ VNX DUYỆT", value: 3, desc: "Đã gửi lên VNX, đang chờ phê duyệt.", tone: "info" },
  { key: "rejected", label: "BỊ TRẢ LẠI", value: 2, desc: "Bị VNX từ chối, cần đính chính lại.", tone: "purple" },
  { key: "late", label: "CHẬM NỘP", value: 1, desc: "Đã quá hạn nộp tính đến ngày hiện tại.", tone: "danger" },
  { key: "approved", label: "MỚI PHÊ DUYỆT", value: 5, desc: "Mới được VNX phê duyệt gần đây.", tone: "success" },
];

type DetailItem = {
  type: "Báo cáo" | "CBTT";
  title: string;
  sub: string;
  action: string;
};

const statDetails: Record<
  StatKey,
  { heading: string; desc: string; tone: Tone; items: DetailItem[] }
> = {
  due: {
    heading: "Đến hạn nộp hôm nay",
    desc: "Báo cáo & tin công bố cần nộp trong ngày hôm nay.",
    tone: "danger",
    items: [
      { type: "Báo cáo", title: "Báo cáo định kỳ Q1/2026", sub: "Loại: Báo cáo định kỳ", action: "Nộp báo cáo" },
      { type: "CBTT", title: "CBTT định kỳ - Báo cáo tài chính kiểm toán", sub: "Loại: CBTT định kỳ", action: "Gửi CBTT" },
      { type: "Báo cáo", title: "Báo cáo tỷ lệ an toàn tài chính tháng 04/2026", sub: "Loại: Báo cáo định kỳ", action: "Nộp báo cáo" },
      { type: "CBTT", title: "CBTT bất thường - Quyết định bổ nhiệm Tổng Giám đốc", sub: "Loại: CBTT bất thường", action: "Gửi CBTT" },
    ],
  },
  soon: {
    heading: "Sắp đến hạn nộp (7 ngày tới)",
    desc: "Báo cáo & tin công bố sẽ đến hạn trong 7 ngày tới.",
    tone: "warning",
    items: [
      { type: "Báo cáo", title: "Báo cáo tình hình quản trị 6 tháng đầu năm 2026", sub: "Hạn nộp: 18/05/2026", action: "Nộp báo cáo" },
      { type: "CBTT", title: "CBTT định kỳ - Báo cáo thường niên 2025", sub: "Hạn nộp: 19/05/2026", action: "Gửi CBTT" },
      { type: "Báo cáo", title: "Báo cáo giao dịch nội bộ tháng 04/2026", sub: "Hạn nộp: 20/05/2026", action: "Nộp báo cáo" },
      { type: "CBTT", title: "CBTT bất thường - Nghị quyết HĐQT số 12/2026", sub: "Hạn nộp: 20/05/2026", action: "Gửi CBTT" },
      { type: "Báo cáo", title: "Báo cáo tỷ lệ an toàn tài chính tháng 05/2026", sub: "Hạn nộp: 21/05/2026", action: "Nộp báo cáo" },
      { type: "CBTT", title: "CBTT định kỳ - Báo cáo tài chính Q1/2026", sub: "Hạn nộp: 22/05/2026", action: "Gửi CBTT" },
      { type: "Báo cáo", title: "Báo cáo tổng hợp giao dịch tháng 04/2026", sub: "Hạn nộp: 23/05/2026", action: "Nộp báo cáo" },
    ],
  },
  waiting: {
    heading: "Đang chờ VNX duyệt",
    desc: "Hồ sơ đã gửi lên VNX, đang chờ phê duyệt.",
    tone: "info",
    items: [
      { type: "CBTT", title: "CBTT bất thường - Thay đổi người đại diện pháp luật", sub: "Gửi: 11/05/2026 09:30", action: "Xem chi tiết" },
      { type: "Báo cáo", title: "Báo cáo định kỳ tháng 04/2026", sub: "Gửi: 10/05/2026 16:42", action: "Xem chi tiết" },
      { type: "CBTT", title: "CBTT định kỳ - Báo cáo quản trị Q1/2026", sub: "Gửi: 09/05/2026 11:05", action: "Xem chi tiết" },
    ],
  },
  rejected: {
    heading: "Bị VNX trả lại",
    desc: "Hồ sơ bị từ chối, cần đính chính và gửi lại.",
    tone: "purple",
    items: [
      { type: "CBTT", title: "CBTT bất thường - Thay đổi nhân sự HĐQT", sub: "Lý do: cần bổ sung nội dung mục 3", action: "Đính chính" },
      { type: "Báo cáo", title: "Báo cáo tỷ lệ an toàn tài chính tháng 03/2026", sub: "Lý do: sai số liệu phụ lục 02", action: "Đính chính" },
    ],
  },
  late: {
    heading: "Chậm nộp",
    desc: "Hồ sơ đã quá hạn nộp tính đến hôm nay.",
    tone: "danger",
    items: [
      { type: "Báo cáo", title: "Báo cáo định kỳ Q1/2026", sub: "Quá hạn 2 ngày", action: "Nộp báo cáo" },
    ],
  },
  approved: {
    heading: "Mới được VNX phê duyệt",
    desc: "Hồ sơ vừa được VNX phê duyệt gần đây.",
    tone: "success",
    items: [
      { type: "CBTT", title: "CBTT định kỳ - Báo cáo tài chính Q4/2025", sub: "Phê duyệt: 12/05/2026", action: "Xem" },
      { type: "Báo cáo", title: "Báo cáo giao dịch nội bộ tháng 03/2026", sub: "Phê duyệt: 11/05/2026", action: "Xem" },
      { type: "CBTT", title: "CBTT bất thường - Nghị quyết HĐQT số 09/2026", sub: "Phê duyệt: 10/05/2026", action: "Xem" },
      { type: "Báo cáo", title: "Báo cáo tình hình quản trị 2025", sub: "Phê duyệt: 08/05/2026", action: "Xem" },
      { type: "CBTT", title: "CBTT định kỳ - Báo cáo thường niên 2024", sub: "Phê duyệt: 06/05/2026", action: "Xem" },
    ],
  },
};

const urgent = [
  {
    title: "Báo Cáo Nộp VNX",
    sub: "Báo cáo định kỳ Q1/2026 đã quá hạn nộp 2 ngày.",
    badge: "Quá hạn",
    badgeTone: "danger" as Tone,
    action: "Nộp báo cáo",
  },
  {
    title: "CBTT bất thường - Thay đổi nhân sự HĐQT",
    sub: "VNX từ chối duyệt, cần đính chính lại nội dung mục 3.",
    badge: "Bị trả lại",
    badgeTone: "purple" as Tone,
    action: "Đính chính",
  },
  {
    title: "CBTT định kỳ - Báo cáo tài chính kiểm toán",
    sub: "Hạn nộp: 01/05/2026.",
    badge: "Quá hạn",
    badgeTone: "danger" as Tone,
    action: "Gửi CBTT",
  },
];

const notifications = [
  {
    title: "Thông báo về giá dịch vụ quản lý thành viên 2026",
    sub: "VNX • 12/05/2026 09:15",
    tag: "Giá dịch vụ",
    tone: "info" as Tone,
    body:
      "VNX thông báo biểu giá dịch vụ quản lý thành viên áp dụng từ năm 2026. Vui lòng tham khảo chi tiết tại phụ lục đính kèm trong mục Thông báo từ VNX.",
  },
  {
    title: "Cảnh báo vi phạm: chậm nộp tiền dịch vụ tháng 04/2026",
    sub: "VNX • 08/05/2026 14:02",
    tag: "Cảnh báo",
    tone: "danger" as Tone,
    body:
      "Thành viên chậm nộp tiền dịch vụ quản lý tháng 04/2026. Đề nghị hoàn tất nghĩa vụ thanh toán trước ngày 15/05/2026 để tránh bị áp dụng biện pháp xử lý theo quy chế.",
  },
  {
    title: "Nhắc nhở: hồ sơ đăng ký thành viên đến bước thẩm định",
    sub: "VNX • 05/05/2026 10:30",
    tag: "Quy trình",
    tone: "warning" as Tone,
    body:
      "Hồ sơ đăng ký thành viên đã chuyển sang bước thẩm định. Đề nghị bộ phận phụ trách phối hợp cung cấp tài liệu bổ sung khi VNX yêu cầu.",
  },
  {
    title: "Cảnh báo nộp CBTT chậm theo Thông tư 96",
    sub: "VNX • 02/05/2026 16:48",
    tag: "Cảnh báo",
    tone: "purple" as Tone,
    body:
      "Phát hiện báo cáo CBTT định kỳ nộp chậm so với thời hạn quy định tại Thông tư 96/2020/TT-BTC. Đề nghị rà soát và đính chính trong thời gian sớm nhất.",
  },
];

type Notification = (typeof notifications)[number];


const quickActions: { code: string; title: string; desc: string; tone: Tone }[] = [
  { code: "TT", title: "Thông tin thành viên", desc: "Xem hồ sơ và dữ liệu liên quan.", tone: "info" },
  { code: "HS", title: "Hồ sơ active", desc: "Mở nhanh hồ sơ đang hiệu lực.", tone: "success" },
  { code: "CB", title: "Công bố thông tin", desc: "Tạo mới, theo dõi và gửi duyệt CBTT.", tone: "warning" },
  { code: "LS", title: "Lịch sử xử lý", desc: "Tra cứu lịch sử hồ sơ và CBTT.", tone: "purple" },
];

function Dashboard() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeStat, setActiveStat] = useState<StatKey | null>(null);
  const visibleNotifications = notifications.filter((n) => !readIds.has(n.title));
  const markRead = (title: string) =>
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(title);
      return next;
    });
  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.title)));
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    );
  }, []);
  return (
    <AppShell activeKey="dashboard">

      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        {/* Member identity strip */}
        <section className="relative overflow-hidden rounded-xl border border-border bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="absolute inset-y-3 left-0 w-1 rounded-r-md bg-[var(--color-brand)]" />
          <div className="flex flex-wrap items-center gap-3 pl-3">
            <h2 className="font-semibold text-lg">VND: Công ty chứng khoán VNDirect</h2>
            <span className="rounded-full bg-[var(--color-success)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-success)]">
              Đang hoạt động
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 pl-3">
            <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
              Loại thành viên: <span className="font-medium text-foreground">THÀNH VIÊN GIAO DỊCH</span>
            </span>
          </div>
        </section>

        {/* Stat cards */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {stats.map((s) => {
            const t = toneMap[s.tone];
            const isActive = activeStat === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveStat((prev) => (prev === s.key ? null : s.key))}
                aria-expanded={isActive}
                aria-controls={`stat-detail-${s.key}`}
                aria-describedby={`stat-hint-${s.key}`}
                className="group relative cursor-pointer rounded-xl border border-border bg-[var(--color-surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-y-3 left-0 w-1 rounded-r-md ${t.bar} overflow-hidden`} />
                <ChevronDown
                  aria-hidden="true"
                  className={`absolute right-3 top-3 h-4 w-4 text-muted-foreground transition-transform duration-300 ease-out ${
                    isActive ? "rotate-180 text-[var(--color-brand)]" : "rotate-0"
                  }`}
                />
                <p className={`pl-2 pr-5 font-semibold uppercase tracking-wider text-sm ${t.text}`}>
                  {s.label}
                </p>
                <p className="pl-2 text-3xl font-bold leading-tight">{s.value}</p>
                <p className="mt-1 pl-2 text-xs leading-snug text-muted-foreground">{s.desc}</p>
                {isActive && (
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-[20px] left-6 z-10 h-0 w-0 border-l-[10px] border-r-[14px] border-t-[20px] border-l-transparent border-r-transparent border-t-border"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-[19px] left-[25px] z-20 h-0 w-0 border-l-[9px] border-r-[13px] border-t-[19px] border-l-transparent border-r-transparent border-t-[var(--color-surface)]"
                    />
                  </>
                )}
                <span
                  id={`stat-hint-${s.key}`}
                  role="tooltip"
                  className="pointer-events-none absolute inset-x-0 -bottom-7 mx-auto w-fit rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {isActive ? "Bấm để đóng" : "Bấm để xem chi tiết"}
                </span>
              </button>
            );
          })}
        </section>

        {(Object.keys(statDetails) as StatKey[]).map((key) => {
          const detail = statDetails[key];
          const t = toneMap[detail.tone];
          const isOpen = activeStat === key;
          const heading = key === "due" && today ? `${detail.heading} (${today})` : detail.heading;
          return (
            <div
              key={key}
              className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "-mt-5 grid-rows-[0fr] opacity-0"
              }`}
            >
              <div
                id={`stat-detail-${key}`}
                role="region"
                aria-label={detail.heading}
                aria-hidden={!isOpen}
                className="overflow-hidden"
              >
                <section className="rounded-xl border border-border bg-[var(--color-surface)] p-5 shadow-sm">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`h-5 w-5 ${t.text}`} aria-hidden="true" />
                      <h3 className="font-semibold text-xl">{heading}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStat(null)}
                      aria-label={`Đóng khối chi tiết ${detail.heading}`}
                      className="rounded-md border border-border p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">{detail.desc}</p>
                  {detail.items.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Không có dữ liệu.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {detail.items.map((it) => {
                        const Icon = it.type === "Báo cáo" ? FileText : Megaphone;
                        return (
                          <li key={it.title} className="flex items-start justify-between gap-3 py-3">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${t.bg} ${t.text}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{it.title}</p>
                                <p className="text-xs text-muted-foreground">{it.sub}</p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {it.action === "Nộp báo cáo" || it.action === "Gửi CBTT" ? (
                                <Link
                                  to="/cbtt/dinh-ky/moi"
                                  aria-label={`${it.action} cho ${it.title}`}
                                  className="min-w-24 rounded-md bg-[var(--color-brand)] px-3 py-1 text-[12px] font-medium text-white shadow-sm transition hover:opacity-90 inline-flex items-center justify-center"
                                >
                                  {it.action}
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  aria-label={`${it.action} cho ${it.title}`}
                                  className="min-w-24 rounded-md bg-[var(--color-brand)] px-3 py-1 text-[12px] font-medium text-white shadow-sm transition hover:opacity-90"
                                >
                                  {it.action}
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          );
        })}

        <div className="grid gap-5 lg:grid-cols-2">
        {/* Urgent tasks */}
        <section className="rounded-xl border border-border bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <AlertTriangle className="h-[20px] w-[20px] text-[var(--color-danger)]" />
            <h3 className="font-semibold text-xl">Việc cần xử lý gấp</h3>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Tin công bố / báo cáo đã quá hạn hoặc cần đính chính lại do VNX từ chối.
          </p>
          <ul className="space-y-2">
            {[...urgent].sort((a, b) => (a.badge === "Quá hạn" ? -1 : 0) - (b.badge === "Quá hạn" ? -1 : 0)).map((u) => {
              const t = toneMap[u.badgeTone];
              return (
                <li
                  key={u.title}
                  className="relative flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition hover:bg-accent"
                >
                  <span className={`absolute inset-y-2 left-0 w-1 rounded-r-md ${t.bar}`} />
                  <div className="min-w-0 flex-1 pl-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{u.title}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.bg} ${t.text}`}>
                        {u.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.sub}</p>
                  </div>
                  {u.action === "Nộp báo cáo" || u.action === "Gửi CBTT" ? (
                    <Link
                      to="/cbtt/dinh-ky/moi"
                      aria-label={`${u.action}: ${u.title}`}
                      className="w-20 shrink-0 rounded-md bg-[var(--color-brand)] py-1 text-[12px] font-medium text-white shadow-sm transition hover:opacity-90 inline-flex items-center justify-center"
                    >
                      {u.action}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      aria-label={`${u.action}: ${u.title}`}
                      className="w-20 shrink-0 rounded-md bg-[var(--color-brand)] py-1 text-[12px] font-medium text-white shadow-sm transition hover:opacity-90"
                    >
                      {u.action}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>


        {/* Notifications from VNX */}
        <section className="rounded-xl border border-border bg-[var(--color-surface)] p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bell className="h-[20px] w-[20px] text-[var(--color-brand)]" />
              <h3 className="font-semibold text-xl">Thông báo từ VNX</h3>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={visibleNotifications.length === 0}
              aria-label="Đánh dấu tất cả thông báo từ VNX là đã đọc"
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> Đánh dấu tất cả đã đọc
            </button>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Giá dịch vụ, cảnh báo vi phạm, nhắc nhở quy trình hồ sơ thành viên.
          </p>
          {visibleNotifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Không có thông báo chưa đọc.</p>
          ) : (
            <ul className="divide-y divide-border">
              {visibleNotifications.map((n) => {
                const t = toneMap[n.tone];
                return (
                  <li key={n.title} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.sub}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.bg} ${t.text}`}
                        style={n.tag === "Cảnh báo" ? { color: "#de3b3d", backgroundColor: "#fbeaea" } : undefined}
                      >
                        {n.tag}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              aria-label="Xem tất cả thông báo từ VNX"
              className="text-xs font-medium text-[var(--color-brand)] hover:underline"
            >
              Tất cả thông báo
            </button>
          </div>
        </section>
        </div>

      </main>
    </AppShell>
  );
}
