import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CbttReport, Status, deleteReport, listReports } from "@/lib/cbtt-store";

export const Route = createFileRoute("/cbtt/dinh-ky/")({
  head: () => ({
    meta: [
      { title: "CBTT định kỳ — Cổng thành viên" },
      { name: "description", content: "Danh sách tin công bố thông tin định kỳ." },
    ],
  }),
  component: CbttListPage,
});

const STATUS_TONE: Record<Status, string> = {
  "Nháp": "bg-muted text-foreground",
  "Chờ duyệt": "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  "Đã duyệt": "bg-[var(--color-success)]/15 text-[var(--color-success)]",
};

function CbttListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CbttReport[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [pendingDelete, setPendingDelete] = useState<CbttReport | null>(null);

  const refresh = () => setItems(listReports());
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (status !== "ALL" && r.status !== status) return false;
      if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, q, status]);

  const onConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteReport(pendingDelete.id);
    toast.success("Đã xóa tin công bố");
    setPendingDelete(null);
    refresh();
  };

  return (
    <AppShell activeKey="cbtt">
      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            className="text-white hover:opacity-90"
            style={{ background: "var(--color-cta-gradient)" }}
            onClick={() => navigate({ to: "/cbtt/dinh-ky/moi" })}
          >
            <Plus className="mr-1 h-4 w-4" /> Tạo tin
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tiêu đề..."
                className="h-9 w-[260px] pl-8"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as Status | "ALL")}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="Nháp">Nháp</SelectItem>
                <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
                <SelectItem value="Đã duyệt">Đã duyệt</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto text-xs text-muted-foreground">
              {filtered.length} bản ghi
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="w-[130px]">Trạng thái</TableHead>
                  <TableHead className="w-[140px]">Ngày tạo</TableHead>
                  <TableHead className="w-[180px]">Người tạo</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="w-[140px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      Chưa có dữ liệu. Bấm "Tạo tin" để tạo tin công bố đầu tiên.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((r, idx) => (
                  <TableRow key={r.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">
                      <Link
                        to="/cbtt/dinh-ky/$id"
                        params={{ id: r.id }}
                        className="hover:text-[var(--color-brand)]"
                      >
                        {r.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_TONE[r.status]} variant="secondary">
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(r.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm">{r.createdBy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.note || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Xem"
                          onClick={() => navigate({ to: "/cbtt/dinh-ky/$id", params: { id: r.id } })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Sửa"
                          onClick={() =>
                            navigate({ to: "/cbtt/dinh-ky/$id/sua", params: { id: r.id } })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Xóa"
                          onClick={() => setPendingDelete(r)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tin công bố?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa "{pendingDelete?.title}". Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
