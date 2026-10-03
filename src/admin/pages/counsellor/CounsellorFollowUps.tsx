
// import { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { Eye, AlertTriangle, Clock, Calendar, CheckCircle } from "lucide-react";
// import CounsellorLayout from "../../components/CounsellorLayout";
// import DataTable, { StatusBadge } from "../../components/DataTable";
// import { Button } from "@/components/ui/button";

// const API_BASE = import.meta.env.VITE_API_BASE || "https://slateserver1.onrender.com";

// const authHeaders = (): HeadersInit => {
//   const token = localStorage.getItem("token");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// // ── Statuses to exclude from Follow-ups ───────────────────────────────────────
// // Add any additional terminal/closed statuses here as needed
// const EXCLUDED_STATUSES = new Set([
//   "Lost",
//   "lost",
//   "LOST",
//   "Closed Lost",
//   "closed lost",
// ]);

// // ── Date helpers ──────────────────────────────────────────────────────────────

// const toDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// type DueTier = "overdue" | "yesterday" | "today" | "tomorrow" | "upcoming";

// function getDueTier(dateStr: string | null | undefined): DueTier {
//   if (!dateStr) return "upcoming";
//   const due = toDay(new Date(dateStr));
//   const now = toDay(new Date());
//   const diff = Math.round((due.getTime() - now.getTime()) / 86_400_000);
//   if (diff < -1) return "overdue";
//   if (diff === -1) return "yesterday";
//   if (diff === 0) return "today";
//   if (diff === 1) return "tomorrow";
//   return "upcoming";
// }

// const TIER_ORDER: Record<DueTier, number> = {
//   overdue: 0, yesterday: 1, today: 2, tomorrow: 3, upcoming: 4,
// };

// const TIER_ROW_STYLE: Record<DueTier, React.CSSProperties> = {
//   overdue:  { backgroundColor: "#FEF2F2", borderLeft: "3px solid #EF4444" },
//   yesterday:{ backgroundColor: "#FEFCE8", borderLeft: "3px solid #EAB308" },
//   today:    { backgroundColor: "#FFF7ED", borderLeft: "3px solid #F97316" },
//   tomorrow: { backgroundColor: "#F0FDF4", borderLeft: "3px solid #22C55E" },
//   upcoming: {},
// };

// const TIER_PILL: Record<DueTier, { label: string; style: React.CSSProperties } | null> = {
//   overdue:  { label: "Overdue",   style: { background: "#EF4444", color: "#fff" } },
//   yesterday:{ label: "Yesterday", style: { background: "#EAB308", color: "#fff" } },
//   today:    { label: "Today",     style: { background: "#F97316", color: "#fff" } },
//   tomorrow: { label: "Tomorrow",  style: { background: "#22C55E", color: "#fff" } },
//   upcoming: null,
// };

// // ── Alert banners ─────────────────────────────────────────────────────────────

// const ALERT_CONFIG: Record<
//   Exclude<DueTier, "upcoming">,
//   { icon: React.ReactNode; msg: (n: number) => string; style: React.CSSProperties; closeColor: string }
// > = {
//   overdue: {
//     icon: <AlertTriangle size={14} />,
//     msg: (n) => `${n} follow-up${n > 1 ? "s are" : " is"} overdue — contact immediately.`,
//     style: { background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" },
//     closeColor: "#B91C1C",
//   },
//   yesterday: {
//     icon: <Clock size={14} />,
//     msg: (n) => `${n} follow-up${n > 1 ? "s were" : " was"} due yesterday.`,
//     style: { background: "#FEFCE8", border: "1px solid #FDE047", color: "#854D0E" },
//     closeColor: "#854D0E",
//   },
//   today: {
//     icon: <Calendar size={14} />,
//     msg: (n) => `${n} follow-up${n > 1 ? "s are" : " is"} due today.`,
//     style: { background: "#FFF7ED", border: "1px solid #FED7AA", color: "#C2410C" },
//     closeColor: "#C2410C",
//   },
//   tomorrow: {
//     icon: <CheckCircle size={14} />,
//     msg: (n) => `${n} follow-up${n > 1 ? "s are" : " is"} due tomorrow — prepare early.`,
//     style: { background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534" },
//     closeColor: "#166534",
//   },
// };

