
// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import CounsellorLayout from "../../components/CounsellorLayout";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Phone, MessageCircle, Clock, Flame, AlertTriangle, ChevronRight, Target } from "lucide-react";
// import { cn } from "@/lib/utils";

// const API_BASE = import.meta.env.VITE_API_BASE || "https://slateserver1.onrender.com";

// // Reads the JWT from localStorage and includes it in requests
// const authHeaders = () => {
//   const token = localStorage.getItem("token");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// interface LeadRow {
//   email: string;
//   _id: string;
//   fullName: string;
//   mobileNumber: string;
//   course: string | { _id: string; title: string; slug?: string; category?: string };
//   leadStatus: string;
//   nextFollowUpDate: string | null;
// }

// const getCourseTitle = (course: LeadRow["course"] | null | undefined) =>
//   typeof course === "string" ? course : course?.title || "—";

// interface DashStats {
//   totalLeads: number;
//   newLeads: number;
//   contactedLeads: number;
//   followUpsPending: number;
//   convertedLeads: number;
//   lostLeads: number;
//   conversionRate: string;
// }

// const CounsellorDashboard = () => {
//   const navigate = useNavigate();
//   const [overdueLeads, setOverdueLeads] = useState<LeadRow[]>([]);
//   const [todayLeads,   setTodayLeads]   = useState<LeadRow[]>([]);
//   const [hotLeads,     setHotLeads]     = useState<LeadRow[]>([]);
//   const [stats,        setStats]        = useState<DashStats | null>(null);
//   const [loading,      setLoading]      = useState(true);

//   const hour     = new Date().getHours();
//   const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
//   const today    = new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const headers = authHeaders();
//         const [overdueRes, todayRes, dashRes, hotRes] = await Promise.all([
//           fetch(`${API_BASE}/api/leads/followups/all?filter=overdue`, { headers }),
//           fetch(`${API_BASE}/api/leads/followups/all?filter=today`,   { headers }),
//           fetch(`${API_BASE}/api/leads/dashboard`,                    { headers }),
//           fetch(`${API_BASE}/api/leads?status=interested&limit=4`,    { headers }),
//         ]);
//         const [overdue, todayData, dash, hot] = await Promise.all([
//           overdueRes.json(), todayRes.json(), dashRes.json(), hotRes.json(),
//         ]);

//         // FIX: exclude lost/converted leads from Overdue — they are terminal
//         // and should never show as "overdue" once closed.
//         if (overdue.success) {
//           setOverdueLeads(
//             overdue.data.filter(
//               (lead: LeadRow) =>
//                 lead.leadStatus?.toLowerCase() !== "lost" &&
//                 lead.leadStatus?.toLowerCase() !== "converted"
//             )
//           );
//         }

//         if (todayData.success) setTodayLeads(todayData.data);
//         if (dash.success)      setStats(dash.data);
//         if (hot.success)       setHotLeads(hot.data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAll();
//   }, []);

//   const getInitials    = (name: string) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
//   const getDaysOverdue = (date: string) => Math.max(1, Math.ceil((Date.now() - new Date(date).getTime()) / 86400000));

//   const kpis = [
//     { label: "My Leads",         value: stats?.totalLeads       ?? "…", sub: "Assigned to you",    color: "text-blue-500" },
//     { label: "Today's Follow-ups",value: todayLeads.length,              sub: `${overdueLeads.length} overdue`, color: "text-amber-500" },
//     { label: "Converted",        value: stats?.convertedLeads   ?? "…", sub: `${stats?.conversionRate ?? 0}% rate`, color: "text-emerald-500" },
//     { label: "Pending",          value: stats?.followUpsPending ?? "…", sub: "Need action",         color: "text-orange-500" },
//     { label: "New",              value: stats?.newLeads         ?? "…", sub: "Uncontacted",         color: "text-purple-500" },
//     { label: "Lost",             value: stats?.lostLeads        ?? "…", sub: "This month",          color: "text-red-400" },
//   ];

//   return (
//     <CounsellorLayout
//       title={`${greeting} 👋`}
//       subtitle={`Your pipeline at a glance · ${today}`}
//       actions={
//         <Button asChild className="bg-[#0037FF] text-white hover:bg-[#0037FF]/90">
//           <Link to="/counsellor/leads">My leads</Link>
//         </Button>
//       }
//     >
//       {/* KPI grid */}
//       <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
//         {kpis.map((k) => (
//           <div key={k.label} className="rounded-xl border border-border bg-card p-4">
//             <div className="text-[10px] font-semibold uppercase text-muted-foreground">{k.label}</div>
//             <div className={`mt-2 text-2xl font-bold tracking-tight ${k.color}`}>{k.value}</div>
//             <div className="text-[11px] text-muted-foreground">{k.sub}</div>
//           </div>
//         ))}
//       </div>

