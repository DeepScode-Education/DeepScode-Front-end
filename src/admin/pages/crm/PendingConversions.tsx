// src/admin/pages/crm/PendingConversions.tsx
//
// Admin / Super Admin review queue for counsellor-submitted conversion
// requests. Approve → creates the student + enrollment (handled server-side).
// Reject → requires a reason, lead stays open for the counsellor to edit
// and resubmit.

import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Eye, Clock, IndianRupee } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { usePendingConversions } from "../../hooks/useLeads";

const PendingConversions = () => {
  const { requests, loading, error, approve, reject } = usePendingConversions();

  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async (leadId: string) => {
    setActingId(leadId);
    try {
      const result = await approve(leadId);
      if (result.success) {
        showToast(
          "success",
          result.data?.tempPassword
            ? `Student created. Temp password: ${result.data.tempPassword}`
            : "Conversion approved — student created."
        );
      } else {
        showToast("error", result.message || "Failed to approve conversion");
      }
    } catch {
      showToast("error", "Network error while approving");
    } finally {
      setActingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    setActingId(rejectingId);
    try {
      const result = await reject(rejectingId, rejectReason.trim());
      if (result.success) {
        showToast("success", "Conversion request rejected.");
        setRejectingId(null);
        setRejectReason("");
      } else {
        showToast("error", result.message || "Failed to reject conversion");
      }
    } catch {
      showToast("error", "Network error while rejecting");
    } finally {
      setActingId(null);
    }
  };

  return (
    <AdminLayout
      title="Pending Conversion Requests"
      subtitle="Leads counsellors have submitted for student conversion."
    >
      {toast && (
        <div
          className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
            toast.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {toast.text}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          Loading pending requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-20 text-muted-foreground">
          <Clock size={28} className="opacity-40" />
          <p className="text-sm">No pending conversion requests right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((lead) => {
            const req = lead.conversionRequest;
            const requestedByName =
              typeof req?.requestedBy === "object" ? req?.requestedBy?.fullName : "—";
            const isActing = actingId === lead._id;
            const isRejectingThis = rejectingId === lead._id;

            return (
              <div key={lead._id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{lead.fullName}</h3>
                      <span className="rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wide">
                        Pending
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {typeof lead.course === "object"
  ? lead.course?.title
  : lead.course} · {lead.mobileNumber}
                      {lead.email ? ` · ${lead.email}` : ""}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/leads/${lead._id}`}>
                      <Eye size={14} /> View Lead
                    </Link>
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <span className="text-xs text-muted-foreground block">Requested By</span>
                    <span className="font-medium">{requestedByName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Requested At</span>
                    <span className="font-medium">
                      {req?.requestedAt ? new Date(req.requestedAt).toLocaleString("en-IN") : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block flex items-center gap-1">
                      <IndianRupee size={11} /> Final Negotiated Fee
                    </span>
                    <span className="font-medium">
                      {req?.finalFee ? `₹${req.finalFee.toLocaleString("en-IN")}` : "Not specified"}
                    </span>
                  </div>
                </div>

                {req?.requestNote && (
                  <div className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm">
                    <span className="text-xs text-muted-foreground block mb-1">Counsellor's Note</span>
                    {req.requestNote}
                  </div>
                )}

                {isRejectingThis ? (
                  <div className="mt-4 space-y-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900 p-3">
                    <label className="text-xs font-medium text-red-600">Rejection reason *</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      placeholder="Explain why this conversion is being rejected…"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setRejectingId(null); setRejectReason(""); }}
                        disabled={isActing}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleRejectSubmit}
                        disabled={isActing || !rejectReason.trim()}
                      >
                        {isActing ? "Rejecting…" : "Confirm Reject"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setRejectingId(lead._id)}
                      disabled={isActing}
                    >
                      <XCircle size={14} /> Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApprove(lead._id)}
                      disabled={isActing}
                    >
                      <CheckCircle2 size={14} /> {isActing ? "Approving…" : "Approve & Create Student"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default PendingConversions;