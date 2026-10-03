import { Search, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seoPages } from "../../data/mock";

const SEO = () => (
  <AdminLayout
    title="SEO"
    subtitle="Metadata, schema, sitemap, scoring, and internal linking."
    actions={<Button size="sm"><Globe size={14} /> Submit Sitemap</Button>}
  >
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        { label: "Avg Score", value: "90" },
        { label: "Indexed Pages", value: "84" },
        { label: "Issues", value: "6" },
        { label: "Backlinks", value: "1.2k" },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className="mt-1 text-xl font-bold">{s.value}</div>
        </div>
      ))}
    </div>

    <div className="mb-5 relative max-w-sm">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder="Search pages…" className="h-9 pl-9" />
    </div>

    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary/30 text-xs text-muted-foreground">
          <tr className="border-b border-border">
            <th className="px-5 py-2.5 text-left font-medium">Page</th>
            <th className="px-5 py-2.5 text-left font-medium">Meta Title</th>
            <th className="px-5 py-2.5 text-left font-medium">Score</th>
            <th className="px-5 py-2.5 text-left font-medium">Issues</th>
            <th className="px-5 py-2.5 text-left font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {seoPages.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
              <td className="px-5 py-3 font-mono text-xs">{p.page}</td>
              <td className="px-5 py-3 truncate max-w-xs">{p.title}</td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-16 overflow-hidden rounded-full bg-secondary`}>
                    <div className={`h-full rounded-full ${p.score >= 90 ? "bg-emerald-500" : p.score >= 80 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${p.score}%` }} />
                  </div>
                  <span className="text-xs font-semibold">{p.score}</span>
                </div>
              </td>
              <td className="px-5 py-3">
                {p.issues === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12} />Clean</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"><AlertCircle size={12} />{p.issues} issues</span>
                )}
              </td>
              <td className="px-5 py-3"><Button variant="outline" size="sm">Edit</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminLayout>
);

export default SEO;
