import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, History, Plus, RefreshCw, Search, CheckCircle2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ALL_STATUSES,
  MEMBER_TYPE_LABEL,
  MemberProfile,
  MemberType,
  ProfileStatus,
  listProfiles,
  setStatus,
} from "@/lib/member-store";

export const Route = createFileRoute("/ho-so/thanh-vien")({
  head: () => ({
    meta: [
      { title: "Quản lý hồ sơ thành viên — Cổng VNX" },
      {
        name: "description",
        content: "Khởi tạo và phê duyệt hồ sơ thành viên cho HSX/HNX và các thành viên giao dịch, lưu ký.",
      },
    ],
  }),
  component: MemberListPage,
});

const STATUS_TONE: Record<ProfileStatus, string> = {
  "Nháp": "bg-muted text-foreground",
  "Chờ HSX/HNX cập nhật": "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  "Chờ Thành viên cập nhật": "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  "Chờ VNX phê duyệt": "bg-[var(--color-brand)]/15 text-[var(--color-brand)]",
  "Đã phê duyệt": "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  "Trả bổ sung": "bg-destructive/15 text-destructive",
};

const PAGE_SIZE = 10;

type ActionKind = "approve" | "return" | null;

function MemberListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MemberProfile[]>([]);
  const [page, setPage] = useState(1);

  // Filter form state (only applied on "Tìm kiếm")
  const [fCode, setFCode] = useState("");
  const [fName, setFName] = useState("");
  const [fType, setFType] = useState<MemberType | "ALL">("ALL");
  const [fStatus, setFStatus] = useState<ProfileStatus | "ALL">("ALL");
  const [fHandler, setFHandler] = useState("");
  const [applied, setApplied] = useState({
    code: "",
    name: "",
    type: "ALL" as MemberType | "ALL",
    status: "ALL" as ProfileStatus | "ALL",
    handler: "",
  });

  const [historyOf, setHistoryOf] = useState<MemberProfile | null>(null);
  const [action, setAction] = useState<{ kind: ActionKind; row: MemberProfile | null }>({
    kind: null,
    row: null,
  });
  const [actionNote, setActionNote] = useState("");

  const refresh = () => setItems(listProfiles());
  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (applied.code && !r.code.toLowerCase().includes(applied.code.toLowerCase())) return false;
      if (
        applied.name &&
        !(r.name + " " + (r.shortName ?? "")).toLowerCase().includes(applied.name.toLowerCase())
      )
        return false;
      if (applied.type !== "ALL" && r.type !== applied.type) return false;
      if (applied.status !== "ALL" && r.status !== applied.status) return false;
      if (applied.handler && !r.handler.toLowerCase().includes(applied.handler.toLowerCase()))
        return false;
      return true;
    });
  }, [items, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onSearch = () => {
    setApplied({ code: fCode, name: fName, type: fType, status: fStatus, handler: fHandler });
    setPage(1);
  };
  const onReset = () => {
    setFCode("");
    setFName("");
    setFType("ALL");
    setFStatus("ALL");
    setFHandler("");
    setApplied({ code: "", name: "", type: "ALL", status: "ALL", handler: "" });
    setPage(1);
  };

  const submitAction = () => {
    if (!action.kind || !action.row) return;
    const actor = "VNX - Người dùng hiện tại";
    if (action.kind === "approve") {
      setStatus(action.row.id, "Đã phê duyệt", actor, actionNote || undefined);
      toast.success(`Đã phê duyệt hồ sơ ${action.row.code}`);
    } else {
      setStatus(action.row.id, "Trả bổ sung", actor, actionNote || undefined);
      toast.success(`Đã trả bổ sung hồ sơ ${action.row.code}`);
    }
    setAction({ kind: null, row: null });
    setActionNote("");
    refresh();
  };

  return (
    <AppShell activeKey="ho-so">
      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Quản lý hồ sơ
            </p>
            <h1 className="text-xl font-semibold">Quản lý hồ sơ thành viên</h1>
          </div>
          <Button onClick={() => navigate({ to: "/ho-so/thanh-vien/moi" })}>
            <Plus className="mr-1 h-4 w-4" /> Khởi tạo hồ sơ
          </Button>
        </div>

        {/* Bộ lọc */}
        <div className="rounded-xl border border-border bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Mã Thành viên</Label>
              <Input
                value={fCode}
                onChange={(e) => setFCode(e.target.value)}
                placeholder="VD: TV0001"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tên Thành viên</Label>
              <Input
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder="Tên đầy đủ hoặc rút gọn"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Loại thành viên</Label>
              <Select value={fType} onValueChange={(v) => setFType(v as MemberType | "ALL")}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {(Object.keys(MEMBER_TYPE_LABEL) as MemberType[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {MEMBER_TYPE_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Trạng thái hồ sơ</Label>
              <Select
                value={fStatus}
                onValueChange={(v) => setFStatus(v as ProfileStatus | "ALL")}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Người QLHS</Label>
              <Input
                value={fHandler}
                onChange={(e) => setFHandler(e.target.value)}
                placeholder="HSX / HNX / Tên cán bộ / Mã TV"
                className="h-9"
              />
            </div>
            <div className="flex items-end justify-end gap-2">
              <Button variant="outline" onClick={onReset} className="h-9">
                <RefreshCw className="mr-1 h-4 w-4" /> Làm mới
              </Button>
              <Button onClick={onSearch} className="h-9">
                <Search className="mr-1 h-4 w-4" /> Tìm kiếm
              </Button>
            </div>
          </div>
        </div>

        {/* Danh sách */}
        <div className="rounded-xl border border-border bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Danh sách hồ sơ thành viên</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} bản ghi</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead className="w-[120px]">Mã Thành viên</TableHead>
                  <TableHead>Tên Thành viên</TableHead>
                  <TableHead className="w-[160px]">Loại thành viên</TableHead>
                  <TableHead className="w-[200px]">Trạng thái hồ sơ</TableHead>
                  <TableHead className="w-[160px]">Người QLHS</TableHead>
                  <TableHead className="w-[260px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Không có hồ sơ phù hợp. Bấm "Khởi tạo hồ sơ" để tạo mới.
                    </TableCell>
                  </TableRow>
                )}
                {pageItems.map((r, idx) => {
                  const canApprove = r.status === "Chờ VNX phê duyệt";
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                      <TableCell className="font-medium">
                        <Link
                          to="/ho-so/thanh-vien/$id"
                          params={{ id: r.id }}
                          className="hover:text-[var(--color-brand)]"
                        >
                          {r.code}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                        {r.shortName && (
                          <div className="text-xs text-muted-foreground">{r.shortName}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{MEMBER_TYPE_LABEL[r.type]}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_TONE[r.status]} variant="secondary">
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{r.handler}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate({ to: "/ho-so/thanh-vien/$id", params: { id: r.id } })
                            }
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" /> Xem
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!canApprove}
                            onClick={() => {
                              setAction({ kind: "approve", row: r });
                              setActionNote("");
                            }}
                            className="text-[var(--color-success)] hover:text-[var(--color-success)] disabled:opacity-40"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Phê duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!canApprove}
                            onClick={() => {
                              setAction({ kind: "return", row: r });
                              setActionNote("");
                            }}
                            className="text-destructive hover:text-destructive disabled:opacity-40"
                          >
                            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Trả bổ sung
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setHistoryOf(r)}>
                            <History className="mr-1 h-3.5 w-3.5" /> Lịch sử
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-xs text-muted-foreground">
              Trang {page}/{totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                « Trước
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau »
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* History dialog */}
      <Dialog open={!!historyOf} onOpenChange={(v) => !v && setHistoryOf(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử xử lý hồ sơ</DialogTitle>
            <DialogDescription>
              {historyOf?.code} — {historyOf?.name}
            </DialogDescription>
          </DialogHeader>
          <ol className="relative space-y-4 border-l border-border pl-5">
            {historyOf?.history.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[27px] top-1 inline-block h-3 w-3 rounded-full bg-[var(--color-brand)]" />
                <div className="text-sm font-medium">{h.action}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(h.at), "dd/MM/yyyy HH:mm")} • {h.actor}
                </div>
                {h.note && <div className="mt-1 text-sm">{h.note}</div>}
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>

      {/* Approve / Return dialog */}
      <Dialog
        open={!!action.kind}
        onOpenChange={(v) => !v && setAction({ kind: null, row: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action.kind === "approve" ? "Phê duyệt hồ sơ" : "Trả bổ sung hồ sơ"}
            </DialogTitle>
            <DialogDescription>
              {action.row?.code} — {action.row?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">
              {action.kind === "approve" ? "Ghi chú (không bắt buộc)" : "Lý do trả bổ sung"}
            </Label>
            <Textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              rows={4}
              placeholder={
                action.kind === "approve"
                  ? "Ghi chú nội bộ..."
                  : "Nêu rõ nội dung cần bổ sung, chỉnh sửa..."
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction({ kind: null, row: null })}>
              Hủy
            </Button>
            <Button
              onClick={submitAction}
              disabled={action.kind === "return" && !actionNote.trim()}
            >
              {action.kind === "approve" ? "Xác nhận phê duyệt" : "Gửi trả bổ sung"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
