import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  User,
  LayoutDashboard,
  Megaphone,
  FileBarChart,
  BellRing,
  UserCog,
  FolderKanban,
} from "lucide-react";
import type { ReactNode } from "react";

export type NavKey = "dashboard" | "ho-so" | "cbtt" | "bao-cao" | "thong-bao" | "tai-khoan";

type NavItem = {
  key: NavKey;
  label: string;
  icon: typeof LayoutDashboard;
  to?: string;
  children?: { label: string; to: string }[];
};

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/" },
  {
    key: "ho-so",
    label: "Quản lý hồ sơ",
    icon: FolderKanban,
    children: [
      { label: "Hồ sơ thành viên", to: "/ho-so/thanh-vien" },
      { label: "Danh sách cổ đông", to: "/ho-so/co-dong" },
      { label: "Nhân sự lãnh đạo", to: "/ho-so/lanh-dao" },
      { label: "Mạng lưới hoạt động", to: "/ho-so/mang-luoi" },
    ],
  },
  {
    key: "cbtt",
    label: "Công bố thông tin",
    icon: Megaphone,
    children: [
      { label: "CBTT định kỳ", to: "/cbtt/dinh-ky" },
      { label: "CBTT bất thường", to: "/cbtt/bat-thuong" },
      { label: "CBTT theo yêu cầu", to: "/cbtt/theo-yeu-cau" },
    ],
  },
  { key: "bao-cao", label: "Báo cáo", icon: FileBarChart, to: "/bao-cao" },
  { key: "thong-bao", label: "Thông báo từ VNX", icon: BellRing, to: "/thong-bao" },
  { key: "tai-khoan", label: "Quản lý tài khoản", icon: UserCog, to: "/tai-khoan" },
];

export function AppShell({
  activeKey,
  children,
}: {
  activeKey: NavKey;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Member Workspace
            </p>
            <h1 className="text-lg font-semibold leading-tight">Cổng thành viên</h1>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              aria-label="Chọn thành viên"
              aria-haspopup="listbox"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 hover:bg-accent"
            >
              <span className="font-semibold">VND</span>
              <span className="text-muted-foreground">Công ty chứng khoán VNDirect</span>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Tài khoản người dùng"
              className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
            >
              <User className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <nav aria-label="Điều hướng chính" className="sticky top-[57px] z-30 border-b border-border bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.key === activeKey;
            const baseBtn = `relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors ${
              active
                ? "text-[var(--color-brand)] after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[var(--color-brand)]"
                : "text-muted-foreground hover:text-foreground"
            }`;
            return (
              <div key={item.key} className="group relative">
                {item.children ? (
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-current={active ? "page" : undefined}
                    className={baseBtn}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                    <ChevronDown
                      className="h-3.5 w-3.5 transition-transform group-hover:rotate-180"
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <Link to={item.to!} className={baseBtn} aria-current={active ? "page" : undefined}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                )}
                {item.children && (
                  <div
                    role="menu"
                    className="invisible absolute left-0 top-full z-30 min-w-[220px] -translate-y-1 rounded-md border border-border bg-[var(--color-surface)] p-1 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        role="menuitem"
                        className="flex w-full items-center rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {children}
    </div>
  );
}
