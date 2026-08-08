import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Pencil } from "lucide-react";
import { format } from "date-fns";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CbttReport,
  PERIOD_LABEL,
  ReportSectionKey,
  SECTION_LABEL,
  Status,
  getReport,
} from "@/lib/cbtt-store";

export const Route = createFileRoute("/cbtt/dinh-ky/$id")({
  head: () => ({ meta: [{ title: "Chi tiết CBTT định kỳ — Cổng thành viên" }] }),
  component: DetailPage,
});

const STATUS_TONE: Record<Status, string> = {
  "Nháp": "bg-muted text-foreground",
  "Chờ kiểm tra": "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  "Đã công bố": "bg-[var(--color-success)]/15 text-[var(--color-success)]",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function DetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<CbttReport | undefined>();

  useEffect(() => { setItem(getReport(id)); }, [id]);

  if (!item) {
    return (
      <AppShell activeKey="cbtt">
        <main className="mx-auto max-w-3xl px-6 py-10 text-center">
          <h1 className="text-lg font-semibold">Không tìm thấy tin công bố</h1>
          <p className="mt-2 text-sm text-muted-foreground">Bản ghi có thể đã bị xóa.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/cbtt/dinh-ky" })}>
            Quay lại danh sách
          </Button>
        </main>
      </AppShell>
    );
  }

  const sectionKeys: ReportSectionKey[] = [
    "balanceSheet",
    "incomeStatement",
    "cashFlow",
    "profitExplanation",
  ];

  return (
    <AppShell activeKey="cbtt">
      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              to="/cbtt/dinh-ky"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
            </Link>
            <h1 className="mt-2 text-xl font-semibold">{item.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge className={STATUS_TONE[item.status]} variant="secondary">
                {item.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Tạo lúc {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")} bởi {item.createdBy}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/cbtt/dinh-ky/$id/sua", params: { id: item.id } })}
          >
            <Pencil className="mr-1 h-4 w-4" /> Sửa
          </Button>
        </div>

        <section className="rounded-xl border border-border bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Thông tin chung</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Kỳ CBTT" value={PERIOD_LABEL[item.period]} />
            <Field label="Loại tin" value={item.newsType} />
            <Field label="Năm tài chính" value={item.fiscalYear} />
            <Field label="Quý" value={item.quarter ? `Quý ${item.quarter}` : "—"} />
            <Field label="Ngày ban hành" value={format(new Date(item.issuedAt), "dd/MM/yyyy")} />
            <Field label="Ghi chú" value={item.note} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">Toàn văn báo cáo tài chính</h2>
          <div className="space-y-3">
            {sectionKeys.map((k) => {
              const s = item.sections?.[k];
              return (
                <div key={k} className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">{SECTION_LABEL[k]}</h3>
                    {s?.content ? (
                      <Badge variant="secondary" className="text-[10px]">Đã nhập</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Chưa nhập</span>
                    )}
                  </div>
                  {s?.content && (
                    <pre className="whitespace-pre-wrap text-sm text-foreground">{s.content}</pre>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