// const AlertBanners = ({ leads }: { leads: any[] }) => {
//   const [dismissed, setDismissed] = useState<Set<DueTier>>(new Set());

//   const counts = useMemo(() => {
//     const c: Partial<Record<DueTier, number>> = {};
//     for (const l of leads) {
//       const tier = getDueTier(l.nextFollowUpDate);
//       if (tier !== "upcoming") c[tier] = (c[tier] ?? 0) + 1;
//     }
//     return c;
//   }, [leads]);

//   const visible = (["overdue", "yesterday", "today", "tomorrow"] as const).filter(
//     (tier) => counts[tier] && !dismissed.has(tier)
//   );

//   if (visible.length === 0) return null;

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
//       {visible.map((tier) => {
//         const cfg = ALERT_CONFIG[tier];
//         return (
//           <div
//             key={tier}
//             style={{
//               display: "flex", alignItems: "center", gap: 8,
//               padding: "9px 14px", borderRadius: 8,
//               fontSize: 13, fontWeight: 500, ...cfg.style,
//             }}
//           >
//             {cfg.icon}
//             <span style={{ flex: 1 }}>{cfg.msg(counts[tier]!)}</span>
//             <button
//               onClick={() => setDismissed((p) => new Set([...p, tier]))}
//               style={{
//                 background: "none", border: "none", cursor: "pointer",
//                 fontSize: 17, lineHeight: 1, fontWeight: 700,
//                 color: cfg.closeColor, padding: "0 2px",
//               }}
//               aria-label="Dismiss"
//             >
//               ×
//             </button>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// // ── Legend ────────────────────────────────────────────────────────────────────

// const Legend = () => (
//   <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12, fontSize: 12, color: "#64748B" }}>
//     {([
//       { color: "#EF4444", bg: "#FEF2F2", label: "Overdue" },
//       { color: "#EAB308", bg: "#FEFCE8", label: "Yesterday" },
//       { color: "#F97316", bg: "#FFF7ED", label: "Today" },
//       { color: "#22C55E", bg: "#F0FDF4", label: "Tomorrow" },
//     ] as const).map(({ color, bg, label }) => (
//       <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
//         <span style={{
//           display: "inline-block", width: 10, height: 10,
//           borderRadius: 2, background: bg, border: `2px solid ${color}`,
//         }} />
//         {label}
//       </span>
//     ))}
//   </div>
// );

// // ── Main component ────────────────────────────────────────────────────────────

// const CounsellorFollowUps = () => {
//   const navigate = useNavigate();
//   const [filter, setFilter] = useState("all");
//   const [leads, setLeads] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     setLoading(true);
//     setError(null);
//     fetch(`${API_BASE}/api/leads/followups/all?filter=${filter}`, {
//       headers: authHeaders(),
//     })
//       .then((r) => {
//         if (r.status === 401) {
//           setError("Session expired. Please log in again.");
//           return null;
//         }
//         return r.json();
//       })
//       .then((json) => {
//         if (!json) return;
//         if (json.success) {
//           // Filter out Lost / closed leads — they are terminal and not actionable
//           const active = (json.data as any[]).filter(
//             (l) => !EXCLUDED_STATUSES.has(l.leadStatus)
//           );
//           setLeads(active);
//         } else {
//           setError(json.message || "Failed to load follow-ups");
//         }
//       })
//       .catch(() => setError("Failed to load follow-ups"))
//       .finally(() => setLoading(false));
//   }, [filter]);

