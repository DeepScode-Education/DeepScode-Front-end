import { ArrowRight, CheckCircle2, Clock3, FileText, LayoutGrid, UserRound, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../admin/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

const MODULES = [
  { permission: "students.view", label: "Students", description: "View and manage student records.", to: "/admin/students", icon: Users },
  { permission: "leads.view", label: "Leads", description: "Work with leads and follow-ups.", to: "/admin/leads", icon: UserRound },
  { permission: "fees.view", label: "Fees", description: "Check fee and collection workflows.", to: "/admin/fee-collection", icon: CheckCircle2 },
  { permission: "courses.view", label: "Courses", description: "Manage courses and academic content.", to: "/admin/courses", icon: FileText },
  { permission: "live_classes.view", label: "Live Classes", description: "Access scheduled live classes.", to: "/admin/classes", icon: LayoutGrid },
  { permission: "attendance.view", label: "Attendance", description: "Review attendance records.", to: "/admin/staff", icon: Clock3 },
  { permission: "employees.view", label: "Staff", description: "View staff workspace when permitted.", to: "/admin/staff", icon: Users },
  { permission: "reports.view", label: "Reports", description: "Open available reporting tools.", to: "/admin/reports", icon: FileText },
] as const;

const StaffDashboard = () => {
  const { user } = useAuth();
  const { permissions, loading } = usePermissions();
  const availableModules = MODULES.filter((module) => permissions.has(module.permission));

  return (
    <AdminLayout
      title={`Welcome, ${user?.fullName?.split(" ")[0] ?? "there"}`}
      subtitle="Your staff workspace is ready. Only the modules assigned to your account are shown here."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</p>
          <p className="mt-2 text-lg font-semibold capitalize">{user?.role ? String(user.role).replace(/_/g, " ") : ""}</p>
          <p className="mt-1 text-xs text-muted-foreground">Access is controlled by your assigned permissions.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Available modules</p>
          <p className="mt-2 text-lg font-semibold">{loading ? "…" : availableModules.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Modules currently available in your workspace.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account</p>
          <p className="mt-2 truncate text-sm font-semibold">{user?.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">Keep your staff profile information up to date.</p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Your workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">Open a module assigned to you.</p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            Permission based
          </span>
        </div>

        {loading ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-xl border border-border bg-secondary/40" />
            ))}
          </div>
        ) : availableModules.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.permission}
                  to={module.to}
                  className="group rounded-xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={17} />
                    </span>
                    <ArrowRight size={16} className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{module.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{module.description}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
            <p className="text-sm font-medium">No modules assigned yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Ask your Super Admin to assign the permissions you need.</p>
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

export default StaffDashboard;
