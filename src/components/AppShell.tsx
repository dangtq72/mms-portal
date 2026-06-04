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
import vnxLogo from "@/assets/vnx-logo.png.asset.json";

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
      <header className="sticky top-0 z-40 border-b border-[var(--color-brand-dark)] bg-[var(--color-brand)] text-[var(--color-brand-foreground)]">
        <div className="flex items-center justify-between px-6 py-2">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={vnxLogo.url}
              alt="Vietnam Exchange - Sở Giao dịch Chứng khoán Việt Nam"
              className="h-14 w-auto shrink-0 rounded-sm bg-white p-1"
            />
            <div className="border-l border-white/25 pl-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Member Workspace
              </p>
              <h1 className="text-lg font-semibold leading-tight">Cổng thành viên</h1>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              aria-label="Chọn thành viên"
              aria-haspopup="listbox"
              className="flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-white hover:bg-white/20"
            >
              <span className="font-semibold">VND</span>
              <span className="text-white/80">Công ty chứng khoán VNDirect</span>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Tài khoản người dùng"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
            >
              <User className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          aria-label="Điều hướng chính"
          className="sticky top-[72px] z-30 hidden h-[calc(100vh-72px)] w-64 shrink-0 overflow-y-auto border-r border-[var(--color-brand-dark)] bg-[var(--color-brand)] text-[var(--color-brand-foreground)] md:block"
        >
          <nav className="flex flex-col gap-0.5 p-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.key === activeKey;
              const baseBtn = `flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`;
              return (
                <div key={item.key} className="flex flex-col">
                  {item.children ? (
                    <>
                      <div
                        className={baseBtn}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                      </div>
                      <div className="ml-7 mt-0.5 flex flex-col border-l border-white/20 pl-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            className="rounded-sm px-2 py-1.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={item.to!}
                      className={baseBtn}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