//       <div className="mt-6 grid grid-cols-12 gap-6">
//         {/* Today's follow-ups */}
//         <div className="col-span-12 lg:col-span-8 space-y-6">
//           <div className="rounded-xl border border-border bg-card">
//             <div className="flex items-center justify-between border-b border-border p-4">
//               <div className="flex items-center gap-2">
//                 <Clock size={16} className="text-[#0037FF]" />
//                 <h3 className="text-sm font-bold">Today's Follow-ups</h3>
//                 <Badge variant="secondary" className="text-[10px]">{todayLeads.length}</Badge>
//               </div>
//               <Link to="/counsellor/follow-ups" className="flex items-center gap-1 text-xs font-semibold text-[#0037FF] hover:underline">
//                 View all <ChevronRight size={12} />
//               </Link>
//             </div>
//             {loading ? (
//               <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
//             ) : (
//               <ul className="divide-y divide-border">
//                 {todayLeads.map((l) => (
//                   <li key={l._id} className="flex items-center gap-3 p-4">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0037FF]/10 text-sm font-bold text-[#0037FF]">
//                       {getInitials(l.fullName)}
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <Link to={`/counsellor/leads/${l._id}`} className="block text-sm font-semibold hover:text-[#0037FF]">
//                         {l.fullName}
//                       </Link>
//                       <div className="truncate text-xs text-muted-foreground">{l.email}</div>
//                     </div>
//                     {l.nextFollowUpDate && (
//                       <span className="hidden text-xs text-muted-foreground md:inline">
//                         {new Date(l.nextFollowUpDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
//                       </span>
//                     )}
//                     <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => navigate(`/counsellor/leads/${l._id}`)}>
//                       <Phone size={14} />
//                     </Button>
//                     <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => navigate(`/counsellor/leads/${l._id}`)}>
//                       <MessageCircle size={14} />
//                     </Button>
//                     <Button asChild size="sm" className="bg-[#0037FF] text-[#0037FF]-foreground hover:bg-[#0037FF]/90">
//                       <Link to={`/counsellor/leads/${l._id}`}>Open</Link>
//                     </Button>
//                   </li>
//                 ))}
//                 {todayLeads.length === 0 && (
//                   <li className="p-6 text-center text-sm text-muted-foreground">All clear for today 🎉</li>
//                 )}
//               </ul>
//             )}
//           </div>

//           {/* Overdue */}
//           <div className="rounded-xl border border-border bg-card">
//             <div className="flex items-center gap-2 border-b border-border p-4">
//               <AlertTriangle size={16} className="text-red-500" />
//               <h3 className="text-sm font-bold">Overdue Follow-ups</h3>
//               <Badge className="bg-red-500 text-white border-0 text-[10px]">{overdueLeads.length}</Badge>
//             </div>
//             <ul className="divide-y divide-border">
//               {overdueLeads.map((l) => (
//                 <li key={l._id} className="flex items-center gap-3 p-4">
//                   <div className="h-2 w-2 rounded-full bg-red-500" />
//                   <Link to={`/counsellor/leads/${l._id}`} className="text-sm font-semibold hover:text-[#0037FF]">
//                     {l.fullName}
//                   </Link>
//                   <span className="text-xs text-muted-foreground">{getCourseTitle(l.email)}</span>
//                   <span className="ml-auto text-xs font-semibold text-red-500">
//                     {l.nextFollowUpDate ? `${getDaysOverdue(l.nextFollowUpDate)}d overdue` : "—"}
//                   </span>
//                 </li>
//               ))}
//               {overdueLeads.length === 0 && (
//                 <li className="p-6 text-center text-sm text-muted-foreground">Nothing overdue.</li>
//               )}
//             </ul>
//           </div>
//         </div>

//         {/* Right column */}
//         <div className="col-span-12 lg:col-span-4 space-y-6">
//           {/* Hot leads */}
//           <div className="rounded-xl border border-border bg-card p-4">
//             <div className="flex items-center gap-2">
//               <Flame size={16} className="text-orange-500" />
//               <h3 className="text-sm font-bold">Hot Leads</h3>
//             </div>
//             <ul className="mt-3 space-y-2">
//               {hotLeads.map((l) => (
//                 <li key={l._id}>
//                   <Link
//                     to={`/counsellor/leads/${l._id}`}
//                     className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-primary/50"
//                   >
//                     <div className="min-w-0">
//                       <div className="truncate text-sm font-semibold">{l.fullName}</div>
//                       <div className="truncate text-[11px] text-muted-foreground">{getCourseTitle(l.course)}</div>
//                     </div>
//                     <span className="rounded-md bg-[#0037FF]/10 px-2 py-1 text-[11px] font-bold capitalize text-[#0037FF]">
//                       {l.leadStatus}
//                     </span>
//                   </Link>
//                 </li>
//               ))}
//               {hotLeads.length === 0 && (
//                 <li className="py-6 text-center text-sm text-muted-foreground">No interested leads</li>
//               )}
//             </ul>
//           </div>

