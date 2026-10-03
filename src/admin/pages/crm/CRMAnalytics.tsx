// import { useEffect, useState } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip, ResponsiveContainer, FunnelChart, Funnel,
//   LabelList, Cell,
// } from "recharts";
// import AdminLayout from "../../components/AdminLayout";

// const API_BASE = import.meta.env.VITE_API_BASE || "https://slateserver1.onrender.com";

// const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

// const CRMAnalytics = () => {
//   const [stats, setStats] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`${API_BASE}/api/leads/dashboard`)
//       .then((r) => r.json())
//       .then((json) => { if (json.success) setStats(json.data); })
//       .finally(() => setLoading(false));
//   }, []);

//   const funnelData = stats
//     ? [
//         { name: "Total Leads", value: stats.totalLeads, fill: "hsl(var(--primary))" },
//         { name: "Contacted", value: stats.contactedLeads, fill: "#3b82f6" },
//         { name: "Interested", value: Math.round(stats.totalLeads * 0.3), fill: "#8b5cf6" },
//         { name: "Follow-up", value: stats.followUpsPending, fill: "#f59e0b" },
//         { name: "Converted", value: stats.convertedLeads, fill: "#10b981" },
//       ]
//     : [];

//   const sourceData = [
//     { source: "Website", value: stats?.totalLeads ? Math.round(stats.totalLeads * 0.54) : 0 },
//     { source: "WhatsApp", value: stats?.totalLeads ? Math.round(stats.totalLeads * 0.18) : 0 },
//     { source: "Instagram", value: stats?.totalLeads ? Math.round(stats.totalLeads * 0.15) : 0 },
//     { source: "Referral", value: stats?.totalLeads ? Math.round(stats.totalLeads * 0.08) : 0 },
//     { source: "Other", value: stats?.totalLeads ? Math.round(stats.totalLeads * 0.05) : 0 },
//   ];

//   return (
//     <AdminLayout
//       title="CRM Analytics"
//       subtitle="Lead performance overview across all counselors."
//     >
//       {/* KPI Cards */}
//       <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
//         {[
//           { label: "Total Leads", value: stats?.totalLeads ?? "…", sub: "All time", color: "text-blue-500" },
//           { label: "Converted", value: stats?.convertedLeads ?? "…", sub: `${stats?.conversionRate ?? 0}% rate`, color: "text-emerald-500" },
//           { label: "Pending Follow-ups", value: stats?.followUpsPending ?? "…", sub: "Needs attention", color: "text-amber-500" },
//           { label: "Lost Leads", value: stats?.lostLeads ?? "…", sub: "Closed lost", color: "text-red-400" },
//         ].map((s) => (
//           <div key={s.label} className="rounded-xl border border-border bg-card p-5">
//             <div className="text-xs text-muted-foreground">{s.label}</div>
//             <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
//             <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
//           </div>
//         ))}
//       </div>

