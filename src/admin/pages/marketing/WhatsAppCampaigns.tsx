import { Plus, MessageSquare } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { whatsappCampaigns } from "../../data/mock";

const WhatsAppCampaigns = () => (
  <AdminLayout
    title="WhatsApp Campaigns"
    subtitle="Templates, broadcasts, and automated flows."
    actions={<Button size="sm"><Plus size={14} /> New Broadcast</Button>}
  >
    <DataTable
      rows={whatsappCampaigns}
      columns={[
        { key: "name", label: "Campaign", render: (r) => (
          <div className="flex items-center gap-2"><MessageSquare size={14} className="text-emerald-500" /><span className="font-medium">{r.name}</span></div>
        ) },
        { key: "recipients", label: "Recipients", render: (r) => r.recipients.toLocaleString() },
        { key: "delivered", label: "Delivered" },
        { key: "read", label: "Read" },
        { key: "status", label: "Status", render: (r) => <StatusBadge>{r.status}</StatusBadge> },
      ]}
    />
  </AdminLayout>
);

export default WhatsAppCampaigns;