//           {/* Pipeline */}
//           <div className="rounded-xl border border-border bg-card p-4">
//             <div className="flex items-center gap-2">
//               <Target size={16} className="text-[#0037FF]" />
//               <h3 className="text-sm font-bold">My Pipeline</h3>
//             </div>
//             <div className="mt-3 space-y-2 text-xs">
//               {[
//                 { s: "New",       v: stats?.newLeads         ?? 0 },
//                 { s: "Contacted", v: stats?.contactedLeads   ?? 0 },
//                 { s: "Follow-up", v: stats?.followUpsPending ?? 0 },
//                 { s: "Converted", v: stats?.convertedLeads   ?? 0 },
//                 { s: "Lost",      v: stats?.lostLeads        ?? 0 },
//               ].map((r) => {
//                 const total = stats?.totalLeads || 1;
//                 const pct   = Math.min((r.v / total) * 100, 100);
//                 return (
//                   <div key={r.s}>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">{r.s}</span>
//                       <span className="font-semibold">{r.v}</span>
//                     </div>
//                     <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
//                       <div className="h-full rounded-full bg-[#0037FF]" style={{ width: `${pct}%` }} />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </CounsellorLayout>
//   );
// };

// export default CounsellorDashboard;







import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CounsellorLayout from "../../components/CounsellorLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Clock, Flame, AlertTriangle, ChevronRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE || "https://slateserver1.onrender.com";

// Reads the JWT from localStorage and includes it in requests
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface LeadRow {
  email: string;
  _id: string;
  fullName: string;
  mobileNumber: string;
  course: string | { _id: string; title: string; slug?: string; category?: string };
  leadStatus: string;
  nextFollowUpDate: string | null;
}

const getCourseTitle = (course: LeadRow["course"] | null | undefined) =>
  typeof course === "string" ? course : course?.title || "—";

// A lead is "closed" once it's lost or converted — closed leads should
// never show up in Today's Follow-ups or Overdue Follow-ups, since those
// lists are meant to drive action on leads still in play.
const isClosedStatus = (status: string | null | undefined) => {
  const s = status?.toLowerCase();
  return s === "lost" || s === "converted";
};

interface DashStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  followUpsPending: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: string;
}

