

import { ReactNode, useEffect, useState, useRef, useLayoutEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays, FileText,
  Image as ImageIcon, CreditCard, MessagesSquare, BarChart3, Settings,
  Search, Bell, Sun, Moon, Menu, X, Sparkles,
  Phone, ListChecks, Megaphone, Video, Library, Award, FileBadge,
  Building2, Briefcase, Trophy, LineChart, Layout, Menu as MenuIcon,
  FormInput, Globe, Star, Mail, MessageSquare, Gift, Link2, Ticket,
  Wallet, Receipt, TrendingUp,
  LayoutPanelLeftIcon,
  HousePlus,
  GalleryVerticalEndIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";


type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" }],
  },
  {
    label : "Manage",
     items : [{   to: "/admin/staff", label: "Staff manage", icon: LayoutPanelLeftIcon, permission: "employees.view" }],
  },
  
{
  label: "CRM",
  items: [
    { to: "/admin/crm/command-center", label: "Command Center", icon: LayoutDashboard },
    { to: "/admin/leads", label: "Leads", icon: Sparkles, permission: "leads.view" },
    { to: "/admin/crm/follow-ups", label: "Follow-ups", icon: ListChecks },
    { to: "/admin/crm/call-logs", label: "Call Logs", icon: Phone },
    { to: "/admin/crm/analytics", label: "CRM Analytics", icon: BarChart3 },
    { to: "/admin/students", label: "Students", icon: Users, permission: "students.view" },
    { to: "/admin/reports", label: "Global Analytics", icon: BarChart3, permission: "reports.view" },
    // { to: "/admin/fee-collection", label: "Fee Collection", icon: CreditCard, permission: "fees.view" },
    // { to: "/admin/notifications", label: "Notifications", icon: Bell },
  ],
},
  {
    label: "Finance",
    items: [
      { to: "/admin/fee-collection", label: "Installments", icon: Wallet },
      // { to: "/admin/payments", label: "Invoices", icon: Receipt, permission: "payments.view" },
      { to: "/admin/finance/revenue", label: "Revenue Reports", icon: TrendingUp },
    ],
  },
  {
    label: "Academy",
    items: [
      { to: "/admin/classes", label: "Live Classes", icon: CalendarDays, permission: "live_classes.view" },
      { to: "/admin/academy/recorded", label: "Recorded Courses", icon: Video },
      { to: "/admin/courses", label: "Courses", icon: BookOpen, permission: "courses.view" },
      { to: "/admin/teachers", label: "Mentors", icon: GraduationCap },
      { to: "/admin/academy/knowledge-hub", label: "KnowledgeHub", icon: Library },
      { to: "/admin/academy/assignments", label: "Assignments", icon: FileBadge },
      { to: "/admin/academy/certificates", label: "Certificates", icon: Award },
      
    ],
  },

 
  {
    label: "Placements",
    items: [
        { to: "/admin/portfolio", label: "Portfolio", icon: GalleryVerticalEndIcon },
      { to: "/admin/placements/partners", label: "Hiring Partners", icon: Building2 },
      { to: "/admin/placements/students", label: "Student Placements", icon: Briefcase },
      { to: "/admin/placements/opportunities", label: "Opportunities", icon: Briefcase },
      { to: "/admin/placements/success-stories", label: "Success Stories", icon: Trophy },
      { to: "/admin/placements/analytics", label: "Placement Analytics", icon: LineChart },
    ],
  },
  {
    label: "Website",
    items: [
      {
  to: "/admin/website/home",
  label: "Home Section",
  icon: HousePlus,
},
       {
      to: "/admin/careers",
      label: "Careers",
      icon: Briefcase,
    },
      // { to: "/admin/website/navigation", label: "Navigation Menus", icon: MenuIcon },
      // { to: "/admin/website/forms", label: "Forms", icon: FormInput },
      { to: "/admin/website/seo", label: "SEO", icon: Globe },
      { to: "/admin/website/testimonials", label: "Testimonials", icon: Star },
      // { to: "/admin/cms", label: "Pages", icon: FileText },
      { to: "/admin/blog", label: "Blog", icon: FileText },
      // { to: "/admin/media", label: "Media", icon: ImageIcon },
      
    ],
  },
  {
    label: "Marketing",
    items: [
      { to: "/admin/marketing/email", label: "Email Campaigns", icon: Mail },
      { to: "/admin/marketing/whatsapp", label: "WhatsApp Campaigns", icon: MessageSquare },
      { to: "/admin/marketing/referrals", label: "Referral System", icon: Gift },
      { to: "/admin/marketing/affiliates", label: "Affiliates", icon: Link2 },
      { to: "/admin/marketing/coupons", label: "Coupons", icon: Ticket },
      { to: "/admin/marketing/ad-leads", label: "Ad Leads", icon: Megaphone, permission: "leads.view" },
    ],
  },
 
  {
    label: "Business",
    items: [
      { to: "/admin/communication", label: "Communication", icon: MessagesSquare },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

// const useTheme = () => {
//   const [theme, setTheme] = useState<"light" | "dark">(() => {
//     if (typeof window === "undefined") return "light";
//     return (localStorage.getItem("admin-theme") as "light" | "dark") || "light";
//   });
//   useEffect(() => {
//     const root = document.documentElement;
//     root.classList.toggle("dark", theme === "dark");
//     localStorage.setItem("admin-theme", theme);
//   }, [theme]);
//   return { theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) };
// };

const ROLE_WORKSPACE: Record<string, NavGroup[]> = {
  mentor: [
    {
      label: "Mentor Workspace",
      items: [
        { to: "/mentor/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
        { to: "/mentor/students", label: "Students", icon: Users, permission: "students.view" },
        { to: "/mentor/assignments", label: "Assignments", icon: FileBadge, permission: "students.view" },
        { to: "/mentor/courses", label: "Courses", icon: BookOpen, permission: "courses.view" },
        { to: "/mentor/batches", label: "Batches", icon: GraduationCap, permission: "batches.view" },
        { to: "/mentor/classes", label: "Live Classes", icon: CalendarDays, permission: "live_classes.view" },
      ],
    },
  ],
  counsellor: [
    {
      label: "Counsellor Workspace",
      items: [
        { to: "/counsellor", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
        { to: "/counsellor/leads", label: "Leads", icon: Sparkles, permission: "leads.view" },
        { to: "/counsellor/follow-ups", label: "Follow-ups", icon: ListChecks, permission: "leads.view" },
        { to: "/counsellor/call-logs", label: "Call Logs", icon: Phone, permission: "leads.view" },
        { to: "/counsellor/fee-collection", label: "Fee Collection", icon: CreditCard, permission: "fees.view" },
      ],
    },
  ],
};

// Module-level (outside the component) so the value survives even when
// AdminLayout/SidebarContent fully unmounts and remounts on every route
// change (each admin page currently wraps itself in <AdminLayout>).
let persistedSidebarScrollTop = 0;

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
  const { can, role } = usePermissions();
  const navRef = useRef<HTMLElement>(null);
  const isSuperAdmin = role === "super_admin";
  const workspace = ROLE_WORKSPACE[role || ""] || [];
  const roleOwnedRoutes = role === "mentor"
    ? new Set(["/admin", "/admin/students", "/admin/classes", "/admin/courses", "/admin/academy/assignments", "/admin/teachers"])
    : role === "counsellor"
      ? new Set(["/admin", "/admin/students", "/admin/leads", "/admin/fee-collection", "/admin/crm/follow-ups", "/admin/crm/call-logs"])
      : new Set<string>();

  const canSee = (item: NavItem) =>
    !roleOwnedRoutes.has(item.to) && (isSuperAdmin || !item.permission || can(item.permission));

  const visibleGroups = [...workspace, ...NAV]
    .map((group) => ({ ...group, items: group.items.filter(canSee) }))
    .filter((group) => group.items.length > 0);

  // Runs synchronously before the browser paints, so even on a full
  // remount the sidebar never visibly "jumps" to the top.
  useLayoutEffect(() => {
    if (navRef.current) {
      navRef.current.scrollTop = persistedSidebarScrollTop;
    }
  }, []);

  const handleSidebarScroll = () => {
    if (navRef.current) {
      persistedSidebarScrollTop = navRef.current.scrollTop;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2 px-5 py-5" onClick={onNavigate}>
        {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0037FF] text-[#0037FF]-foreground">
          <GraduationCap size={20} />
        </div> */}
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold">Slate Academy</span>
          <span className="text-[11px] text-muted-foreground">Admin Console</span>
        </div>
      </Link>

      <nav
        ref={navRef}
        onScroll={handleSidebarScroll}
        className="flex-1 overflow-y-auto px-3 pb-6"
      >
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/admin"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent text-[#0037FF]"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )
                    }
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

    
    </div>
  );
};

// AdminShell renders the sidebar + top header ONCE for the whole /admin/*
// section. Mount it above <AdminRoutes/> (in App.tsx) so it never unmounts
// when navigating between admin pages — that's what actually stops the
// sidebar from resetting its scroll position on every click.
export const AdminShell = ({ children }: { children: ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Reset ONLY the page-content area to the top on navigation — never the
  // window itself. The app's global <ScrollToTop/> calls window.scrollTo(0,0)
  // on every route change; since this shell is a fixed h-screen layout the
  // window never actually scrolls, so that call is harmless here, and the
  // sidebar (which lives in this same shell, independent of page content)
  // never moves.
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

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className="hidden h-full w-64 shrink-0 border-r border-border bg-card lg:block">
        <SidebarContent />
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
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div ref={mainScrollRef} className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
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
            <Input placeholder="Search students, courses, leads…" className="h-9 pl-9 bg-secondary/60 border-transparent focus-visible:bg-background" />
          </div>
          <div className="relative ml-auto" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 hover:bg-secondary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-white ring-2 ring-background">
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="hidden text-left leading-tight md:block">
                <div className="text-xs font-semibold">
                  {user?.fullName}
                </div>

                <div className="text-[10px] text-muted-foreground">
                  {user?.role.replace("_", " ").toUpperCase()}
                </div>
              </div>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-lg z-50">
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
        </header>

        {children}
      </div>
    </div>
  );
};

// AdminLayout keeps its EXACT same signature/usage as before
// (`<AdminLayout title="..." subtitle="...">{content}</AdminLayout>`), so
// none of the ~70 page files need to change. It now only renders the
// per-page title bar + content — the sidebar/header live in AdminShell
// above and are no longer duplicated or remounted per page.
const AdminLayout = ({ children, title, subtitle, actions }: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => {
  return (
    <>
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
    </>
  );
};

export default AdminLayout;