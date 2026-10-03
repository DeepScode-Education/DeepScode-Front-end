"use client";
import { useEffect, useState } from "react";
import axios, { AxiosHeaders } from "axios";
import {
  Download,
  Search,
  Check,
  X,
  Clock,
  Copy,
  UserPlus,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  Phone,
  CalendarCheck,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  BASE_URL,
  getAdminToken,
  getToken,
  studentApprovalApi,
  type AddStudentResponse,
} from "../../integrations/client";
import { useNavigate } from "react-router-dom";

// ── Types ──────────────────────────────────────────────────────────────────────

type Student = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: "all" | "pending" | "approved" | "rejected";
  studentId?: string | null;
  createdAt: string;
  approvedAt?: string | null;
  // newly enriched fields from the API
  mobileNumber?: string | null;
  convertedAt?: string | null;
};

type FilterTab = "all" | "pending" | "approved" | "rejected";

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Axios instance ─────────────────────────────────────────────────────────────

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = getAdminToken() ?? getToken();
  if (token) {
    config.headers = new AxiosHeaders(config.headers);
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ── Component ──────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [actingId, setActingId] = useState<string | null>(null);

  // Add Student modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    password: "",
    sendEmail: true,
  });

  // Credentials reveal modal state
  const [credentials, setCredentials] = useState<AddStudentResponse | null>(null);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const statusQuery = tab === "all" ? "" : `?status=${tab}`;
      const res = await api.get(`/api/admin/students${statusQuery}`);
      setStudents(res.data?.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      // also searchable by mobile number
      (s.mobileNumber && s.mobileNumber.includes(q))
    );
  });

  // ── Approve / Reject ───────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      const res = await api.patch(`/api/admin/students/${id}/approve`);
      const newId = res.data?.data?.studentId;
      toast.success(`Student Approved! 🎉 Student ID: ${newId}`, { duration: 8000 });
      setStudents((prev) =>
        tab === "pending"
          ? prev.filter((s) => s._id !== id)
          : prev.map((s) =>
              s._id === id ? { ...s, status: "approved", studentId: newId } : s
            )
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Approval failed");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this student's registration?")) return;
    setActingId(id);
    try {
      await api.patch(`/api/admin/students/${id}/reject`);
      toast.success("Student rejected");
      setStudents((prev) =>
        tab === "pending"
          ? prev.filter((s) => s._id !== id)
          : prev.map((s) => (s._id === id ? { ...s, status: "rejected" } : s))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Rejection failed");
    } finally {
      setActingId(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await studentApprovalApi.deleteStudent(deleteTarget._id);
      toast.success(`${deleteTarget.fullName} deleted successfully`);
      setStudents((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  // ── Add Student ────────────────────────────────────────────────────────────

  const resetAddForm = () => {
    setAddForm({ fullName: "", email: "", password: "", sendEmail: true });
    setShowPassword(false);
  };

  const handleAddStudent = async () => {
    if (!addForm.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!addForm.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (addForm.password.trim() && addForm.password.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setAddSubmitting(true);
    try {
      const res = await studentApprovalApi.addStudent({
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim(),
        password: addForm.password.trim() || undefined,
        sendEmail: addForm.sendEmail,
      });

      toast.success(
        res.emailSent
          ? "Student created and credentials emailed!"
          : "Student created — copy the credentials below."
      );

      setAddOpen(false);
      resetAddForm();
      setCredentials(res);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to create student");
    } finally {
      setAddSubmitting(false);
    }
  };

  // ── Utilities ──────────────────────────────────────────────────────────────

  const copyStudentId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Student ID copied!");
  };

  const copyCredentials = () => {
    if (!credentials) return;
    const text = `Student ID: ${credentials.credentials.studentId}\nPassword: ${credentials.credentials.password}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied!");
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Mobile Number",
      "Student ID",
      "Registered On",
      "Conversion Date",
    ];
    const rows = filtered.map((u) => [
      u._id,
      u.fullName,
      u.email,
      u.mobileNumber || "-",
      u.studentId || "-",
      formatDate(u.createdAt),
      formatDate(u.convertedAt),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) =>
            // Wrap in quotes and escape any internal quotes
            `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_${tab}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  // ── Sub-components ─────────────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: Student["status"] }) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600",
      approved: "bg-green-500/10 text-green-600",
      rejected: "bg-red-500/10 text-red-600",
    };
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? ""}`}
      >
        {status}
      </span>
    );
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending Approval" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout
      title="Students"
      subtitle="Manage student registrations — approve to generate a Student ID"
      actions={
        <div className="flex gap-2">
          <Button size="sm" className="text-white" onClick={() => setAddOpen(true)}>
            <UserPlus size={14} className="mr-1" /> Add Student
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download size={14} className="mr-1" /> Export
          </Button>
        </div>
      }
    >
      {/* Filter Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-[#0037FF] text-white"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name, email, mobile, or Student ID…"
            className="h-9 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Student</th>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">
                  <span className="flex items-center gap-1.5">
                    <Phone size={11} />
                    Mobile
                  </span>
                </th>
                <th className="px-5 py-3 text-left font-medium">Student ID</th>
                <th className="px-5 py-3 text-left font-medium">Registered</th>
                <th className="px-5 py-3 text-left font-medium">
                  <span className="flex items-center gap-1.5">
                    <CalendarCheck size={11} />
                    Converted
                  </span>
                </th>
                <th className="px-5 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    Loading students...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Clock size={20} />
                      No {tab !== "all" ? tab : ""} students found.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr
                    key={student._id}
                    className="border-t border-border hover:bg-secondary/30"
                  >
                    {/* Name + avatar */}
                    <td
                      className="px-5 py-3 cursor-pointer"
                      onClick={() => navigate(`/admin/students/${student._id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-[#0037FF]">
                          {student.fullName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="font-medium">{student.fullName}</div>
                          {/* Show status as a small inline badge under the name
                              so the column can be removed without losing visibility */}
                          <StatusBadge status={student.status} />
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3 text-muted-foreground">{student.email}</td>

                    {/* Mobile Number — NEW */}
                    <td className="px-5 py-3">
                      {student.mobileNumber ? (
                        <span className="font-mono text-sm">{student.mobileNumber}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Student ID */}
                    <td className="px-5 py-3">
                      {student.studentId ? (
                        <button
                          onClick={() => copyStudentId(student.studentId!)}
                          className="flex items-center gap-1.5 font-mono font-semibold text-[#0037FF] hover:underline"
                          title="Copy Student ID"
                        >
                          {student.studentId}
                          <Copy size={12} />
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Registered date */}
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(student.createdAt)}
                    </td>

                    {/* Conversion date — falls back to approvedAt when no lead conversion exists */}
                    <td className="px-5 py-3">
                      {student.convertedAt || student.approvedAt ? (
                        <span className="text-green-600 font-medium text-xs">
                          {formatDate(student.convertedAt ?? student.approvedAt)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {student.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              disabled={actingId === student._id}
                              onClick={() => handleApprove(student._id)}
                              className="text-white"
                            >
                              <Check size={14} className="mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actingId === student._id}
                              onClick={() => handleReject(student._id)}
                            >
                              <X size={14} className="mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {/* approved students — no action button, just delete */}
                        {student.status === "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actingId === student._id}
                            onClick={() => handleApprove(student._id)}
                          >
                            <Check size={14} className="mr-1" /> Approve Anyway
                          </Button>
                        )}
                        {/* Delete — always visible */}
                        <button
                          onClick={() => setDeleteTarget(student)}
                          disabled={actingId === student._id}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                          title="Delete student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-start gap-3 border-b border-border px-6 py-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Delete Student</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-foreground">
                You are about to permanently delete{" "}
                <span className="font-semibold">{deleteTarget.fullName}</span>{" "}
                ({deleteTarget.email}).
              </p>
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 space-y-1">
                <p className="font-medium">The following data will also be deleted:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Student profile information</li>
                  <li>Course &amp; mentor assignment</li>
                  <li>Fee plan and payment history</li>
                  <li>All associated records</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                <Trash2 size={14} className="mr-1" />
                {deleting ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Student Modal ──────────────────────────────────────────────── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">Add Student</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Creates an approved account instantly — no registration required.
                </p>
              </div>
              <button
                onClick={() => {
                  setAddOpen(false);
                  resetAddForm();
                }}
                className="rounded-lg p-1.5 hover:bg-secondary/60 text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <Label htmlFor="add-fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-fullName"
                  placeholder="e.g. Priya Sharma"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="student@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-password">Password</Label>
                <div className="relative">
                  <Input
                    id="add-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to auto-generate"
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Min 6 characters. Leave blank to auto-generate a secure password.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/30 transition-colors">
                <div
                  onClick={() =>
                    setAddForm((f) => ({ ...f, sendEmail: !f.sendEmail }))
                  }
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    addForm.sendEmail ? "bg-[#0037FF]" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      addForm.sendEmail ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Email credentials to student</p>
                  <p className="text-xs text-muted-foreground">
                    Sends Student ID and password to their email address.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAddOpen(false);
                  resetAddForm();
                }}
                disabled={addSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="text-white"
                onClick={handleAddStudent}
                disabled={addSubmitting}
              >
                {addSubmitting ? "Creating..." : "Create Student"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Credentials Reveal Modal ───────────────────────────────────────── */}
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">Student Created ✓</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Save these credentials — the password won't be shown again.
                </p>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {credentials.data.fullName}
                </span>{" "}
                ({credentials.data.email})
              </p>

              <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">
                    Student ID
                  </span>
                  <span className="font-bold text-[#0037FF]">
                    {credentials.credentials.studentId}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">
                    Password
                  </span>
                  <span className="font-bold">{credentials.credentials.password}</span>
                </div>
              </div>

              {credentials.emailSent ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-700">
                  <Check size={13} />
                  Credentials have been emailed to the student.
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-xs text-yellow-700">
                  <Clock size={13} className="mt-0.5 shrink-0" />
                  <span>
                    Email not sent
                    {credentials.emailError ? ` (${credentials.emailError})` : ""}.
                    Please share these credentials manually.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <Button variant="outline" onClick={copyCredentials}>
                <Copy size={14} className="mr-1" /> Copy Credentials
              </Button>
              <Button onClick={() => setCredentials(null)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}