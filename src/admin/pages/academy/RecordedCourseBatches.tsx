import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Video, Calendar, Clock } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { adminRecordedCourseApi, AdminRecordedBatch } from "@/integrations/client";

const RecordedCourseBatches = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<AdminRecordedBatch[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await adminRecordedCourseApi.getBatches(courseId);
        if (!mounted) return;
        setBatches(res.data ?? []);
        setCourseTitle(res.course?.title ?? "");
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to load batches");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  return (
    <AdminLayout
      title={courseTitle || "Batches"}
      subtitle="Each batch shows its schedule, mentor, students, and recorded videos."
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/academy/recorded")} className="gap-1">
          <ArrowLeft size={14} /> Back to Courses
        </Button>
      }
    >
      {loading && <div className="py-16 text-center text-sm text-muted-foreground">Loading batches…</div>}
      {error && <div className="py-16 text-center text-sm text-destructive">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {batches.map((b) => (
            <div
              key={b.batchId}
              className="rounded-xl border border-border bg-card p-4 cursor-pointer transition hover:shadow-md"
              onClick={() => navigate(`/admin/academy/recorded/${courseId}/${b.batchId}`)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {b.isUnscheduled ? "Unscheduled Batch" : `${b.days} · ${b.time}`}
                </h3>
                <span className="rounded-full bg-[#0037FF]/10 px-2 py-0.5 text-[10px] font-medium text-[#0037FF]">
                  {b.videoCount} video{b.videoCount === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {!b.isUnscheduled && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} /> {b.days}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} /> {b.time}
                    </div>
                  </>
                )}
                <div className="flex items-center gap-1.5">
                  <Users size={12} /> {b.studentCount} student{b.studentCount === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-3 border-t border-border pt-3 text-xs">
                <span className="text-muted-foreground">Mentor: </span>
                <span className="font-medium">{b.mentor?.fullName ?? "Unassigned"}</span>
              </div>

              <Button size="sm" className="mt-3 w-full gap-1 text-white">
                <Video size={14} /> Manage Videos
              </Button>
            </div>
          ))}

          {batches.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
              No batches found for this course yet.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default RecordedCourseBatches;