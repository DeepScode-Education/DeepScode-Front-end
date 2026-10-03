import { Plus, FormInput } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { formsList } from "../../data/mock";

const Forms = () => (
  <AdminLayout
    title="Forms"
    subtitle="Lead, inquiry, and signup forms across the site."
    actions={<Button size="sm"><Plus size={14} /> New Form</Button>}
  >
    <DataTable
      rows={formsList}
      columns={[
        { key: "name", label: "Form", render: (r) => (
          <div className="flex items-center gap-2"><FormInput size={14} className="text-[#0037FF]" /><span className="font-medium">{r.name}</span></div>
        ) },
        { key: "fields", label: "Fields" },
        { key: "submissions", label: "Submissions", render: (r) => r.submissions.toLocaleString() },
        { key: "conversion", label: "Conversion" },
        { key: "status", label: "Status", render: (r) => <StatusBadge>{r.status}</StatusBadge> },
      ]}
    />
  </AdminLayout>
);

export default Forms;