//   const sortedLeads = useMemo(
//     () =>
//       [...leads].sort((a, b) => {
//         const ta = TIER_ORDER[getDueTier(a.nextFollowUpDate)];
//         const tb = TIER_ORDER[getDueTier(b.nextFollowUpDate)];
//         if (ta !== tb) return ta - tb;
//         return new Date(a.nextFollowUpDate ?? 0).getTime() - new Date(b.nextFollowUpDate ?? 0).getTime();
//       }),
//     [leads]
//   );

//   return (
//     <CounsellorLayout
//       title="My Follow-ups"
//       subtitle="Upcoming and overdue follow-ups for your leads."
//       actions={
//         <div className="flex flex-wrap gap-2">
//           {["all", "today", "tomorrow", "week", "overdue"].map((f) => (
//             <Button
//               key={f}
//               size="sm"
//               onClick={() => setFilter(f)}
//               className={
//                 filter === f
//                   ? "bg-[#0037FF] text-white hover:bg-[#0030DD]"
//                   : "border border-slate-200 bg-white text-slate-700 hover:border-[#0037FF] hover:bg-[#EEF4FF] hover:text-[#0037FF]"
//               }
//             >
//               {f.charAt(0).toUpperCase() + f.slice(1)}
//             </Button>
//           ))}
//         </div>
//       }
//     >
//       {error && (
//         <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {!loading && !error && <AlertBanners leads={leads} />}
//       {!loading && !error && <Legend />}

//       {loading ? (
//         <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading…</div>
//       ) : (
//         <DataTable
//           rows={sortedLeads}
//           rowStyle={(r: any) => TIER_ROW_STYLE[getDueTier(r.nextFollowUpDate)]}
//           columns={[
//             {
//               key: "fullName",
//               label: "Lead Name",
//               render: (r: any) => <span className="font-medium">{r.fullName}</span>,
//             },
//             { key: "mobileNumber", label: "Phone" },
//             { key: "course", label: "Course" },
//             {
//               key: "nextFollowUpDate",
//               label: "Due Date",
//               render: (r: any) => {
//                 const tier = getDueTier(r.nextFollowUpDate);
//                 const pill = TIER_PILL[tier];
//                 const dateStr = r.nextFollowUpDate
//                   ? new Date(r.nextFollowUpDate).toLocaleString("en-IN", {
//                       day: "numeric",
//                       month: "short",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })
//                   : "—";
//                 return (
//                   <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
//                     <span style={tier === "overdue" || tier === "yesterday" ? { color: "#EF4444", fontWeight: 600 } : {}}>
//                       {dateStr}
//                     </span>
//                     {pill && (
//                       <span style={{
//                         ...pill.style,
//                         fontSize: 10, fontWeight: 600,
//                         padding: "1px 7px", borderRadius: 99, whiteSpace: "nowrap",
//                       }}>
//                         {pill.label}
//                       </span>
//                     )}
//                   </span>
//                 );
//               },
//             },
//             {
//               key: "leadStatus",
//               label: "Status",
//               render: (r: any) => <StatusBadge>{r.leadStatus}</StatusBadge>,
//             },
//             {
//               key: "actions",
//               label: "",
//               render: (r: any) => (
//                 <Button variant="ghost" size="sm" onClick={() => navigate(`/counsellor/leads/${r._id}`)}>
//                   <Eye size={14} />
//                 </Button>
//               ),
//             },
//           ]}
//         />
//       )}
//     </CounsellorLayout>
//   );
// };

// export default CounsellorFollowUps;



import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, AlertTriangle, Clock, Calendar, CheckCircle } from "lucide-react";
import CounsellorLayout from "../../components/CounsellorLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE || "https://slateserver1.onrender.com";

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const EXCLUDED_STATUSES = new Set([
  "Lost",
  "lost",
  "LOST",
  "Closed Lost",
  "closed lost",
  "converted",
  "Converted",
  "CONVERTED",
]);

const toDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

type DueTier = "overdue" | "yesterday" | "today" | "tomorrow" | "upcoming";

