import { Plus, Gift } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import StatCard from "../../components/StatCard";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { referrals } from "../../data/mock";

const Referrals = () => (
  <AdminLayout
    title="Referral System"
    subtitle="Reward students for bringing friends."
    actions={<Button size="sm"><Plus size={14} /> New Reward Tier</Button>}
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Referrals" value="284" delta="+18" trend="up" />
      <StatCard label="Conversions" value="142" delta="+24" trend="up" />
      <StatCard label="Rewards Paid" value="₹2.84L" delta="+12%" trend="up" />
      <StatCard label="Top Referrer" value="Aarav M." />
    </div>
    <div className="mt-6">
      <DataTable
        rows={referrals}
        columns={[
          { key: "referrer", label: "Referrer", render: (r) => (
            <div className="flex items-center gap-2"><Gift size={14} className="text-[#0037FF]" /><span className="font-medium">{r.referrer}</span></div>
          ) },
          { key: "referred", label: "Referred Friend" },
          { key: "reward", label: "Reward" },
          { key: "status", label: "Status", render: (r) => <StatusBadge>{r.status}</StatusBadge> },
          { key: "date", label: "Date" },
        ]}
      />
    </div>
  </AdminLayout>
);

export default Referrals;
