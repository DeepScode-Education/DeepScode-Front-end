import { useEffect, useState } from "react";
import { X, Search, Award, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminCertificateApi, EligibleStudentRow, CertificateEligibility } from "@/integrations/client";

interface Props {
  onClose: () => void;
  onIssued: () => void;
}

const IssueCertificateModal = ({ onClose, onIssued }: Props) => {
  const [students, setStudents] = useState<EligibleStudentRow[]>([]);
  const [search, setSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selected, setSelected] = useState<EligibleStudentRow | null>(null);
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const loadStudents = async (q = "") => {
    try {
      setLoadingStudents(true);
      const res = await adminCertificateApi.getStudents(q);
      setStudents(res.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadStudents(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleSelectStudent = async (student: EligibleStudentRow) => {
    setSelected(student);
    setEligibility(null);
    if (!student.course) {
      toast.error("This student has no assigned course. Assign a course first.");
      return;
    }
    try {
      setLoadingEligibility(true);
      const res = await adminCertificateApi.getEligibility(student._id);
      setEligibility(res.data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load eligibility");
    } finally {
      setLoadingEligibility(false);
    }
  };

  const handleIssue = async () => {
    if (!selected) return;
    try {
      setIssuing(true);
      await adminCertificateApi.issue(selected._id);
      onIssued();
    } catch (e: any) {
      toast.error(e.message || "Failed to issue certificate");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-[#0037FF]" />
            <h2 className="text-lg font-bold">Issue Certificate</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!selected ? (
            <>
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student by name, ID or email..."
                  className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0037FF]"
                />
              </div>

              {loadingStudents ? (
                <p className="py-8 text-center text-sm text-gray-400">Loading students...</p>
              ) : students.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No students found.</p>
              ) : (
                <div className="space-y-2">
                  {students.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => handleSelectStudent(s)}
                      disabled={s.hasCertificate || !s.course}
                      className="flex w-full items-center justify-between rounded-xl border p-3 text-left transition hover:border-[#0037FF] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div>
                        <p className="text-sm font-semibold">{s.fullName}</p>
                        <p className="text-xs text-gray-500">
                          {s.studentId ? `#${s.studentId} · ` : ""}
                          {s.course ? s.course.title : "No course assigned"}
                        </p>
                      </div>
                      {s.hasCertificate && (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                          Already issued
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-5">
              <button
                onClick={() => {
                  setSelected(null);
                  setEligibility(null);
                }}
                className="text-xs font-medium text-[#0037FF] hover:underline"
              >
                ← Choose a different student
              </button>

              <div className="rounded-2xl border p-4">
                <p className="text-sm font-semibold">{selected.fullName}</p>
                <p className="text-xs text-gray-500">{selected.studentId ? `#${selected.studentId}` : selected.email}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Course</p>
                    <p className="font-medium">{selected.course?.title || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Mentor</p>
                    <p className="font-medium">{selected.mentor?.fullName || "Not assigned"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold">Certificate Eligibility</h3>
                {loadingEligibility ? (
                  <p className="text-sm text-gray-400">Checking eligibility...</p>
                ) : eligibility ? (
                  <div className="space-y-3">
                    {eligibility.requirements.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-xl border p-3">
                        <div className="flex items-center gap-2">
                          {r.progress >= 100 ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : (
                            <XCircle size={16} className="text-gray-300" />
                          )}
                          <span className="text-sm">{r.title}</span>
                        </div>
                        <span className="text-sm font-semibold text-[#0037FF]">{r.progress}%</span>
                      </div>
                    ))}

                    <div
                      className={`rounded-xl p-3 text-sm font-medium ${
                        eligibility.eligible ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {eligibility.eligible
                        ? "This student meets all requirements for certification."
                        : "This student hasn't met all requirements yet. You can still issue manually if appropriate."}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Unable to load eligibility.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="flex items-center justify-end gap-3 border-t p-5">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleIssue} disabled={issuing || !selected.course}>
              {issuing ? "Issuing..." : "Confirm & Issue Certificate"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCertificateModal;