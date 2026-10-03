import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Users,
  GraduationCap,
  IndianRupee,
  Clock,
  ShieldCheck,
} from "lucide-react";

import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import { adminApi, type AdminDashboardStats } from "@/integrations/client";

// Super Admin ke liye complete analytics dashboard
const DashboardLiveSections = lazy(
  () => import("../components/dashboard/DashboardLiveSections")
);

const Dashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalStudents: 0,
    totalAdmins: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);

  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  const analyticsRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------------------------------------------------------
  // Super Admin dashboard stats
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const data = await adminApi.getDashboard();

        if (!cancelled) {
          setStats(data);
        }
      } catch (error) {
        console.error("Super Admin dashboard stats error:", error);
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Lazy load analytics when user approaches the analytics section
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const node = analyticsRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          setShouldLoadAnalytics(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Super Admin stat cards
  // ---------------------------------------------------------------------------

  const statCards = [
    {
      label: "Total Students",
      value: statsLoading ? "..." : String(stats.totalStudents),
      icon: <Users size={16} />,
    },
    {
      label: "Total Courses",
      value: statsLoading ? "..." : String(stats.totalCourses),
      icon: <BookOpen size={16} />,
    },
    {
      label: "Total Enrollments",
      value: statsLoading ? "..." : String(stats.totalEnrollments),
      icon: <GraduationCap size={16} />,
    },
    {
      label: "Total Revenue",
      value: statsLoading
        ? "..."
        : `₹${(stats.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      icon: <IndianRupee size={16} />,
    },
    {
      label: "Pending Approvals",
      value: statsLoading ? "..." : String(stats.pendingApprovals),
      icon: <Clock size={16} />,
      highlight: (stats.pendingApprovals ?? 0) > 0,
    },
    {
      label: "Total Admins",
      value: statsLoading ? "..." : String(stats.totalAdmins),
      icon: <ShieldCheck size={16} />,
    },
  ];

  return (
    <AdminLayout
      title="Super Admin Dashboard"
      subtitle="Overview of Slate Academy — students, revenue, leads, courses and activity."
    >
      {/* ------------------------------------------------------------------ */}
      {/* Top Stats                                                          */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Complete Analytics                                                  */}
      {/* ------------------------------------------------------------------ */}

      <div ref={analyticsRef} className="mt-6">
        {shouldLoadAnalytics ? (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="h-[24rem] animate-pulse rounded-xl border border-border bg-card/80" />
                <div className="h-[24rem] animate-pulse rounded-xl border border-border bg-card/80" />
                <div className="h-[24rem] animate-pulse rounded-xl border border-border bg-card/80" />
              </div>
            }
          >
            {/* IMPORTANT:
                Ye wahi existing component hai jisme
                Revenue chart,
                Conversion Funnel,
                Lead Source Analytics,
                Course Performance,
                Payments,
                Leads,
                Activity etc. hain.
            */}
            <DashboardLiveSections />
          </Suspense>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-[24rem] rounded-xl border border-border bg-card/70" />
            <div className="h-[24rem] rounded-xl border border-border bg-card/70" />
            <div className="h-[24rem] rounded-xl border border-border bg-card/70" />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;