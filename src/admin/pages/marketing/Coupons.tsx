import { Plus, Ticket } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { coupons } from "../../data/mock";

const Coupons = () => (
  <AdminLayout
    title="Coupons"
    subtitle="Discount codes, usage limits, and analytics."
    actions={<Button size="sm"><Plus size={14} /> New Coupon</Button>}
  >
    <DataTable
      rows={coupons}
      columns={[
        { key: "code", label: "Code", render: (r) => (
          <div className="flex items-center gap-2"><Ticket size={14} className="text-[#0037FF]" /><code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs font-semibold">{r.code}</code></div>
        ) },
        { key: "discount", label: "Discount" },
        { key: "uses", label: "Uses", render: (r) => `${r.uses} / ${r.limit}` },
        { key: "expires", label: "Expires" },
        { key: "status", label: "Status", render: (r) => <StatusBadge>{r.status}</StatusBadge> },
      ]}
    />
  </AdminLayout>
);

export default Coupons;
