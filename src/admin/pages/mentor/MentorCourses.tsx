import { useEffect, useState } from "react";
import MentorLayout from "../../components/MentorLayout";
import { mentorDashboardApi, MentorCourseRow } from "@/integrations/client";
import { BookOpen, Users } from "lucide-react";

const MentorCourses = () => {
  const [courses, setCourses] = useState<MentorCourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mentorDashboardApi.getCourses();
        if (res.success) setCourses(res.data);
      } catch (err) {
        console.error(err);
        setError("Couldn't load your courses right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <MentorLayout title="Courses" subtitle="Courses your assigned students are enrolled in">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading courses…
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          <BookOpen size={28} className="text-muted-foreground/50" />
          No courses linked to your students yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c._id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-[#0037FF]">
                <BookOpen size={16} />
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {c.category ?? "Course"}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-bold">{c.title}</h3>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users size={13} />
                {c.studentsCount} student{c.studentsCount === 1 ? "" : "s"} assigned
              </div>
            </div>
          ))}
        </div>
      )}
    </MentorLayout>
  );
};

export default MentorCourses;