//       <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
//         {/* Conversion Funnel */}
//         <div className="rounded-xl border border-border bg-card p-5">
//           <h3 className="text-sm font-semibold mb-1">Conversion Funnel</h3>
//           <p className="text-xs text-muted-foreground mb-4">Lead → Converted</p>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 30 }}>
//                 <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
//                 <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
//                 <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={80} />
//                 <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
//                 <Bar dataKey="value" radius={[0, 6, 6, 0]}>
//                   {funnelData.map((entry, i) => (
//                     <Cell key={i} fill={entry.fill} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Lead Source */}
//         <div className="rounded-xl border border-border bg-card p-5">
//           <h3 className="text-sm font-semibold mb-1">Lead Source Performance</h3>
//           <p className="text-xs text-muted-foreground mb-4">Where leads are coming from</p>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={sourceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
//                 <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
//                 <XAxis dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
//                 <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
//                 <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
//                 <Bar dataKey="value" radius={[6, 6, 0, 0]}>
//                   {sourceData.map((_, i) => (
//                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* Status Breakdown Table */}
//       <div className="mt-6 rounded-xl border border-border bg-card">
//         <div className="border-b border-border px-5 py-4">
//           <h3 className="text-sm font-semibold">Lead Status Breakdown</h3>
//         </div>
//         <div className="divide-y divide-border">
//           {[
//             { label: "New", value: stats?.newLeads ?? 0, color: "bg-gray-400" },
//             { label: "Contacted", value: stats?.contactedLeads ?? 0, color: "bg-blue-500" },
//             { label: "Follow-up Pending", value: stats?.followUpsPending ?? 0, color: "bg-amber-500" },
//             { label: "Converted", value: stats?.convertedLeads ?? 0, color: "bg-emerald-500" },
//             { label: "Lost", value: stats?.lostLeads ?? 0, color: "bg-red-400" },
//           ].map((item) => (
//             <div key={item.label} className="flex items-center gap-4 px-5 py-3">
//               <div className={`h-2.5 w-2.5 rounded-full ${item.color} shrink-0`} />
//               <span className="text-sm flex-1">{item.label}</span>
//               <span className="text-sm font-semibold">{item.value}</span>
//               <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
//                 <div
//                   className={`h-full rounded-full ${item.color}`}
//                   style={{ width: `${stats?.totalLeads ? Math.min((item.value / stats.totalLeads) * 100, 100) : 0}%` }}
//                 />
//               </div>
//               <span className="text-xs text-muted-foreground w-10 text-right">
//                 {stats?.totalLeads ? Math.round((item.value / stats.totalLeads) * 100) : 0}%
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default CRMAnalytics;


import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import AdminLayout from "../../components/AdminLayout";

const API_BASE = import.meta.env.VITE_API_BASE || "https://slateserver1.onrender.com";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

// ── FIX: /api/leads/dashboard is behind `auth, isCounsellor` — this page
// was calling it with no headers, so it always 401'd and rendered "…" forever.
const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Backend shape from GET /api/leads/dashboard (lead.controller.js → getLeadDashboard)
interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  followUpsPending: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: string;
}

// Backend shape from GET /api/leads/analytics/counsellor (admin view — has byCounsellor)
// lead.controller.js → getCounsellorAnalytics
interface AdminAnalytics {
  overview: {
    total: number;
    converted: number;
    lost: number;
    conversionRate: string;
    followUpDueToday: number;
    overdueFollowUps: number;
    demosToday: number;
    contacted: number;
  };
  byCounsellor: {
    counsellorId: string;
    name: string;
    email: string;
    total: number;
    converted: number;
    lost: number;
    followUpDue: number;
    conversionRate: number;
  }[];
}

