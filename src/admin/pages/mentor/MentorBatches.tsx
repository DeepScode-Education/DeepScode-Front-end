import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorLayout from "../../components/MentorLayout";
import { Button } from "@/components/ui/button";
import { mentorDashboardApi, MentorBatchRow } from "@/integrations/client";
import { CalendarDays, Clock, Users, Layers } from "lucide-react";

const BATCH_TIME_LABELS: Record<string, string> = {
  "10:00-12:00": "10:00 AM - 12:00 PM",
  "12:00-2:00": "12:00 PM - 02:00 PM",
  "2:30-4:30": "02:30 PM - 04:30 PM",
  "4:30-6:30": "04:30 PM - 06:30 PM",
};

const MentorBatches = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<MentorBatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mentorDashboardApi.getBatches();
        if (res.success) setBatches(res.data);
      } catch (err) {
        console.error(err);
        setError("Couldn't load your batches right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  return (
    <MentorLayout title="My Batches" subtitle="Batches you are currently mentoring">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading batches…
        </div>
      ) : batches.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <Layers size={28} className="text-muted-foreground/50" />
          No batches have been assigned to you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-[#0037FF]">
                <Layers size={16} />
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {b.category ?? "Course"}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-bold">{b.course}</h3>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={12} />
                  Batch: <span className="font-semibold text-foreground">{b.batchDays ?? "Unscheduled"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  Time:{" "}
                  <span className="font-semibold text-foreground">
                    {b.batchTime ? BATCH_TIME_LABELS[b.batchTime] ?? b.batchTime : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={12} />
                  Students: <span className="font-semibold text-foreground">{b.totalStudents}</span>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-4 w-full bg-[#0037FF] text-white hover:bg-[#0037FF]/90"
                onClick={() => navigate(`/mentor/batches/${encodeURIComponent(b.id)}`)}
              >
                View Students
              </Button>
            </div>
          ))}
        </div>
      )}
    </MentorLayout>
  );
};

export default MentorBatches;