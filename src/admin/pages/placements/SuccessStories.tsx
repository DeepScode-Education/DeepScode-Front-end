import { Plus, Quote } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { successStories } from "../../data/mock";

const SuccessStories = () => (
  <AdminLayout
    title="Success Stories"
    subtitle="Real career outcomes from deepScode Education graduates."
    actions={<Button size="sm"><Plus size={14} /> New Story</Button>}
  >
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {successStories.map((s) => (
        <div key={s.id} className="rounded-xl border border-border bg-card p-5">
          <Quote size={20} className="text-[#0037FF]/40" />
          <p className="mt-3 text-sm leading-relaxed">"{s.quote}"</p>
          <div className="mt-4 border-t border-border pt-3">
            <div className="text-sm font-semibold">{s.student}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{s.from}</div>
            <div className="mt-0.5 text-xs font-medium text-[#0037FF]">→ {s.to}</div>
          </div>
        </div>
      ))}
    </div>
  </AdminLayout>
);

export default SuccessStories;
