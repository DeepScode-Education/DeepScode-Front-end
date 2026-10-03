import { Phone, Filter, Download } from "lucide-react";
import CounsellorLayout from "../../components/CounsellorLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { callLogs } from "../../data/mock";

// TODO: replace mock `callLogs` with a real `/api/leads/call-logs?mine=true`
// endpoint when that's ready on the backend — same pattern as FollowUps.

const CounsellorCallLogs = () => (
  <CounsellorLayout
    title="My Call Logs"
    subtitle="Your conversations, recorded and tracked."
    actions={
      <>
        <Button variant="outline" size="sm"><Filter size={14} /> Filter</Button>
        <Button variant="outline" size="sm"><Download size={14} /> Export</Button>
        <Button size="sm" className="text-white"><Phone size={14} /> Log Call</Button>
      </>
    }
  >
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        { label: "Calls Today", value: "42" },
        { label: "Avg Duration", value: "5m 18s" },
        { label: "Conversion", value: "18%" },
        { label: "Missed", value: "6" },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className="mt-1 text-xl font-bold">{s.value}</div>
        </div>
      ))}
    </div>
    <DataTable
      rows={callLogs}
      columns={[
        { key: "id", label: "Call ID" },
        { key: "lead", label: "Lead", render: (r) => <span className="font-medium">{r.lead}</span> },
        { key: "duration", label: "Duration" },
        { key: "outcome", label: "Outcome", render: (r) => <StatusBadge>{r.outcome}</StatusBadge> },
        { key: "date", label: "Date" },
      ]}
    />
  </CounsellorLayout>
);

export default CounsellorCallLogs;