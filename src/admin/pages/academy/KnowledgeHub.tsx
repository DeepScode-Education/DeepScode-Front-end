import { Plus, Search, FileText, Video, NotebookPen } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { knowledgeHub } from "../../data/mock";

const ICONS: Record<string, typeof FileText> = {
  PDF: FileText,
  Video: Video,
  Notes: NotebookPen,
};

const KnowledgeHub = () => (
  <AdminLayout
    title="KnowledgeHub"
    subtitle="Student-only resources: PDFs, notes, recordings, interview prep."
    actions={<Button size="sm"><Plus size={14} /> Add Resource</Button>}
  >
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search resources…" className="h-9 pl-9" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["All", "Design", "Coding", "Analytics", "Career", "Interview Prep"].map((c, i) => (
          <button key={c} className={`rounded-full border px-3 py-1 text-xs ${i === 0 ? "border-primary bg-[#0037FF] text-[#0037FF]-foreground" : "border-border bg-card hover:bg-secondary"}`}>{c}</button>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {knowledgeHub.map((k) => {
        const Icon = ICONS[k.type] || FileText;
        return (
          <div key={k.id} className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0037FF]/10 text-[#0037FF]">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold truncate">{k.title}</h3>
                <span className="text-[10px] text-muted-foreground shrink-0">{k.updated}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{k.category}</span>
                <span>{k.size}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </AdminLayout>
);

export default KnowledgeHub;
