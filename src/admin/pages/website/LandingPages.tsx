import { Plus, Layout, ExternalLink } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import DataTable, { StatusBadge } from "../../components/DataTable";
import { Button } from "@/components/ui/button";
import { landingPages } from "../../data/mock";

const SECTIONS = [
  "Hero", "Testimonials", "FAQ", "Pricing", "CTA Block", "Statistics", "Mentor Section", "Lead Form",
];

const LandingPages = () => (
  <AdminLayout
    title="Landing Pages"
    subtitle="Drag-and-drop landing page builder with reusable sections."
    actions={<Button size="sm"><Plus size={14} /> New Page</Button>}
  >
    <DataTable
      rows={landingPages}
      columns={[
        { key: "name", label: "Page", render: (r) => (
          <div className="flex items-center gap-2"><Layout size={14} className="text-[#0037FF]" /><span className="font-medium">{r.name}</span></div>
        ) },
        { key: "slug", label: "URL", render: (r) => (
          <a className="inline-flex items-center gap-1 text-xs text-[#0037FF] hover:underline" href="#">{r.slug}<ExternalLink size={10} /></a>
        ) },
        { key: "visits", label: "Visits", render: (r) => r.visits.toLocaleString() },
        { key: "conversions", label: "Conversions" },
        { key: "cvr", label: "CVR" },
        { key: "status", label: "Status", render: (r) => <StatusBadge>{r.status}</StatusBadge> },
      ]}
    />

    <div className="mt-6 rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">Reusable Section Library</h3>
      <p className="text-xs text-muted-foreground">Drag any block onto your page</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {SECTIONS.map((s) => (
          <button key={s} className="rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-6 text-sm font-medium hover:border-primary hover:bg-[#0037FF]/5">
            {s}
          </button>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default LandingPages;
