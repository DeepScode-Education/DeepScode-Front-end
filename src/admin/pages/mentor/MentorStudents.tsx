import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MentorLayout from "../../components/MentorLayout";
import { Input } from "@/components/ui/input";
import { mentorDashboardApi, MentorStudentRow } from "@/integrations/client";
import { Search, Users } from "lucide-react";

const MentorStudents = () => {
  const [students, setStudents] = useState<MentorStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mentorDashboardApi.getStudents();
        if (res.success) setStudents(res.data);
      } catch (err) {
        console.error(err);
        setError("Couldn't load your students right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.studentId ?? "").toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <MentorLayout title="My Students" subtitle="Students currently assigned to you">
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or student ID…"
          className="h-9 pl-9"
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        {error && (
          <div className="border-b border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading students…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
            <Users size={28} className="text-muted-foreground/50" />
            {students.length === 0 ? "No students have been assigned to you yet." : "No students match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                  <th className="p-3 font-semibold">Student</th>
                  <th className="p-3 font-semibold">Course</th>
                  <th className="p-3 font-semibold">Progress</th>
                  <th className="p-3 font-semibold">Last Activity</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s._id}>
                    <td className="p-3">
                      <div className="font-medium">{s.fullName}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{s.course ?? "—"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-[#0037FF]"
                            style={{ width: `${Math.min(s.progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {s.lastActivity ? new Date(s.lastActivity).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/mentor/assignments?student=${s._id}`}
                        className="text-xs font-semibold text-[#0037FF] hover:underline"
                      >
                        View assignments
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default MentorStudents;