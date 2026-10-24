
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/admin/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  MessageCircle,
  Clock,
  Flame,
  Sparkles,
  Target,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE || "https://deepscode-backend-end.onrender.com";

// ── FIX: this page hits auth-protected endpoints (isCounsellor middleware,
// which allows counsellor/admin/super_admin) but was sending zero headers,
// so every request came back 401 and the page silently stayed empty.
// Same helper pattern already used correctly in CounsellorDashboard.tsx.
const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const toneMap: Record<string, string> = {
  red: "crm-tone-red",
  orange: "crm-tone-orange",
  blue: "crm-tone-blue",
  green: "crm-tone-green",
};

interface LeadRow {
  email: string;
  _id: string;
  fullName: string;
  mobileNumber: string;
  course: string;
  leadStatus: string;
  nextFollowUpDate: string | null;
}

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  followUpsPending: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: string;
}

const CommandCenter = () => {
  const navigate = useNavigate();
  const [overdueLeads, setOverdueLeads] = useState<LeadRow[]>([]);
  const [todayLeads, setTodayLeads] = useState<LeadRow[]>([]);
  const [hotLeads, setHotLeads] = useState<LeadRow[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchAll = async () => {
      setError(null);
      try {
        const headers = authHeaders(); // ← FIX

        const [overdueRes, todayRes, dashRes, hotRes] = await Promise.all([
          fetch(`${API_BASE}/api/leads/followups/all?filter=overdue`, { headers }), // ← FIX
          fetch(`${API_BASE}/api/leads/followups/all?filter=today`, { headers }),   // ← FIX
          fetch(`${API_BASE}/api/leads/dashboard`, { headers }),                    // ← FIX
          fetch(`${API_BASE}/api/leads?status=interested&limit=4`, { headers }),    // ← FIX
        ]);

        // If the token is missing/expired, surface it instead of failing silently
        if (
          overdueRes.status === 401 ||
          todayRes.status === 401 ||
          dashRes.status === 401 ||
          hotRes.status === 401
        ) {
          setError("Session expired. Please log in again.");
          return;
        }

        const [overdue, todayData, dash, hot] = await Promise.all([
          overdueRes.json(),
          todayRes.json(),
          dashRes.json(),
          hotRes.json(),
        ]);

        // if (overdue.success) setOverdueLeads(overdue.data);
        if (overdue.success) {
  setOverdueLeads(
    overdue.data.filter(
      (lead: LeadRow) =>
        lead.leadStatus !== "lost" &&
        lead.leadStatus !== "converted"
    )
  );
}
        if (todayData.success) setTodayLeads(todayData.data);
        if (dash.success) setStats(dash.data);
        if (hot.success) setHotLeads(hot.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getDaysOverdue = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    return Math.max(1, Math.ceil(diff / 86400000));
  };

  const formatFollowUpDate = (value: string | null) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // KPI cards — built from /api/leads/dashboard
  const kpis = [
    { label: "Active Leads", value: stats?.totalLeads ?? "…", target: "Total pipeline", tone: "blue" },
    { label: "Today's Follow-ups", value: todayLeads.length, target: `${overdueLeads.length} overdue`, tone: "orange" },
    { label: "Converted", value: stats?.convertedLeads ?? "…", target: `${stats?.conversionRate ?? 0}% rate`, tone: "green" },
    { label: "Follow-up Pending", value: stats?.followUpsPending ?? "…", target: "Needs action", tone: "blue" },
    { label: "New Leads", value: stats?.newLeads ?? "…", target: "Unworked", tone: "green" },
    { label: "Lost", value: stats?.lostLeads ?? "…", target: "This month", tone: "red" },
  ];

  // Smart reminders derived from real today/overdue data instead of static copy
  const smartReminders = [
    ...todayLeads.slice(0, 2).map((l) => ({
      text: `${l.fullName} — ${l.course} follow-up today`,
      tone: "primary" as const,
    })),
    ...overdueLeads.slice(0, 1).map((l) => ({
      text: `${l.fullName} — missed follow-up`,
      tone: "destructive" as const,
    })),
  ];

  return (
    <div className="crm-scope">
      <AdminLayout
        title={`${greeting} 👋`}
        subtitle={`Here's your day at a glance · ${today}`}
        actions={
          <Button asChild className="bg-[#0037FF] text-white hover:bg-[#0037FF]/90">
            <Link to="/admin/leads">Open pipeline</Link>
          </Button>
        }
      >
        {/* FIX: surface auth/network errors instead of an endless empty dashboard */}
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border border-border bg-card p-4">
              <div
                className={cn(
                  "inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                  toneMap[k.tone]
                )}
              >
                {k.label}
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight">{k.value}</div>
              <div className="text-[11px] text-muted-foreground">{k.target}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6">
          {/* Today's follow-ups */}
          <div className="col-span-12 lg:col-span-8">
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#0037FF]" />
                  <h3 className="text-sm font-bold">Today's Follow-ups</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {todayLeads.length}
                  </Badge>
                </div>
                <Link
                  to="/admin/crm/follow-ups"
                  className="flex items-center gap-1 text-xs font-semibold text-[#0037FF] hover:underline"
                >
                  View all <ChevronRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
              ) : (
                <ul className="divide-y divide-border">
                  {todayLeads.map((l) => (
                    <li key={l._id} className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0037FF]/10 text-sm font-bold text-[#0037FF]">
                        {getInitials(l.fullName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/admin/leads/${l._id}`}
                          className="block text-sm font-semibold hover:text-[#0037FF]"
                        >
                          {l.fullName}
                        </Link>
                        <div className="truncate text-xs text-muted-foreground">{l.email}</div>
                      </div>
                      <span
                        className={cn(
                          "hidden rounded-md px-2 py-1 text-[10px] font-bold uppercase md:inline",
                          l.leadStatus === "follow-up" ? "crm-tone-orange" : "crm-tone-blue"
                        )}
                      >
                        {l.leadStatus}
                      </span>
                      {l.nextFollowUpDate && (
                        <span className="hidden text-xs text-muted-foreground md:inline">
                          {formatFollowUpDate(l.nextFollowUpDate)}
                        </span>
                      )}
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9"
                        onClick={() => navigate(`/admin/leads/${l._id}`)}
                      >
                        <Phone size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9"
                        onClick={() => navigate(`/admin/leads/${l._id}`)}
                      >
                        <MessageCircle size={14} />
                      </Button>
                      <Button asChild size="sm" className="bg-[#0037FF] text-white hover:bg-[#0037FF]/90">
                        <Link to={`/admin/leads/${l._id}`}>Open</Link>
                      </Button>
                    </li>
                  ))}
                  {todayLeads.length === 0 && (
                    <li className="p-6 text-center text-sm text-muted-foreground">
                      All clear for today 🎉
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Overdue */}
            <div className="mt-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border p-4">
                <AlertTriangle size={16} className="crm-tone-red rounded p-0.5" />
                <h3 className="text-sm font-bold">Overdue Follow-ups</h3>
                <Badge className="crm-tone-red text-white border-0 text-[10px]">{overdueLeads.length}</Badge>
              </div>
              <ul className="divide-y divide-border">
                {overdueLeads.map((l) => (
                  <li key={l._id} className="flex items-center gap-3 p-4">
                    <div className="h-2 w-2 rounded-full" style={{ background: "hsl(0 84% 55%)" }} />
                    <Link to={`/admin/leads/${l._id}`} className="text-sm font-semibold ">
                      {l.fullName}
                    </Link>
                    <span className="text-xs text-muted-foreground">{l.email}</span>
                    <span className="ml-auto text-xs font-semibold text-destructive">
                      {l.nextFollowUpDate
                        ? `${getDaysOverdue(l.nextFollowUpDate)}d overdue (${formatFollowUpDate(l.nextFollowUpDate)})`
                        : "—"}
                    </span>
                  </li>
                ))}
                {overdueLeads.length === 0 && (
                  <li className="p-6 text-center text-sm text-muted-foreground">Nothing overdue.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Hot Leads */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Flame size={16} className="crm-tone-orange rounded p-0.5" />
                <h3 className="text-sm font-bold">Hot Leads</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {hotLeads.map((l) => (
                  <li key={l._id}>
                    <Link
                      to={`/admin/leads/${l._id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-primary/50"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{l.fullName}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{l.course}</div>
                      </div>
                      <span className="rounded-md bg-[#0037FF]/10 px-2 py-1 text-[11px] font-bold capitalize text-[#0037FF]">
                        {l.leadStatus}
                      </span>
                    </Link>
                  </li>
                ))}
                {hotLeads.length === 0 && (
                  <li className="py-6 text-center text-sm text-muted-foreground">
                    No interested leads right now
                  </li>
                )}
              </ul>
            </div>

            {/* Lead Pipeline (replaces static Admission Funnel with real stage counts) */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[#0037FF]" />
                <h3 className="text-sm font-bold">Lead Pipeline</h3>
              </div>
              <div className="mt-3 space-y-2 text-xs">

                
                {[ 

 { s: "New", v: stats?.newLeads ?? 0 },
                  { s: "Contacted", v: stats?.contactedLeads ?? 0 },
                  { s: "Follow-up", v: stats?.followUpsPending ?? 0 },
                  { s: "Converted", v: stats?.convertedLeads ?? 0 },
                  { s: "Lost", v: stats?.lostLeads ?? 0 },


                ].map((r) => {
                  const total = stats?.totalLeads || 1;
                  const pct = Math.min((r.v / total) * 100, 100);
                  return (
                    <div key={r.s}>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{r.s}</span>
                        <span className="font-semibold">{r.v}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-[#0037FF]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Reminders — generated from real today/overdue leads */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#0037FF]" />
                <h3 className="text-sm font-bold">Smart Reminders</h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs">
                {smartReminders.length === 0 ? (
                  <li className="text-muted-foreground">No reminders right now</li>
                ) : (
                  smartReminders.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-1 h-1.5 w-1.5 rounded-full",
                          r.tone === "destructive" ? "bg-destructive" : "bg-[#0037FF]"
                        )}
                      />
                      <span>{r.text}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};

export default CommandCenter;