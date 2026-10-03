'use client';

import { useEffect, useState } from "react";
import { Check, X, Clock } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { studentApprovalApi, PendingStudent } from "../../integrations/client";

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function PendingStudentsPage() {
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await studentApprovalApi.getPending();
      setStudents(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load pending students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      const res = await studentApprovalApi.approve(id);
      toast.success(`Approved! Student ID: ${res.data.studentId}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this student's registration?")) return;
    setActingId(id);
    try {
      await studentApprovalApi.reject(id);
      toast.success("Student rejected");
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    } finally {
      setActingId(null);
    }
  };

  return (
    <AdminLayout
      title="Pending Approvals"
      subtitle="New student registrations waiting for approval"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">Registered On</th>
                <th className="px-5 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    Loading…
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Clock size={20} />
                      No pending registrations 🎉
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-5 py-3 font-medium">{s.fullName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          disabled={actingId === s._id}
                          onClick={() => handleApprove(s._id)}
                        >
                          <Check size={14} className="mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actingId === s._id}
                          onClick={() => handleReject(s._id)}
                        >
                          <X size={14} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}