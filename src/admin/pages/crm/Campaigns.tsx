import { Plus, Megaphone } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { campaigns } from "../../data/mock";

const Campaigns = () => (
  <AdminLayout
    title="Campaigns"
    subtitle="Multi-channel acquisition campaigns."
    actions={<Button size="sm"><Plus size={14} /> New Campaign</Button>}
  >
    <DataTable
      rows={campaigns}
      columns={[
        { key: "name", label: "Campaign", render: (r) => (
          <div className="flex items-center gap-2"><Megaphone size={14} className="text-[#0037FF]" /><span className="font-medium">{r.name}</span></div>
        ) },
        { key: "channel", label: "Channel" },
        { key: "reach", label: "Reach", render: (r) => r.reach.toLocaleString() },
        { key: "ctr", label: "CTR" },
        { key: "conversions", label: "Conversions" },
        { key: "status", label: "Status", render: (r) => <StatusBadge>{r.status}</StatusBadge> },
      ]}
    />
  </AdminLayout>
);

export default Campaigns;
