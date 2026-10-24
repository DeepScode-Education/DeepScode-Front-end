import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileBadge,
  BookOpen,
  Video,
  LineChart,
  BarChart3,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// ── Mentor is only allowed these routes ─────────────────────────────────────
const NAV = [
  {
    label: "Overview",
    items: [{ to: "/mentor/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Academy",
    items: [
      { to: "/mentor/batches", label: "My Batches", icon: Layers },
      { to: "/mentor/students", label: "My Students", icon: Users },
      { to: "/mentor/assignments", label: "Assignments", icon: FileBadge },
      // { to: "/mentor/courses", label: "Courses", icon: BookOpen },
      // { to: "/mentor/classes", label: "Live Classes", icon: Video },
    ],
  },
  // {
  //   label: "Performance",
  //   items: [
  //     { to: "/mentor/students", label: "Student Progress", icon: LineChart },
  //     { to: "/mentor", label: "Reports", icon: BarChart3 },
  //   ],
  // },
];

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
      <Link to="/mentor" className="flex items-center gap-2 px-5 py-5" onClick={onNavigate}>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold">deepScode Education</span>
          <span className="text-[11px] text-muted-foreground">Mentor Panel</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="mb-2 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.to === "/mentor"
                    ? location.pathname === "/mentor"
                    : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={`${group.label}-${item.label}`}
                    to={item.to}
                    end={item.to === "/mentor"}
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
          </div>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="mx-3 mb-4 rounded-xl border border-border bg-secondary/60 p-4">
        <div className="text-xs font-semibold truncate">{user?.fullName ?? "Mentor"}</div>
        <div className="mb-3 truncate text-[10px] text-muted-foreground">{user?.email}</div>
        <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={handleLogout}>
          <LogOut size={12} />
          Sign out
        </Button>
      </div>
    </div>
  );
};

const MentorLayout = ({
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user?.fullName ?? "M")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-border bg-card">
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
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your students…"
              className="h-9 pl-9 bg-secondary/60 border-transparent focus-visible:bg-background"
            />
          </div>

          <div className="relative ml-auto" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 hover:bg-secondary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-white ring-2 ring-background">
                {initials}
              </div>
              <div className="hidden text-left leading-tight md:block">
                <div className="text-xs font-semibold max-w-[120px] truncate">
                  {user?.fullName ?? "Mentor"}
                </div>
                <div className="text-[10px] text-muted-foreground">MENTOR</div>
              </div>
              <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border bg-white shadow-lg">
                <MentorLogoutButton />
              </div>
            )}
          </div>
        </header>

        {/* Page title bar */}
        <div className="border-b border-border bg-card/40 px-4 py-5 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-gray-800">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="w-full lg:w-auto">{actions}</div>}
          </div>
        </div>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
};

// Small helper so the dropdown logout button uses the same signOut/navigate
// logic as the sidebar without duplicating the useNavigate hook awkwardly.
const MentorLogoutButton = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        signOut();
        navigate("/login", { replace: true });
      }}
      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      <LogOut size={16} />
      Logout
    </button>
  );
};

export default MentorLayout;