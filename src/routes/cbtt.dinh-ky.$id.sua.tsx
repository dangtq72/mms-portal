import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { CbttForm } from "@/components/cbtt/CbttForm";
import { CbttReport, getReport } from "@/lib/cbtt-store";

export const Route = createFileRoute("/cbtt/dinh-ky/$id/sua")({
  head: () => ({ meta: [{ title: "Sửa CBTT định kỳ — Cổng thành viên" }] }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<CbttReport | undefined>();

  useEffect(() => { setItem(getReport(id)); }, [id]);

  if (!item) {
    return (
      <AppShell activeKey="cbtt">
        <main className="mx-auto max-w-3xl px-6 py-10 text-center">
          <h1 className="text-lg font-semibold">Không tìm thấy bản ghi</h1>
          <Button className="mt-4" onClick={() => navigate({ to: "/cbtt/dinh-ky" })}>
            Quay lại danh sách
          </Button>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell activeKey="cbtt">
      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        <div>
          <Link
            to="/cbtt/dinh-ky/$id"
            params={{ id: item.id }}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Quay lại chi tiết
          </Link>
          <h1 className="mt-2 text-xl font-semibold">Sửa CBTT định kỳ</h1>
        </div>
        <div className="rounded-xl border border-border bg-[var(--color-surface)] p-6 shadow-sm">
          <CbttForm existing={item} />
        </div>
      </main>
    </AppShell>
  );
}
