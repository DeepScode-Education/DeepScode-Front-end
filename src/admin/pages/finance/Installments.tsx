import { Plus, Wallet } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { installments } from "../../data/mock";

const Installments = () => (
  <AdminLayout
    title="Installments"
    subtitle="EMI plans and upcoming installment collections."
    actions={<Button size="sm"><Plus size={14} /> New Plan</Button>}
  >
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        { label: "Active Plans", value: "184" },
        { label: "Due This Week", value: "₹4.2L" },
        { label: "Collected (MTD)", value: "₹12.8L" },
        { label: "Overdue", value: "8" },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className="mt-1 text-xl font-bold">{s.value}</div>
        </div>
      ))}
    </div>
    <DataTable
      rows={installments}
      columns={[
        { key: "student", label: "Student", render: (r) => (
          <div className="flex items-center gap-2"><Wallet size={14} className="text-[#0037FF]" /><span className="font-medium">{r.student}</span></div>
        ) },
        { key: "course", label: "Course" },
        { key: "plan", label: "Plan" },
        { key: "paid", label: "Progress", render: (r) => (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-[#0037FF]" style={{ width: `${(r.paid / (r.paid + r.remaining)) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{r.paid}/{r.paid + r.remaining}</span>
          </div>
        ) },
        { key: "amount", label: "Next Amount" },
        { key: "next", label: "Next Date" },
      ]}
    />
  </AdminLayout>
);

export default Installments;