function getDueTier(dateStr: string | null | undefined): DueTier {
  if (!dateStr) return "upcoming";
  const due = toDay(new Date(dateStr));
  const now = toDay(new Date());
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diff < -1) return "overdue";
  if (diff === -1) return "yesterday";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return "upcoming";
}

const TIER_ORDER: Record<DueTier, number> = {
  overdue: 0,
  yesterday: 1,
  today: 2,
  tomorrow: 3,
  upcoming: 4,
};

const TIER_ROW_STYLE: Record<DueTier, React.CSSProperties> = {
  overdue: { backgroundColor: "#FEF2F2", borderLeft: "3px solid #EF4444" },
  yesterday: { backgroundColor: "#FEFCE8", borderLeft: "3px solid #EAB308" },
  today: { backgroundColor: "#FFF7ED", borderLeft: "3px solid #F97316" },
  tomorrow: { backgroundColor: "#F0FDF4", borderLeft: "3px solid #22C55E" },
  upcoming: {},
};

const TIER_PILL: Record<DueTier, { label: string; style: React.CSSProperties } | null> = {
  overdue: { label: "Overdue", style: { background: "#EF4444", color: "#fff" } },
  yesterday: { label: "Yesterday", style: { background: "#EAB308", color: "#fff" } },
  today: { label: "Today", style: { background: "#F97316", color: "#fff" } },
  tomorrow: { label: "Tomorrow", style: { background: "#22C55E", color: "#fff" } },
  upcoming: null,
};

type AlertTier = Exclude<DueTier, "upcoming">;

interface AlertConfigEntry {
  icon: React.ReactNode;
  msg: (n: number) => string;
  style: React.CSSProperties;
  closeColor: string;
}

