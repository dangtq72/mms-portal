import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CbttForm } from "@/components/cbtt/CbttForm";

export const Route = createFileRoute("/cbtt/dinh-ky/moi")({
  head: () => ({
    meta: [{ title: "Thêm mới CBTT định kỳ — Cổng thành viên" }],
  }),
  component: NewPage,
});

function NewPage() {
  return (
    <AppShell activeKey="cbtt">
      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        <div>
          <Link
            to="/cbtt/dinh-ky"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
          <h1 className="mt-2 text-xl font-semibold">Thêm mới CBTT định kỳ</h1>
          <p className="text-sm text-muted-foreground">
            Khai báo thông tin và nội dung tin công bố định kỳ.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--color-surface)] p-6 shadow-sm">
          <CbttForm />
        </div>
      </main>
    </AppShell>
  );
}
