import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FolderKanban,
  Trophy,
  Wallet,
  FileText,
  User as UserIcon,
  LifeBuoy,
  Award,
  Upload,
  Receipt,
  Video,
  Search,
  Moon,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "../../../contexts/AuthContext";
import logo from "@/assets/logo/latest-logo.png";

// ─────────────────────────────────────────────────────────────────────────────
// Nav config
// ─────────────────────────────────────────────────────────────────────────────

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const MAIN_MENU: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/course", label: "My Course", icon: BookOpen },
  { to: "/student/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/student/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/student/portfolio", label: "Portfolio", icon: FolderKanban },
  { to: "/student/placements", label: "Placements", icon: Trophy },
  { to: "/student/payments", label: "Payments", icon: Wallet },
  { to: "/student/documents", label: "Documents", icon: FileText },
  { to: "/student/profile", label: "Profile", icon: UserIcon },
  { to: "/student/support", label: "Support", icon: LifeBuoy },
];

// Quick actions are shortcuts, not routes — wire onQuickAction to open the
// relevant modal/flow. Falls back to a sensible route so they still work
// out of the box.
type QuickAction = { key: string; label: string; icon: typeof Award; to: string };

const QUICK_ACTIONS: QuickAction[] = [
  { key: "download-certificate", label: "Download Certificate", icon: Award,  to: "/student/download-certificate" },
  { key: "upload-assignment", label: "Upload Assignment", icon: Upload, to: "/student/upload-assignment" },
  // { key: "view-fee-receipt", label: "View Fee Receipt", icon: Receipt, to: "/student/payments?action=receipt" },
  // { key: "book-mentor-session", label: "Book Mentor Session", icon: Video, to: "/student/course?action=book-mentor" },
];

// Module-level store so the sidebar's scroll offset survives remounts,
// same pattern as AdminLayout's SidebarContent.
let sidebarScrollTop = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────

const SidebarContent = ({
  onNavigate,
  onQuickAction,
}: {
  onNavigate?: () => void;
  onQuickAction?: (action: QuickAction) => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (el) el.scrollTop = sidebarScrollTop;
  }, []);

  const handleScroll = () => {
    if (navRef.current) sidebarScrollTop = navRef.current.scrollTop;
  };

  const handleQuickAction = (action: QuickAction) => {
    if (onQuickAction) {
      onQuickAction(action);
    } else {
      navigate(action.to);
    }
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/student"
        className="flex items-center gap-2 rounded-lg py-3 pl-6"
        aria-label="Slate Academy Home"
        onClick={onNavigate}
      >
        <img src={logo} alt="Slate Academy" className="h-9 w-auto shrink-0 object-contain lg:h-10" />
        <div className="leading-tight">
          {/* <div className="text-sm font-semibold text-foreground">Slate Academy</div> */}
          {/* <div className="text-[11px] text-muted-foreground">Student Portal</div> */}
        </div>
      </Link>

      <nav ref={navRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="mb-5">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Main Menu
          </div>
          <div className="flex flex-col gap-0.5">
            {MAIN_MENU.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === "/student" ? location.pathname === "/student" : location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/student"}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-[#0037FF]"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Actions
          </div>
          <div className="flex flex-col gap-0.5">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  onClick={() => handleQuickAction(action)}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Icon size={16} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

const StudentLayout = ({
  children,
  title,
  subtitle,
  actions,
  onQuickAction,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onQuickAction?: (action: QuickAction) => void;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.fullName || "Student";
  const studentMeta = [user?.studentId, user?.course, user?.batch].filter(Boolean).join(" · ");
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <SidebarContent onQuickAction={onQuickAction} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-card overflow-y-auto">
            <button
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} onQuickAction={onQuickAction} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto" ref={mainScrollRef}>
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
              placeholder="Search lessons, assignments, mentors…"
              className="h-9 pl-9 bg-secondary/60 border-transparent focus-visible:bg-background"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary" aria-label="Toggle theme">
              <Moon size={17} />
            </button>
            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary" aria-label="Notifications">
              <Bell size={17} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#0037FF]" />
            </button>
            <NavLink
              to="/student/profile"
              className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Settings"
            >
              <Settings size={17} />
            </NavLink>

            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 hover:bg-secondary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-white ring-2 ring-background">
                  {initials}
                </div>
                <div className="hidden text-left leading-tight md:block">
                  <div className="text-xs font-semibold">{displayName}</div>
                  <div className="text-[10px] text-muted-foreground">{studentMeta || "—"}</div>
                </div>
                <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-lg z-50">
                  <NavLink
                    to="/student/profile"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary"
                    onClick={() => setOpen(false)}
                  >
                    <UserIcon size={16} />
                    View Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <div className="border-b border-border bg-card/40 px-4 py-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl text-gray-800 font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </div>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
};

export default StudentLayout;