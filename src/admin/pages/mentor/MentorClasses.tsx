import { useEffect, useState } from "react";
import MentorLayout from "../../components/MentorLayout";
import { mentorDashboardApi, MentorClassRow } from "@/integrations/client";
import { CalendarDays, Clock, Video } from "lucide-react";

const MentorClasses = () => {
  const [classes, setClasses] = useState<MentorClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mentorDashboardApi.getClasses();
        if (res.success) setClasses(res.data);
      } catch (err) {
        console.error(err);
        setError("Couldn't load live classes right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <MentorLayout title="Live Classes" subtitle="Upcoming sessions with your students">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading classes…
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <Video size={28} className="text-muted-foreground/50" />
          No live classes scheduled right now.
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((c) => (
            <div key={c._id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0037FF]/10 text-[#0037FF]">
                <Video size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{c.title}</div>
                {c.course && <div className="text-xs text-muted-foreground">{c.course}</div>}
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} /> {c.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {c.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </MentorLayout>
  );
};

export default MentorClasses;