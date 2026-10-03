import { ReactNode, useEffect, useState } from "react";
import {  Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  ListChecks,
  Phone,
  GraduationCap,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  CreditCardIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthActions, useAuth } from "@/contexts/AuthContext";

// ── Counsellor is only allowed these three routes ──────────────────────────────
const NAV = [
  { to: "/counsellor",              label: "Dashboard",   icon: LayoutDashboard },
  { to: "/counsellor/leads",        label: "My Leads",    icon: Sparkles },
  { to: "/counsellor/follow-ups",   label: "Follow-ups",  icon: ListChecks },
  { to: "/counsellor/call-logs",    label: "Call Logs",   icon: Phone },
  {
  to: "/counsellor/fee-collection",
  label: "Fee Collection",
  icon: CreditCardIcon,
}
];

const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof window !== "undefined"
      ? ((localStorage.getItem("admin-theme") as "light" | "dark") || "light")
      : "light"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
};

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
const navigate = useNavigate();
const { signOut, user } = useAuth();

const handleLogout = () => {
  signOut();
  navigate("/login", { replace: true });
};

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link to="/counsellor" className="flex items-center gap-2 px-5 py-5" onClick={onNavigate}>
        {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0037FF] text-[#0037FF]-foreground">
          <GraduationCap size={20} />
        </div> */}
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold">Slate Academy</span>
          <span className="text-[11px] text-muted-foreground">Counsellor Panel</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="mb-2 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          CRM
        </div>
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === "/counsellor"
                ? location.pathname === "/counsellor"
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/counsellor"}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-[#0037FF]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User info + logout */}
      <div className="mx-3 mb-4 rounded-xl border border-border bg-secondary/60 p-4">
        <div className="text-xs font-semibold truncate">{user?.fullName ?? "Counsellor"}</div>
        <div className="text-[10px] text-muted-foreground truncate mb-3">{user?.email}</div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs"
          onClick={handleLogout}
        >
          <LogOut size={12} />
          Sign out
        </Button>
      </div>
    </div>
  );
};

const CounsellorLayout = ({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-card overflow-y-auto">
            <button
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <div className="relative hidden flex-1 max-w-md md:block">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search your leads…"
              className="h-9 pl-9 bg-secondary/60 border-transparent focus-visible:bg-background"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell size={16} />
            </Button> */}
            <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs font-semibold text-white">
                {(user?.fullName ?? "C").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden text-left leading-tight md:block">
                <div className="text-xs font-semibold truncate max-w-[120px]">
                  {user?.fullName ?? "Counsellor"}
                </div>
                <div className="text-[10px] text-muted-foreground">Counsellor</div>
              </div>
              {/* <ChevronDown size={14} className="hidden text-muted-foreground md:block" /> */}
            </div>
          </div>
        </header>

        {/* Page title bar */}
        <div className="border-b border-border bg-card/40 px-4 py-5 md:px-8">
         <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
  <div className="min-w-0">
    <h1 className="text-2xl font-bold tracking-tight text-gray-800">
      {title}
    </h1>

    {subtitle && (
      <p className="mt-1 text-sm text-muted-foreground">
        {subtitle}
      </p>
    )}
  </div>

  {actions && (
    <div className="w-full lg:w-auto">
      {actions}
    </div>
  )}
</div>
        </div>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
};

export default CounsellorLayout;