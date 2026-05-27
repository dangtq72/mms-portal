import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MEMBER_TYPE_LABEL,
  MemberProfile,
  ProfileStatus,
  getProfile,
  setStatus,
} from "@/lib/member-store";

export const Route = createFileRoute("/ho-so/thanh-vien/$id")({
  head: () => ({ meta: [{ title: "Chi tiết hồ sơ thành viên — Cổng VNX" }] }),
  component: MemberDetailPage,
});

const STATUS_TONE: Record<ProfileStatus, string> = {
  "Nháp": "bg-muted text-foreground",
  "Chờ HSX/HNX cập nhật": "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  "Chờ Thành viên cập nhật": "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  "Chờ VNX phê duyệt": "bg-[var(--color-brand)]/15 text-[var(--color-brand)]",
  "Đã phê duyệt": "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  "Trả bổ sung": "bg-destructive/15 text-destructive",
};

function MemberDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MemberProfile | undefined>();
  const [actionKind, setActionKind] = useState<"approve" | "return" | null>(null);
  const [note, setNote] = useState("");

  const refresh = () => setProfile(getProfile(id));
  useEffect(() => {
    refresh();
  }, [id]);

  if (!profile) {
    return (
      <AppShell activeKey="ho-so">
        <main className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-sm text-muted-foreground">Không tìm thấy hồ sơ.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate({ to: "/ho-so/thanh-vien" })}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại danh sách
          </Button>
        </main>
      </AppShell>
    );
  }

  const canApprove = profile.status === "Chờ VNX phê duyệt";

  const submit = () => {
    if (!actionKind) return;
    const actor = "VNX - Người dùng hiện tại";
    if (actionKind === "approve") {
      setStatus(profile.id, "Đã phê duyệt", actor, note || undefined);
      toast.success("Đã phê duyệt hồ sơ");
    } else {
      setStatus(profile.id, "Trả bổ sung", actor, note || undefined);
      toast.success("Đã trả bổ sung");
    }
    setActionKind(null);
    setNote("");
    refresh();
  };

  return (
    <AppShell activeKey="ho-so">
      <main className="mx-auto max-w-5xl space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/ho-so/thanh-vien" })}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
            </Button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Hồ sơ thành viên
              </p>
              <h1 className="text-xl font-semibold">
                {profile.code} — {profile.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_TONE[profile.status]} variant="secondary">
              {profile.status}
            </Badge>
            <Button
              disabled={!canApprove}
              onClick={() => {
                setActionKind("approve");
                setNote("");
              }}
              className="bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 disabled:opacity-40"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> Phê duyệt
            </Button>
            <Button
              variant="outline"
              disabled={!canApprove}
              onClick={() => {
                setActionKind("return");
                setNote("");
              }}
              className="text-destructive"
            >
              <RotateCcw className="mr-1 h-4 w-4" /> Trả bổ sung
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Card title="Thông tin chung">
              <Grid>
                <Info label="Mã thành viên" value={profile.code} />
                <Info label="Loại thành viên" value={MEMBER_TYPE_LABEL[profile.type]} />
                <Info label="Tên thành viên" value={profile.name} />
                <Info label="Tên rút gọn" value={profile.shortName} />
                <Info label="Mã số thuế" value={profile.taxCode} />
                <Info label="Người QLHS" value={profile.handler} />
                <Info label="Người đại diện" value={profile.representative} />
                <Info label="Điện thoại" value={profile.phone} />
                <Info label="Email" value={profile.email} />
                <Info
                  label="Ngày khởi tạo"
                  value={format(new Date(profile.createdAt), "dd/MM/yyyy HH:mm")}
                />
                <Info label="Địa chỉ" value={profile.address} full />
                <Info label="Ghi chú" value={profile.note} full />
              </Grid>
            </Card>
          </div>

          <Card title="Lịch sử xử lý">
            <ol className="relative space-y-4 border-l border-border pl-5">
              {profile.history.map((h, i) => (
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
          </Card>
        </div>
      </main>

      <Dialog open={!!actionKind} onOpenChange={(v) => !v && setActionKind(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionKind === "approve" ? "Phê duyệt hồ sơ" : "Trả bổ sung hồ sơ"}
            </DialogTitle>
            <DialogDescription>
              {profile.code} — {profile.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">
              {actionKind === "approve" ? "Ghi chú (không bắt buộc)" : "Lý do trả bổ sung"}
            </Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionKind(null)}>
              Hủy
            </Button>
            <Button onClick={submit} disabled={actionKind === "return" && !note.trim()}>
              {actionKind === "approve" ? "Xác nhận phê duyệt" : "Gửi trả bổ sung"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-[var(--color-surface)] p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

function Info({ label, value, full }: { label: string; value?: string; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{value || "—"}</div>
    </div>
  );
}
