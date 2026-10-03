import { Plus, Link2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { affiliates } from "../../data/mock";

const Affiliates = () => (
  <AdminLayout
    title="Affiliates"
    subtitle="Partners driving referral traffic and signups."
    actions={<Button size="sm"><Plus size={14} /> New Affiliate</Button>}
  >
    <DataTable
      rows={affiliates}
      columns={[
        { key: "name", label: "Affiliate", render: (r) => (
          <div className="flex items-center gap-2"><Link2 size={14} className="text-[#0037FF]" /><span className="font-medium">{r.name}</span></div>
        ) },
        { key: "visits", label: "Visits", render: (r) => r.visits.toLocaleString() },
        { key: "signups", label: "Signups" },
        { key: "earnings", label: "Earnings" },
        { key: "status", label: "Status", render: (r) => <StatusBadge>{r.status}</StatusBadge> },
      ]}
    />
  </AdminLayout>
);

export default Affiliates;
