import { Download, Plus } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { payments } from "../data/mock";

const Payments = () => (
  <AdminLayout
    title="Payments & Invoices"
    subtitle="Track revenue, dues, and generate invoices."
    actions={
      <>
        <Button variant="outline" size="sm"><Download size={14} /> Export</Button>
        <Button size="sm"><Plus size={14} /> New Invoice</Button>
      </>
    }
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Revenue (MTD)" value="AED 84,500" delta="+22%" trend="up" />
      <StatCard label="Outstanding" value="AED 12,800" delta="-8%" trend="down" />
      <StatCard label="Refunds" value="AED 1,200" delta="+2%" trend="up" />
      <StatCard label="Avg. Deal Size" value="AED 1,540" delta="+4%" trend="up" />
    </div>

    <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold">Recent Invoices</h3>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1 text-xs">
          {["All", "Paid", "Pending", "Overdue"].map((t, i) => (
            <button key={t} className={`rounded-md px-3 py-1.5 font-medium ${i === 0 ? "bg-secondary" : "text-muted-foreground hover:bg-secondary/60"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-secondary/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-5 py-3 text-left font-medium">Invoice</th>
            <th className="px-5 py-3 text-left font-medium">Student</th>
            <th className="px-5 py-3 text-left font-medium">Course</th>
            <th className="px-5 py-3 text-left font-medium">Amount</th>
            <th className="px-5 py-3 text-left font-medium">Status</th>
            <th className="px-5 py-3 text-left font-medium">Date</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
              <td className="px-5 py-3 font-mono text-xs">{p.id}</td>
              <td className="px-5 py-3 font-medium">{p.student}</td>
              <td className="px-5 py-3 text-muted-foreground">{p.course}</td>
              <td className="px-5 py-3 font-medium">{p.currency} {p.amount}</td>
              <td className="px-5 py-3"><StatusBadge>{p.status}</StatusBadge></td>
              <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
              <td className="px-5 py-3 text-right">
                <Button variant="ghost" size="sm">View</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminLayout>
);

export default Payments;
