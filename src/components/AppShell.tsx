import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  User,
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  BellRing,
  FolderOpen,
  PanelLeftClose,
  PanelRightOpen,
  Settings,
  UserCog,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import vnxLogo from "@/assets/vnx-logo-new.png.asset.json";


export type NavKey = "dashboard" | "ho-so" | "cbtt" | "bao-cao" | "thong-bao" | "tai-khoan";

const PAGE_TITLES: Record<NavKey, { label: string; icon: typeof LayoutDashboard }> = {
  dashboard: { label: "DASHBOARD", icon: LayoutDashboard },
  "ho-so": { label: "HỒ SƠ THÀNH VIÊN", icon: Users },
  cbtt: { label: "CÔNG BỐ THÔNG TIN", icon: FileText },
  "bao-cao": { label: "BÁO CÁO", icon: FolderOpen },
  "thong-bao": { label: "THÔNG BÁO TỪ VNX", icon: BellRing },
  "tai-khoan": { label: "TÀI KHOẢN", icon: Receipt },
};

type LeafItem = {
  label: string;
  to: string;
  icon?: typeof LayoutDashboard;
  matchKey?: NavKey;
};

type Section = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  items: LeafItem[];
  defaultOpen?: boolean;
};

const FAVORITES: LeafItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, matchKey: "dashboard" },
  { label: "Hồ sơ Thành viên", to: "https://admin-art-attach.lovable.app/ho-so", icon: Users },
  { label: "CBTT định kỳ", to: "/cbtt/dinh-ky", icon: FileText, matchKey: "cbtt" },
  { label: "Giá dịch vụ", to: "/tai-khoan", icon: Receipt },
];

const SECTIONS: Section[] = [
  {
    id: "tong-quan",
    label: "Tổng quan",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard, matchKey: "dashboard" },
      { label: "Thông báo từ VNX", to: "/thong-bao", icon: BellRing, matchKey: "thong-bao" },
    ],
  },
  {
    id: "ho-so",
    label: "Quản lý hồ sơ",
    icon: Users,
    items: [
      { label: "Hồ sơ thành viên", to: "https://admin-art-attach.lovable.app/ho-so", icon: Users, matchKey: "ho-so" },
    ],
  },
  {
    id: "cbtt",
    label: "Công bố thông tin",
    icon: FileText,
    items: [
      { label: "CBTT định kỳ", to: "/cbtt/dinh-ky", matchKey: "cbtt" },
      { label: "CBTT bất thường", to: "/cbtt/bat-thuong" },
      { label: "Tin công bố của TV (admin)", to: "/cbtt/theo-yeu-cau" },
    ],
  },
  { id: "bao-cao", label: "Báo cáo", icon: FolderOpen, items: [{ label: "Báo cáo", to: "/bao-cao", matchKey: "bao-cao" }] },
  { id: "tai-chinh", label: "Tài chính", icon: Receipt, items: [{ label: "Giá dịch vụ", to: "/tai-khoan" }] },
  { id: "van-hanh", label: "Vận hành", icon: Settings, items: [{ label: "Tổng quan", to: "/" }] },
  { id: "quan-tri", label: "Quản trị", icon: UserCog, items: [{ label: "Tài khoản", to: "/tai-khoan", matchKey: "tai-khoan" }] },
];

