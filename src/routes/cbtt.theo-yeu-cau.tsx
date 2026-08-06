import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Search } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cbtt/theo-yeu-cau")({
  head: () => ({
    meta: [
      { title: "Tin công bố của thành viên — MMS" },
      {
        name: "description",
        content:
          "Quản lý tin công bố song ngữ của thành viên: theo dõi trạng thái dịch, duyệt và công bố.",
      },
    ],
  }),
  component: TheoYeuCauPage,
});

type Lang = "VI" | "EN";
type Status = "Đã công bố" | "Chờ dịch" | "Chờ duyệt" | "Từ chối duyệt";

type LangRow = {
  lang: Lang;
  title: string;
  date: string | null;
  status: Status;
  translated?: boolean;
};

type DocGroup = {
  id: string;
  title: string;
  memberCode: string;
  langs: LangRow[];
};

const GROUPS: DocGroup[] = [
  {
    id: "g1",
    title: "Báo cáo tài chính 2026",
    memberCode: "VNM",
    langs: [
      { lang: "VI", title: "Báo cáo tài chính 2026", date: "26/07/2026", status: "Đã công bố" },
      { lang: "EN", title: "(Chưa dịch)", date: "26/07/2026", status: "Chờ dịch" },
    ],
  },
  {
    id: "g2",
    title: "Tình hình hoạt động 2025",
    memberCode: "HPG",
    langs: [
      { lang: "VI", title: "Tình hình hoạt động 2025", date: "26/07/2026", status: "Đã công bố" },
      { lang: "EN", title: "Business Operation Status 2025", date: "29/07/2026", status: "Chờ duyệt", translated: true },
    ],
  },
  {
    id: "g3",
    title: "Nghị quyết ĐHĐCĐ thường niên",
    memberCode: "FPT",
    langs: [
      { lang: "VI", title: "Nghị quyết ĐHĐCĐ thường niên", date: "18/07/2026", status: "Đã công bố" },
      { lang: "EN", title: "Annual GMS Resolution", date: "20/07/2026", status: "Từ chối duyệt", translated: true },
    ],
  },
  {
    id: "g4",
    title: "Thông báo chi trả cổ tức đợt 2",
    memberCode: "MWG",
    langs: [
      { lang: "VI", title: "Thông báo chi trả cổ tức đợt 2", date: "15/07/2026", status: "Đã công bố" },
      { lang: "EN", title: "(Chưa dịch)", date: null, status: "Chờ dịch" },
    ],
  },
  {
    id: "g5",
    title: "Báo cáo thường niên 2025",
    memberCode: "VCB",
    langs: [
      { lang: "VI", title: "Báo cáo thường niên 2025", date: "02/07/2026", status: "Đã công bố" },
      { lang: "EN", title: "Annual Report 2025", date: "10/07/2026", status: "Đã công bố", translated: true },
    ],
  },
];

const STATUS_STYLES: Record<Status, string> = {
  "Đã công bố":
    "bg-[oklch(0.95_0.05_150)] text-[oklch(0.42_0.13_150)]",
  "Chờ dịch":
    "bg-[oklch(0.96_0.06_75)] text-[oklch(0.48_0.14_60)]",
  "Chờ duyệt":
    "bg-[oklch(0.95_0.05_250)] text-[oklch(0.44_0.15_255)]",
  "Từ chối duyệt":
    "bg-[oklch(0.96_0.04_25)] text-[oklch(0.48_0.18_28)]",
};

const STATUS_DOT: Record<Status, string> = {
  "Đã công bố": "bg-[oklch(0.55_0.16_150)]",
  "Chờ dịch": "bg-[oklch(0.65_0.17_65)]",
  "Chờ duyệt": "bg-[oklch(0.55_0.18_255)]",
  "Từ chối duyệt": "bg-[oklch(0.58_0.22_28)]",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium w-[110px] whitespace-nowrap",
        STATUS_STYLES[status],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {status}
    </span>
  );
}

function LangPill({ lang }: { lang: Lang }) {
  const isVi = lang === "VI";
  return (
    <span
      className="inline-flex h-6 w-9 items-center justify-center rounded-md text-[11px] font-semibold tracking-wide"
      style={{
        backgroundColor: isVi ? "#e9eefb" : "#f3f0ea",
        color: isVi ? "#1e40af" : "#7a6a48",
      }}
    >
      {lang}
    </span>
  );
}

function actionsFor(row: LangRow): { label: string; tone?: "danger" | "primary" }[] {
  const acts: { label: string; tone?: "danger" | "primary" }[] = [];
  if (row.status === "Chờ dịch") acts.push({ label: "Dịch", tone: "primary" });
  if (row.status === "Chờ duyệt") acts.push({ label: "Sửa" });
  if (row.status === "Từ chối duyệt") {
    acts.push({ label: "Xóa", tone: "danger" });
    acts.push({ label: "Sửa" });
  }
  acts.push({ label: "Xem" });
  return acts;
}

