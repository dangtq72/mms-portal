import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/ho-so/mang-luoi")({
  component: Page,
});

function Page() {
  return (
    <AppShell activeKey="ho-so">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Mạng lưới hoạt động</h1>
        <p className="mt-2 text-sm text-muted-foreground">Trang đang được xây dựng.</p>
      </main>
    </AppShell>
  );
}
