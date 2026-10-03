import { CalendarPlus, Video } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { classes } from "../data/mock";

const Classes = () => (
  <AdminLayout
    title="Classes"
    subtitle="Schedule live sessions and manage recordings."
    actions={<Button size="sm"><CalendarPlus size={14} /> Schedule Class</Button>}
  >
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold">Upcoming sessions</h3>
        <div className="mt-4 space-y-2">
          {classes.map((cl) => (
            <div key={cl.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/40">
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-accent text-[#0037FF]">
                <span className="text-[10px] font-medium uppercase">{cl.date.split(" ")[0].slice(0, 3)}</span>
                <span className="text-sm font-bold leading-none">{cl.time.split(" ")[0]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{cl.course}</div>
                <div className="text-xs text-muted-foreground">{cl.teacher} • {cl.duration} • {cl.students} students</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-1 text-[11px] font-medium">
                <Video size={11} /> {cl.platform}
              </span>
              <Button size="sm" variant="outline">Join</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Recordings</h3>
        <p className="mt-1 text-xs text-muted-foreground">Latest uploads</p>
        <ul className="mt-4 space-y-3">
          {[
            { title: "IGCSE Math — Quadratics", time: "Yesterday • 58 min" },
            { title: "A Levels Physics — Optics", time: "2d ago • 1h 24m" },
            { title: "SAT Verbal — Reading Tips", time: "3d ago • 1h 02m" },
            { title: "IGCSE English — Essay", time: "4d ago • 47 min" },
          ].map((r) => (
            <li key={r.title} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                <Video size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.title}</div>
                <div className="text-[11px] text-muted-foreground">{r.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </AdminLayout>
);

export default Classes;