const ALERT_CONFIG: Record<AlertTier, AlertConfigEntry> = {
  overdue: {
    icon: <AlertTriangle size={14} />,
    msg: (n) => `${n} follow-up${n > 1 ? "s are" : " is"} overdue — contact immediately.`,
    style: { background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C" },
    closeColor: "#B91C1C",
  },
  yesterday: {
    icon: <Clock size={14} />,
    msg: (n) => `${n} follow-up${n > 1 ? "s were" : " was"} due yesterday.`,
    style: { background: "#FEFCE8", border: "1px solid #FDE047", color: "#854D0E" },
    closeColor: "#854D0E",
  },
  today: {
    icon: <Calendar size={14} />,
    msg: (n) => `${n} follow-up${n > 1 ? "s are" : " is"} due today.`,
    style: { background: "#FFF7ED", border: "1px solid #FED7AA", color: "#C2410C" },
    closeColor: "#C2410C",
  },
  tomorrow: {
    icon: <CheckCircle size={14} />,
    msg: (n) => `${n} follow-up${n > 1 ? "s are" : " is"} due tomorrow — prepare early.`,
    style: { background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534" },
    closeColor: "#166534",
  },
};

const AlertBanners = ({ leads }: { leads: any[] }) => {
  const [dismissed, setDismissed] = useState<Set<DueTier>>(new Set());

  const counts = useMemo(() => {
    const c: Partial<Record<DueTier, number>> = {};
    for (const l of leads) {
      const tier = getDueTier(l.nextFollowUpDate);
      if (tier !== "upcoming") c[tier] = (c[tier] ?? 0) + 1;
    }
    return c;
  }, [leads]);

  const visible = (["overdue", "yesterday", "today", "tomorrow"] as const).filter(
    (tier) => counts[tier] && !dismissed.has(tier)
  );

  if (visible.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
      {visible.map((tier) => {
        const cfg = ALERT_CONFIG[tier];
        return (
          <div
            key={tier}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              ...cfg.style,
            }}
          >
            {cfg.icon}
            <span style={{ flex: 1 }}>{cfg.msg(counts[tier]!)}</span>
            <button
              onClick={() => setDismissed((p) => new Set([...p, tier]))}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 17,
                lineHeight: 1,
                fontWeight: 700,
                color: cfg.closeColor,
                padding: "0 2px",
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

const Legend = () => (
  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12, fontSize: 12, color: "#64748B" }}>
    {(
      [
        { color: "#EF4444", bg: "#FEF2F2", label: "Overdue" },
        { color: "#EAB308", bg: "#FEFCE8", label: "Yesterday" },
        { color: "#F97316", bg: "#FFF7ED", label: "Today" },
        { color: "#22C55E", bg: "#F0FDF4", label: "Tomorrow" },
      ] as const
    ).map(({ color, bg, label }) => (
      <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: 2,
            background: bg,
            border: `2px solid ${color}`,
          }}
        />
        {label}
      </span>
    ))}
  </div>
);

const CounsellorFollowUps = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/leads/followups/all?filter=${filter}`, {
      headers: authHeaders(),
    })
      .then((r) => {
        if (r.status === 401) {
          setError("Session expired. Please log in again.");
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (!json) return;
        if (json.success) {
          const active = (json.data as any[]).filter(
            (l) => !EXCLUDED_STATUSES.has(l.leadStatus)
          );
          setLeads(active);
        } else {
          setError(json.message || "Failed to load follow-ups");
        }
      })
      .catch(() => setError("Failed to load follow-ups"))
      .finally(() => setLoading(false));
  }, [filter]);

  const sortedLeads = useMemo(
    () =>
      [...leads].sort((a, b) => {
        const ta = TIER_ORDER[getDueTier(a.nextFollowUpDate)];
        const tb = TIER_ORDER[getDueTier(b.nextFollowUpDate)];
        if (ta !== tb) return ta - tb;
        return new Date(a.nextFollowUpDate ?? 0).getTime() - new Date(b.nextFollowUpDate ?? 0).getTime();
      }),
    [leads]
  );

  return (
    <CounsellorLayout
      title="My Follow-ups"
      subtitle="Upcoming and overdue follow-ups for your leads."
      actions={
        <div className="flex flex-wrap gap-2">
          {["all", "today", "tomorrow", "week", "overdue"].map((f) => (
            <Button
              key={f}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "bg-[#0037FF] text-white hover:bg-[#0030DD]"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-[#0037FF] hover:bg-[#EEF4FF] hover:text-[#0037FF]"
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && <AlertBanners leads={leads} />}
      {!loading && !error && <Legend />}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading…</div>
      ) : (
        <DataTable
          rows={sortedLeads}
          rowStyle={(r: any) => TIER_ROW_STYLE[getDueTier(r.nextFollowUpDate)]}
          columns={[
            {
              key: "fullName",
              label: "Lead Name",
              render: (r: any) => <span className="font-medium">{r.fullName}</span>,
            },
            { key: "mobileNumber", label: "Phone" },
            { key: "course", label: "Course" },
            {
              key: "nextFollowUpDate",
              label: "Due Date",
              render: (r: any) => {
                const tier = getDueTier(r.nextFollowUpDate);
                const pill = TIER_PILL[tier];
                const dateStr = r.nextFollowUpDate
                  ? new Date(r.nextFollowUpDate).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
                return (
                  <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={tier === "overdue" || tier === "yesterday" ? { color: "#EF4444", fontWeight: 600 } : {}}>
                      {dateStr}
                    </span>
                    {pill && (
                      <span
                        style={{
                          ...pill.style,
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "1px 7px",
                          borderRadius: 99,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pill.label}
                      </span>
                    )}
                  </span>
                );
              },
            },
            {
              key: "leadStatus",
              label: "Status",
              render: (r: any) => <StatusBadge>{r.leadStatus}</StatusBadge>,
            },
            {
              key: "actions",
              label: "",
              render: (r: any) => (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/counsellor/leads/${r._id}`)}>
                  <Eye size={14} />
                </Button>
              ),
            },
          ]}
        />
      )}
    </CounsellorLayout>
  );
};

export default CounsellorFollowUps;