function DocGroupCard({
  group,
  onRequestDelete,
}: {
  group: DocGroup;
  onRequestDelete: (groupId: string, lang: Lang) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[var(--color-surface)] shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/40"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-semibold text-foreground">{group.title}</span>
        <Badge
          variant="secondary"
          className="ml-1 rounded-md bg-[oklch(0.95_0.03_255)] px-1.5 py-0 text-[10px] font-semibold tracking-wide text-[oklch(0.42_0.16_255)]"
        >
          {group.memberCode}
        </Badge>
      </button>
      {open && (
        <div className="divide-y divide-border border-t border-border">
          {group.langs.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[40px_1fr_100px_150px_140px] items-center gap-4 px-4 py-3 text-sm"
            >
              <div className="flex justify-center">
                <LangPill lang={row.lang} />
              </div>
              <span
                className={cn(
                  "truncate",
                  row.status === "Chờ dịch"
                    ? "italic text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {row.title}
              </span>
              <span className="text-right text-xs text-muted-foreground">
                {row.date ?? "—"}
              </span>
              <div className="flex items-center justify-start">
                <StatusBadge status={row.status} />
              </div>
              <div className="flex items-center justify-end gap-3">
                {actionsFor(row).map((a) => (
                  <button
                    key={a.label}
                    onClick={() => {
                      if (a.label === "Xóa") {
                        onRequestDelete(group.id, row.lang);
                      }
                    }}
                    className={cn(
                      "text-xs font-bold hover:underline",
                      a.tone === "danger"
                        ? "text-destructive"
                        : a.tone === "primary"
                        ? "text-[var(--color-brand)]"
                        : "text-foreground/80 hover:text-foreground",
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TheoYeuCauPage() {
  const [q, setQ] = useState("");
  const [memberCode, setMemberCode] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [lang, setLang] = useState<string>("ALL");
  const [groups, setGroups] = useState<DocGroup[]>(GROUPS);
  const [pendingDelete, setPendingDelete] = useState<{ groupId: string; lang: Lang } | null>(null);

  const memberCodes = useMemo(
    () => Array.from(new Set(groups.map((g) => g.memberCode))),
    [groups],
  );

  const filtered = useMemo(() => {
    return groups.map((g) => {
      const langs = g.langs.filter((row) => {
        if (status !== "ALL" && row.status !== status) return false;
        if (lang !== "ALL" && row.lang !== lang) return false;
        return true;
      });
      return { ...g, langs };
    }).filter((g) => {
      if (memberCode !== "ALL" && g.memberCode !== memberCode) return false;
      if (q && !g.title.toLowerCase().includes(q.toLowerCase())) return false;
      return g.langs.length > 0;
    });
  }, [q, memberCode, status, lang, groups]);

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    const { groupId, lang } = pendingDelete;
    setGroups((prev) =>
      prev
        .map((g) =>
          g.id === groupId ? { ...g, langs: g.langs.filter((row) => row.lang !== lang) } : g,
        )
        .filter((g) => g.langs.length > 0),
    );
    setPendingDelete(null);
  };

  return (
    <AppShell activeKey="cbtt">
      <main className="mx-auto max-w-[1200px] px-6 py-5">
        <Tabs defaultValue="manage" className="space-y-4">
          <TabsList className="bg-transparent p-0 border-b border-border rounded-none h-auto w-full justify-start gap-6">
            <TabsTrigger
              value="manage"
              className="rounded-none border-b-2 border-transparent px-0 pb-2 text-sm data-[state=active]:border-[var(--color-brand)] data-[state=active]:text-[var(--color-brand)] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Quản lý tin
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-none border-b-2 border-transparent px-0 pb-2 text-sm data-[state=active]:border-[var(--color-brand)] data-[state=active]:text-[var(--color-brand)] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Tin chờ duyệt
              <Badge className="ml-2 h-5 min-w-5 rounded-full bg-[oklch(0.58_0.22_28)] px-1.5 text-[10px] text-white">
                1
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tiêu đề tin..."
                  className="h-9 w-[260px] pl-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Mã TV</span>
                <Select value={memberCode} onValueChange={setMemberCode}>
                  <SelectTrigger className="h-9 w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả</SelectItem>
                    {memberCodes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Trạng thái</span>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả</SelectItem>
                    <SelectItem value="Đã công bố">Đã công bố</SelectItem>
                    <SelectItem value="Chờ dịch">Chờ dịch</SelectItem>
                    <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
                    <SelectItem value="Từ chối duyệt">Từ chối duyệt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Ngôn ngữ</span>
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger className="h-9 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả</SelectItem>
                    <SelectItem value="VI">VI</SelectItem>
                    <SelectItem value="EN">EN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Groups */}
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center text-sm text-muted-foreground">
                  Không có tin nào khớp bộ lọc.
                </div>
              )}
              {filtered.map((g) => (
                <DocGroupCard
                  key={g.id}
                  group={g}
                  onRequestDelete={(groupId, lang) => setPendingDelete({ groupId, lang })}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
              <span>1–{filtered.length} trên {groups.length} tin</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 px-3">
                  Trước
                </Button>
                <Button
                  size="sm"
                  className="h-8 w-8 p-0 text-white"
                  style={{ background: "var(--color-cta-gradient)" }}
                >
                  1
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  2
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  Sau
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center text-sm text-muted-foreground">
              Danh sách tin đang chờ duyệt sẽ hiển thị tại đây.
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete confirmation */}
        <AlertDialog
          open={!!pendingDelete}
          onOpenChange={(open) => !open && setPendingDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <AlertDialogTitle className="mt-0">Xác nhận xóa</AlertDialogTitle>
              </div>
              <AlertDialogDescription>

                Bạn có chắc chắn muốn xóa bản ghi này? Thao tác xóa không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingDelete(null)}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="text-white"
                style={{ background: "var(--color-cta-gradient)" }}
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </AppShell>
  );
}