const CRMAnalytics = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setError(null);
      try {
        const headers = authHeaders(); // ← FIX

        const [dashRes, analyticsRes] = await Promise.all([
          fetch(`${API_BASE}/api/leads/dashboard`, { headers }),            // ← FIX (headers added)
          fetch(`${API_BASE}/api/leads/analytics/counsellor`, { headers }), // ← NEW: real backend analytics instead of fabricated %ages
        ]);

        if (dashRes.status === 401 || analyticsRes.status === 401) {
          setError("Session expired. Please log in again.");
          return;
        }

        const dash = await dashRes.json();
        const analyticsJson = await analyticsRes.json();

        if (dash.success) setStats(dash.data);
        if (analyticsJson.success) setAnalytics(analyticsJson.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── FIX: Conversion funnel now uses only real numbers from the backend.
  // The old "Interested" stage was Math.round(stats.totalLeads * 0.3) — a
  // guess, not a real count. There's no dedicated "interested" counter in
  // getLeadDashboard's response, so rather than keep showing a fabricated
  // number, that stage is dropped from the funnel until the backend exposes
  // a real interestedLeads count. Everything still shown here is real.
  const funnelData = stats
    ? [
        { name: "Total Leads", value: stats.totalLeads, fill: "hsl(var(--primary))" },
        { name: "Contacted", value: stats.contactedLeads, fill: "#3b82f6" },
        { name: "Follow-up", value: stats.followUpsPending, fill: "#f59e0b" },
        { name: "Converted", value: stats.convertedLeads, fill: "#10b981" },
      ]
    : [];

  // ── FIX: Lead Source Performance used to be 5 hardcoded percentages of
  // totalLeads (Website 54%, WhatsApp 18%, etc.) with no connection to real
  // data. The real per-source breakdown isn't returned by either endpoint
  // currently wired here (getLeadDashboard has no source breakdown, and
  // getCounsellorAnalytics breaks down by counsellor, not by source) — so
  // instead of fabricating numbers, this chart is replaced below with the
  // real "Performance by Counsellor" data the backend already computes.

  return (
    <AdminLayout
      title="CRM Analytics"
      subtitle="Lead performance overview across all counselors."
    >
      {/* FIX: surface auth/network errors instead of an endless "…" state */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Leads", value: stats?.totalLeads ?? "…", sub: "All time", color: "text-blue-500" },
          { label: "Converted", value: stats?.convertedLeads ?? "…", sub: `${stats?.conversionRate ?? 0}% rate`, color: "text-emerald-500" },
          { label: "Pending Follow-ups", value: stats?.followUpsPending ?? "…", sub: "Needs attention", color: "text-amber-500" },
          { label: "Lost Leads", value: stats?.lostLeads ?? "…", sub: "Closed lost", color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversion Funnel — real counts only now */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Conversion Funnel</h3>
          <p className="text-xs text-muted-foreground mb-4">Lead → Converted</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FIX: replaced the fabricated "Lead Source Performance" chart with
            real per-counsellor performance data from getCounsellorAnalytics
            (backend already computes this via a proper Mongo aggregation —
            see lead.controller.js's getCounsellorAnalytics). */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-1">Performance by Counsellor</h3>
          <p className="text-xs text-muted-foreground mb-4">Conversions per counsellor (real data)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.byCounsellor ?? []}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="converted" radius={[6, 6, 0, 0]}>
                  {(analytics?.byCounsellor ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {analytics && analytics.byCounsellor.length === 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              No leads assigned to a counsellor yet.
            </p>
          )}
        </div>
      </div>

      {/* Status Breakdown Table — unchanged, was already using real stats */}
      <div className="mt-6 rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">Lead Status Breakdown</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { label: "New", value: stats?.newLeads ?? 0, color: "bg-gray-400" },
            { label: "Contacted", value: stats?.contactedLeads ?? 0, color: "bg-blue-500" },
            { label: "Follow-up Pending", value: stats?.followUpsPending ?? 0, color: "bg-amber-500" },
            { label: "Converted", value: stats?.convertedLeads ?? 0, color: "bg-emerald-500" },
            { label: "Lost", value: stats?.lostLeads ?? 0, color: "bg-red-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-5 py-3">
              <div className={`h-2.5 w-2.5 rounded-full ${item.color} shrink-0`} />
              <span className="text-sm flex-1">{item.label}</span>
              <span className="text-sm font-semibold">{item.value}</span>
              <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${stats?.totalLeads ? Math.min((item.value / stats.totalLeads) * 100, 100) : 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {stats?.totalLeads ? Math.round((item.value / stats.totalLeads) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* NEW: Follow-up / demo snapshot from the real admin analytics overview
          (getCounsellorAnalytics already computes these — previously unused) */}
      {analytics && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Follow-ups Due Today", value: analytics.overview.followUpDueToday },
            { label: "Overdue Follow-ups", value: analytics.overview.overdueFollowUps },
            { label: "Demos Today", value: analytics.overview.demosToday },
            { label: "Contacted (all-time)", value: analytics.overview.contacted },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-bold mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default CRMAnalytics;