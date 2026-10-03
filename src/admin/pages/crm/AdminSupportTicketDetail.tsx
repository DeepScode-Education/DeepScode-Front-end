import { useState } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Mail, Phone, User, Hash, Calendar, MessageSquare,
  Send, UserPlus, TrendingUp, Tag,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../../components/DataTable";
import {
  useSupportTicketDetail,
  useAssignableStaff,
  type TicketStatus,
  type TicketPriority,
} from "../../hooks/useSupportTickets";
import { useCourses } from "../../hooks/useCourses";

const STATUS_OPTIONS: TicketStatus[] = ["open", "in-progress", "resolved", "closed"];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string; color: string }[] = [
  { value: "low",    label: "Low",    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "high",   label: "High",   color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
];

const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

const AdminSupportTicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    ticket, loading, error,
    updateStatus, updatePriority, assignTicket, replyToTicket, convertToInquiry,
  } = useSupportTicketDetail(id!);
  const { staff, loading: staffLoading, loadStaff } = useAssignableStaff();
  const { courses } = useCourses();

  const [statusChanging, setStatusChanging] = useState(false);
  const [priorityChanging, setPriorityChanging] = useState(false);

  const [showAssign, setShowAssign] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<TicketStatus | "">("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replySent, setReplySent] = useState(false);

  const [showConvert, setShowConvert] = useState(false);
  const [convertCourse, setConvertCourse] = useState("");
  const [convertMobile, setConvertMobile] = useState("");
  const [convertRemarks, setConvertRemarks] = useState("");
  const [converting, setConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<{ success: boolean; message: string } | null>(null);

  const openAssignPanel = async () => {
    setShowAssign(true);
    await loadStaff();
  };

  const handleStatusChange = async (status: TicketStatus) => {
    setStatusChanging(true);
    await updateStatus(status);
    setStatusChanging(false);
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    setPriorityChanging(true);
    await updatePriority(priority);
    setPriorityChanging(false);
  };

  const handleAssign = async () => {
    setAssigning(true);
    await assignTicket(selectedStaffId || null);
    setAssigning(false);
    setShowAssign(false);
    setSelectedStaffId("");
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    const result = await replyToTicket(replyText.trim(), replyStatus || undefined);
    setSendingReply(false);
    if (result.success) {
      setReplyText("");
      setReplyStatus("");
      setReplySent(true);
      setTimeout(() => setReplySent(false), 3000);
    }
  };

  const handleConvert = async () => {
    if (!convertCourse) return;
    setConverting(true);
    const result = await convertToInquiry({
      course: convertCourse,
      mobileNumber: convertMobile.trim() || undefined,
      remarks: convertRemarks.trim() || undefined,
    });
    setConverting(false);
    setConvertResult({ success: !!result.success, message: result.message || "" });
  };

  if (loading) {
    return (
      <AdminLayout title="Ticket Detail" subtitle="">
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">Loading...</div>
      </AdminLayout>
    );
  }

  if (error || !ticket) {
    return (
      <AdminLayout title="Ticket Not Found" subtitle="">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-muted-foreground">{error || "This ticket does not exist."}</p>
          <Button onClick={() => navigate(location.state?.from || "/admin/support-tickets")}>
            Back to Support Tickets
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const currentPriority = ticket.priority;
  const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === currentPriority) || PRIORITY_OPTIONS[1];
  const assignedName = typeof ticket.assignedTo === "object" && ticket.assignedTo ? ticket.assignedTo.fullName : null;
  const hasInquiry = !!ticket.inquiry;

  return (
    <AdminLayout
      title={ticket.ticketNumber}
      subtitle={`${ticket.issueType} · ${ticket.subject}`}
      actions={
        <div className="flex items-center gap-2">
          <select
            value={currentPriority}
            disabled={priorityChanging}
            onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
            className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${priorityMeta.color}`}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label} priority</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => navigate(location.state?.from || "/admin/support-tickets")}>
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left column ── */}
        <div className="space-y-4 lg:col-span-1">

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Submitted By</h3>
            <div className="space-y-2 text-sm">
              <Row icon={<User size={13} />} label="Name" value={ticket.fullName} />
              <Row icon={<Mail size={13} />} label="Email" value={ticket.email} />
              <Row icon={<Phone size={13} />} label="Phone" value={ticket.phone || "—"} />
              <Row icon={<Hash size={13} />} label="Student ID" value={ticket.studentId || "Guest"} />
              <Row icon={<Calendar size={13} />} label="Submitted" value={formatDateTime(ticket.createdAt)} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Ticket Details</h3>
            <div className="space-y-2 text-sm">
              <Row icon={<Tag size={13} />} label="Issue Type" value={ticket.issueType} />
              <Row label="Subject" value={ticket.subject} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm whitespace-pre-wrap rounded-lg bg-secondary/40 p-3">{ticket.description}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Status</h3>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  disabled={statusChanging || ticket.status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    ticket.status === s
                      ? "border-primary bg-[#0037FF] text-white"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="pt-2 space-y-1.5">
              <p className="text-xs text-muted-foreground">Assigned Staff</p>
              {showAssign ? (
                <div className="space-y-2">
                  {staffLoading ? (
                    <p className="text-xs text-muted-foreground">Loading staff...</p>
                  ) : (
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                    >
                      <option value="">Unassign</option>
                      {staff.map((s) => (
                        <option key={s._id} value={s._id} disabled={!s.isActive}>
                          {s.fullName} ({s.role}){!s.isActive ? " — inactive" : ""}
                        </option>
                      ))}
                      {staff.length === 0 && <option disabled>No staff found</option>}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-white" onClick={handleAssign} disabled={assigning}>
                      {assigning ? "Saving..." : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAssign(false)}>✕</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={openAssignPanel}>
                  <UserPlus size={13} />
                  {assignedName ? `Re-assign (${assignedName})` : "Assign Staff"}
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold mb-1">Create Inquiry</h3>
            {hasInquiry ? (
              <p className="text-xs text-muted-foreground">This ticket is already linked to an inquiry.</p>
            ) : (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowConvert(true)}>
                <TrendingUp size={13} /> Convert to Inquiry
              </Button>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <MessageSquare size={14} className="text-[#0037FF]" /> Reply to Student
            </h3>

            {replySent && (
              <p className="text-xs text-emerald-600">Reply sent — the student has been emailed.</p>
            )}

            {ticket.adminReply && (
              <div className="rounded-lg bg-secondary/40 p-3 text-sm whitespace-pre-wrap">
                <p className="text-xs text-muted-foreground mb-1">Last reply sent</p>
                {ticket.adminReply}
              </div>
            )}

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply — this will be emailed to the student..."
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value as TicketStatus | "")}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">Keep current status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>Set status: {s}</option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleReply}
                disabled={sendingReply || !replyText.trim()}
                className="ml-auto text-white"
              >
                <Send size={13} /> {sendingReply ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Convert to Inquiry modal ── */}
      {showConvert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !converting) {
              setShowConvert(false);
              setConvertResult(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-3">
            {!convertResult ? (
              <>
                <h3 className="text-base font-bold">Convert Ticket to Inquiry</h3>
                <p className="text-sm text-muted-foreground">
                  Creates a CRM lead from this ticket's contact details, tagged with source "Support Ticket".
                </p>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Course *</label>
                  <select
                    value={convertCourse}
                    onChange={(e) => setConvertCourse(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                {!ticket.phone && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Mobile Number *</label>
                    <input
                      value={convertMobile}
                      onChange={(e) => setConvertMobile(e.target.value)}
                      placeholder="This ticket has no phone on file"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Remarks</label>
                  <textarea
                    value={convertRemarks}
                    onChange={(e) => setConvertRemarks(e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setShowConvert(false)} disabled={converting}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConvert}
                    disabled={converting || !convertCourse || (!ticket.phone && !convertMobile.trim())}
                  >
                    {converting ? "Converting..." : "Create Inquiry"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className={`text-base font-bold ${convertResult.success ? "text-emerald-600" : "text-destructive"}`}>
                  {convertResult.success ? "Inquiry created" : "Conversion failed"}
                </h3>
                <p className="text-sm text-muted-foreground">{convertResult.message}</p>
                <div className="flex justify-end pt-2">
                  <Button size="sm" onClick={() => { setShowConvert(false); setConvertResult(null); }}>Done</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const Row = ({ icon, label, value }: { icon?: ReactNode; label: string; value: ReactNode }) => (
  <div className="flex items-start justify-between gap-2">
    <span className="flex items-center gap-1.5 text-muted-foreground shrink-0">{icon}{label}</span>
    <span className="text-right font-medium">{value}</span>
  </div>
);

export default AdminSupportTicketDetail;