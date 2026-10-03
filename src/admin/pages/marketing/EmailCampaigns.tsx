import { Plus, Mail } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { emailCampaigns } from "../../data/mock";

const EmailCampaigns = () => (
  <AdminLayout
    title="Email Campaigns"
    subtitle="Broadcasts, automations, and drip sequences."
    actions={<Button size="sm"><Plus size={14} /> New Campaign</Button>}
  >
    <DataTable
      rows={emailCampaigns}
      columns={[
        { key: "name", label: "Campaign", render: (r) => (
          <div className="flex items-center gap-2"><Mail size={14} className="text-[#0037FF]" /><span className="font-medium">{r.name}</span></div>
        ) },
        { key: "recipients", label: "Recipients", render: (r) => r.recipients.toLocaleString() },
        { key: "openRate", label: "Open Rate" },
        { key: "clickRate", label: "Click Rate" },
        { key: "status", label: "Status", render: (r) => <StatusBadge>{r.status}</StatusBadge> },
      ]}
    />
  </AdminLayout>
);

export default EmailCampaigns;