export function AppShell({
  activeKey,
  children,
}: {
  activeKey: NavKey;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [favKeys, setFavKeys] = useState<Set<string>>(
    () => new Set(FAVORITES.map((f) => f.to)),
  );
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = { favorites: true };
    SECTIONS.forEach((s) => (init[s.id] = s.defaultOpen ?? false));
    return init;
  });

  const toggleSection = (id: string) =>
    setOpenMap((m) => ({ ...m, [id]: !m[id] }));
  const toggleFav = (to: string) =>
    setFavKeys((s) => {
      const n = new Set(s);
      n.has(to) ? n.delete(to) : n.add(to);
      return n;
    });

  const q = query.trim().toLowerCase();
  const matches = (label: string) => !q || label.toLowerCase().includes(q);

  const filteredFavs = useMemo(
    () => FAVORITES.filter((f) => matches(f.label)),
    [q],
  );

  const isExternal = (to: string) => to.startsWith("http");
  const isActive = (item: LeafItem) => !isExternal(item.to) && item.matchKey === activeKey;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside
          aria-label="Điều hướng chính"
          className={`sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-border bg-[var(--color-surface)] transition-[width] duration-200 ease-linear md:flex ${
            collapsed ? "w-16" : "w-72"
          }`}
        >
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 px-2 pt-2 pb-2">
            <img src={vnxLogo.url} alt="VNX" className="h-8 w-auto shrink-0" />
            {!collapsed && (
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#2E256A' }}>
                  Vietnam Exchange
                </p>
                <h1 className="text-base font-semibold">MMS Portal</h1>
              </div>
            )}
          </Link>

          {/* Search */}
          {!collapsed && (
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm menu (Ctrl+/ )"
                  className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                />
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className={`flex-1 overflow-y-auto px-3 pb-4 sidebar-scroll ${collapsed ? "px-2" : "px-3"}`}>
            {/* Favorites */}
            <SectionHeader
              label="Yêu thích"
              icon={Star}
              collapsed={collapsed}
              open={openMap.favorites}
              onToggle={() => toggleSection("favorites")}
            />
            {openMap.favorites && (
              <div className={`mb-2 flex flex-col gap-0.5 ${collapsed ? "items-center" : ""}`}>
                {filteredFavs.map((item) => {
                  const Icon = item.icon ?? LayoutDashboard;
                  const active = isActive(item);
                  const external = isExternal(item.to);
                  return collapsed ? (
                    <CollapsedNavItem
                      key={item.to}
                      item={item}
                      active={active}
                      external={external}
                    />
                  ) : (
                    <div key={item.to} className="group flex items-center gap-1">
                      {external ? (
                        <a
                          href={item.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors text-foreground hover:bg-accent"
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span className="flex-1 truncate">{item.label}</span>
                        </a>
                      ) : (
                        <Link
                          to={item.to}
                          className={`flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                            active
                              ? "bg-[var(--color-brand)]/10 font-medium text-[var(--color-brand)]"
                              : "text-foreground hover:bg-accent"
                          }`}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span className="flex-1 truncate">{item.label}</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        aria-label={`Bỏ ghim ${item.label}`}
                        onClick={() => toggleFav(item.to)}
                        className="mr-1 grid h-7 w-7 place-items-center rounded text-amber-400 hover:bg-accent"
                      >
                        <Star className="h-4 w-4 fill-amber-400" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
                {filteredFavs.length === 0 && !collapsed && (
                  <p className="px-2.5 py-1 text-xs text-muted-foreground">Không có mục yêu thích</p>
                )}
              </div>
            )}

            {/* Sections */}
            {SECTIONS.map((section) => {
              const items = section.items.filter((i) => matches(i.label));
              if (q && items.length === 0) return null;
              const open = openMap[section.id];
              return (
                <div key={section.id} className="mt-1">
                  <SectionHeader
                    label={section.label}
                    icon={section.icon}
                    collapsed={collapsed}
                    open={open}
                    onToggle={() => toggleSection(section.id)}
                  />
                  {open && (
                    <div className={`mb-1 flex flex-col gap-0.5 ${collapsed ? "items-center" : ""}`}>
                      {items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        const pinned = favKeys.has(item.to);
                        const external = isExternal(item.to);
                        return collapsed ? (
                          <CollapsedNavItem
                            key={item.to}
                            item={item}
                            active={active}
                            external={external}
                            pinned={pinned}
                            onTogglePin={() => toggleFav(item.to)}
                          />
                        ) : (
                          <div key={item.to} className="group flex items-center gap-1">
                            {external ? (
                              <a
                                href={item.to}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors text-foreground hover:bg-accent"
                              >
                                {Icon ? (
                                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                ) : (
                                  <span className="h-4 w-4 shrink-0" />
                                )}
                                <span className="flex-1 truncate">{item.label}</span>
                              </a>
                            ) : (
                              <Link
                                to={item.to}
                                className={`flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                                  active
                                    ? "bg-[var(--color-brand)]/10 font-medium text-[var(--color-brand)]"
                                    : "text-foreground hover:bg-accent"
                                }`}
                                aria-current={active ? "page" : undefined}
                              >
                                {Icon ? (
                                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                ) : (
                                  <span className="h-4 w-4 shrink-0" />
                                )}
                                <span className="flex-1 truncate">{item.label}</span>
                              </Link>
                            )}
                            <button
                              type="button"
                              aria-label={pinned ? `Bỏ ghim ${item.label}` : `Ghim ${item.label}`}
                              onClick={() => toggleFav(item.to)}
                              className={`mr-1 grid h-7 w-7 place-items-center rounded hover:bg-accent ${
                                pinned ? "text-amber-400" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <Star
                                className={`h-4 w-4 ${pinned ? "fill-amber-400" : ""}`}
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            aria-pressed={collapsed}
            title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            className={`mx-3 mb-2 flex items-center gap-2.5 rounded-md border border-border px-2.5 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground ${collapsed ? "justify-center" : ""}`}
          >
            {collapsed ? (
              <PanelRightOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1 text-left">Thu gọn sidebar</span>
              </>
            )}
          </button>

          {/* Footer */}
          {!collapsed && (
            <div className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
              v1.0 · © 2026 VNX
            </div>
          )}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-[var(--color-surface)] px-6 py-2 text-xs">
            <div className="flex items-center gap-3">
              {(() => {
                const PageIcon = PAGE_TITLES[activeKey].icon;
                return (
                  <div className="flex items-center gap-2 text-lg font-bold uppercase tracking-[0.12em]" style={{ color: '#2E256A' }}>
                    <PageIcon className="h-4 w-4" aria-hidden="true" />
                    <span>{PAGE_TITLES[activeKey].label}</span>
                  </div>
                );
              })()}
            </div>
            <div className="flex items-center gap-2">
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
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  label,
  icon: Icon,
  collapsed,
  open,
  onToggle,
}: {
  label: string;
  icon: typeof LayoutDashboard;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      title={label}
      className={`mt-2 flex w-full items-center text-muted-foreground hover:text-foreground ${
        collapsed ? "justify-center px-1 py-1.5" : "justify-between px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
      }`}
    >
      {collapsed ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <span>{label}</span>
      )}
      {!collapsed && (
        open ? (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        )
      )}
    </button>
  );
}

function CollapsedNavItem({
  item,
  active,
  external,
  pinned,
  onTogglePin,
}: {
  item: LeafItem;
  active: boolean;
  external: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
}) {
  const Icon = item.icon ?? LayoutDashboard;
  const baseClass =
    "grid h-8 w-8 place-items-center rounded-md transition-colors " +
    (active
      ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
      : "text-foreground hover:bg-accent");

  return (
    <div className="group relative flex items-center justify-center py-0.5">
      {external ? (
        <a
          href={item.to}
          target="_blank"
          rel="noopener noreferrer"
          title={item.label}
          className={baseClass}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
      ) : (
        <Link
          to={item.to}
          title={item.label}
          className={baseClass}
          aria-current={active ? "page" : undefined}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      )}
      {onTogglePin && (
        <button
          type="button"
          aria-label={pinned ? `Bỏ ghim ${item.label}` : `Ghim ${item.label}`}
          onClick={onTogglePin}
          className={`absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full text-[10px] ${
            pinned ? "text-amber-400" : "text-muted-foreground opacity-0 group-hover:opacity-100"
          }`}
        >
          <Star className={`h-3 w-3 ${pinned ? "fill-amber-400" : ""}`} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