const CounsellorDashboard = () => {
  const navigate = useNavigate();
  const [overdueLeads, setOverdueLeads] = useState<LeadRow[]>([]);
  const [todayLeads,   setTodayLeads]   = useState<LeadRow[]>([]);
  const [hotLeads,     setHotLeads]     = useState<LeadRow[]>([]);
  const [stats,        setStats]        = useState<DashStats | null>(null);
  const [loading,      setLoading]      = useState(true);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const today    = new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = authHeaders();
        const [overdueRes, todayRes, dashRes, hotRes] = await Promise.all([
          fetch(`${API_BASE}/api/leads/followups/all?filter=overdue`, { headers }),
          fetch(`${API_BASE}/api/leads/followups/all?filter=today`,   { headers }),
          fetch(`${API_BASE}/api/leads/dashboard`,                    { headers }),
          fetch(`${API_BASE}/api/leads?status=interested&limit=4`,    { headers }),
        ]);
        const [overdue, todayData, dash, hot] = await Promise.all([
          overdueRes.json(), todayRes.json(), dashRes.json(), hotRes.json(),
        ]);

        // Exclude lost/converted leads from Overdue — they are terminal
        // and should never show as "overdue" once closed.
        if (overdue.success) {
          setOverdueLeads(overdue.data.filter((lead: LeadRow) => !isClosedStatus(lead.leadStatus)));
        }

        // Same exclusion for Today's Follow-ups — a closed lead doesn't
        // need a follow-up anymore, even if one was scheduled for today.
        if (todayData.success) {
          setTodayLeads(todayData.data.filter((lead: LeadRow) => !isClosedStatus(lead.leadStatus)));
        }

        if (dash.success) setStats(dash.data);
        if (hot.success)  setHotLeads(hot.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getInitials    = (name: string) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const getDaysOverdue = (date: string) => Math.max(1, Math.ceil((Date.now() - new Date(date).getTime()) / 86400000));

  const kpis = [
    { label: "My Leads",         value: stats?.totalLeads       ?? "…", sub: "Assigned to you",    color: "text-blue-500" },
    { label: "Today's Follow-ups",value: todayLeads.length,              sub: `${overdueLeads.length} overdue`, color: "text-amber-500" },
    { label: "Converted",        value: stats?.convertedLeads   ?? "…", sub: `${stats?.conversionRate ?? 0}% rate`, color: "text-emerald-500" },
    { label: "Pending",          value: stats?.followUpsPending ?? "…", sub: "Need action",         color: "text-orange-500" },
    { label: "New",              value: stats?.newLeads         ?? "…", sub: "Uncontacted",         color: "text-purple-500" },
    { label: "Lost",             value: stats?.lostLeads        ?? "…", sub: "This month",          color: "text-red-400" },
  ];

  return (
    <CounsellorLayout
      title={`${greeting} 👋`}
      subtitle={`Your pipeline at a glance · ${today}`}
      actions={
        <Button asChild className="bg-[#0037FF] text-white hover:bg-[#0037FF]/90">
          <Link to="/counsellor/leads">My leads</Link>
        </Button>
      }
    >
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <div className="text-[10px] font-semibold uppercase text-muted-foreground">{k.label}</div>
            <div className={`mt-2 text-2xl font-bold tracking-tight ${k.color}`}>{k.value}</div>
            <div className="text-[11px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* Today's follow-ups */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#0037FF]" />
                <h3 className="text-sm font-bold">Today's Follow-ups</h3>
                <Badge variant="secondary" className="text-[10px]">{todayLeads.length}</Badge>
              </div>
              <Link to="/counsellor/follow-ups" className="flex items-center gap-1 text-xs font-semibold text-[#0037FF] hover:underline">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <ul className="divide-y divide-border">
                {todayLeads.map((l) => (
                  <li key={l._id} className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0037FF]/10 text-sm font-bold text-[#0037FF]">
                      {getInitials(l.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/counsellor/leads/${l._id}`} className="block text-sm font-semibold hover:text-[#0037FF]">
                        {l.fullName}
                      </Link>
                      <div className="truncate text-xs text-muted-foreground">{l.email}</div>
                    </div>
                    {l.nextFollowUpDate && (
                      <span className="hidden text-xs text-muted-foreground md:inline">
                        {new Date(l.nextFollowUpDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => navigate(`/counsellor/leads/${l._id}`)}>
                      <Phone size={14} />
                    </Button>
                    <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => navigate(`/counsellor/leads/${l._id}`)}>
                      <MessageCircle size={14} />
                    </Button>
                    <Button asChild size="sm" className="bg-[#0037FF] text-[#0037FF]-foreground hover:bg-[#0037FF]/90">
                      <Link to={`/counsellor/leads/${l._id}`}>Open</Link>
                    </Button>
                  </li>
                ))}
                {todayLeads.length === 0 && (
                  <li className="p-6 text-center text-sm text-muted-foreground">All clear for today 🎉</li>
                )}
              </ul>
            )}
          </div>

          {/* Overdue */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="text-sm font-bold">Overdue Follow-ups</h3>
              <Badge className="bg-red-500 text-white border-0 text-[10px]">{overdueLeads.length}</Badge>
            </div>
            <ul className="divide-y divide-border">
              {overdueLeads.map((l) => (
                <li key={l._id} className="flex items-center gap-3 p-4">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <Link to={`/counsellor/leads/${l._id}`} className="text-sm font-semibold hover:text-[#0037FF]">
                    {l.fullName}
                  </Link>
                  <span className="text-xs text-muted-foreground">{getCourseTitle(l.email)}</span>
                  <span className="ml-auto text-xs font-semibold text-red-500">
                    {l.nextFollowUpDate ? `${getDaysOverdue(l.nextFollowUpDate)}d overdue` : "—"}
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
          {/* Hot leads */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-500" />
              <h3 className="text-sm font-bold">Hot Leads</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {hotLeads.map((l) => (
                <li key={l._id}>
                  <Link
                    to={`/counsellor/leads/${l._id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-primary/50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{l.fullName}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{getCourseTitle(l.course)}</div>
                    </div>
                    <span className="rounded-md bg-[#0037FF]/10 px-2 py-1 text-[11px] font-bold capitalize text-[#0037FF]">
                      {l.leadStatus}
                    </span>
                  </Link>
                </li>
              ))}
              {hotLeads.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">No interested leads</li>
              )}
            </ul>
          </div>

          {/* Pipeline */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-[#0037FF]" />
              <h3 className="text-sm font-bold">My Pipeline</h3>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {[
                { s: "New",       v: stats?.newLeads         ?? 0 },
                { s: "Contacted", v: stats?.contactedLeads   ?? 0 },
                { s: "Follow-up", v: stats?.followUpsPending ?? 0 },
                { s: "Converted", v: stats?.convertedLeads   ?? 0 },
                { s: "Lost",      v: stats?.lostLeads        ?? 0 },
              ].map((r) => {
                const total = stats?.totalLeads || 1;
                const pct   = Math.min((r.v / total) * 100, 100);
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
        </div>
      </div>
    </CounsellorLayout>
  );
};

export default CounsellorDashboard;