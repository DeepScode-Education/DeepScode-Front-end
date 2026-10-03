// admin/pages/fee-collection/FeeCollectionDetail.tsx
//
// Fee Collection CRM — Student Fee Detail Page
// Route: /admin/fee-collection/:studentId
//
// Tabs: Overview, Installments, Payment History, Notes, Follow-ups
// Actions: Add Payment, Add Note, Add Follow-up, Setup Fee

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  IndianRupee,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Banknote,
  Phone,
  FileText,
  CreditCard,
  CalendarDays,
  User,
  Building2,
  GraduationCap,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "../../components/AdminLayout";
import {
  feeCollectionApi,
  type StudentFeeDetails,
  type FeeInstallment,
  type FeeFollowUp,
  type FeeNote,
  type PaymentRecord,
  type CallStatus,
} from "@/integrations/feeCollectionApi";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  `₹${(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDateTime = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const statusColors: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  "no-plan": "bg-gray-100 text-gray-600",
  success: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const StatusPill = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
      statusColors[status] ?? "bg-gray-100 text-gray-600"
    }`}
  >
    {status}
  </span>
);

// ── Tab Button ─────────────────────────────────────────────────────────────────
const TabBtn = ({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      active
        ? "border-[#0037FF] text-[#0037FF]"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
    {count !== undefined && (
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
          active ? "bg-[#0037FF]/10 text-[#0037FF]" : "bg-secondary text-muted-foreground"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// ── Add Payment Modal ─────────────────────────────────────────────────────────
// const AddPaymentModal = ({
//   studentId,
//   onClose,
//   onSuccess,
// }: {
//   studentId: string;
//   onClose: () => void;
//   onSuccess: () => void;
// }) => {
//   const [amount, setAmount] = useState("");
//   const [method, setMethod] = useState("UPI");
//   const [txnId, setTxnId] = useState("");
//   const [notes, setNotes] = useState("");
//   const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async () => {
//     if (!amount || Number(amount) <= 0) {
//       setError("Please enter a valid amount");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       await feeCollectionApi.addPayment(studentId, {
//         amount: Number(amount),
//         paymentMethod: method,
//         transactionId: txnId || undefined,
//         notes: notes || undefined,
//         paidAt: paidAt || undefined,
//       });
//       onSuccess();
//       onClose();
//     } catch (err: any) {
//       setError(err.message || "Failed to record payment");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//       <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
//         <div className="flex items-center justify-between mb-5">
//           <h2 className="text-base font-semibold">Record Payment</h2>
//           <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary">
//             <X size={16} />
//           </button>
//         </div>

//         {error && (
//           <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
//             {error}
//           </div>
//         )}

//         <div className="space-y-4">
//           <div>
//             <label className="text-xs font-medium text-muted-foreground">
//               Amount (₹) *
//             </label>
//             <Input
//               type="number"
//               placeholder="e.g. 5000"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               className="mt-1 h-9"
//             />
//           </div>

//           <div>
//             <label className="text-xs font-medium text-muted-foreground">
//               Payment Method
//             </label>
//             <select
//               className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
//               value={method}
//               onChange={(e) => setMethod(e.target.value)}
//             >
//               {["Cash", "UPI", "Bank Transfer", "Card", "Cheque", "Other"].map(
//                 (m) => (
//                   <option key={m} value={m}>
//                     {m}
//                   </option>
//                 )
//               )}
//             </select>
//           </div>

//           <div>
//             <label className="text-xs font-medium text-muted-foreground">
//               Transaction ID
//             </label>
//             <Input
//               placeholder="Optional"
//               value={txnId}
//               onChange={(e) => setTxnId(e.target.value)}
//               className="mt-1 h-9"
//             />
//           </div>

//           <div>
//             <label className="text-xs font-medium text-muted-foreground">
//               Payment Date
//             </label>
//             <Input
//               type="date"
//               value={paidAt}
//               onChange={(e) => setPaidAt(e.target.value)}
//               className="mt-1 h-9"
//             />
//           </div>

//           <div>
//             <label className="text-xs font-medium text-muted-foreground">
//               Notes
//             </label>
//             <textarea
//               className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
//               rows={2}
//               placeholder="Optional notes…"
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//             />
//           </div>

//           <div className="flex gap-2 pt-1">
//             <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
//               Cancel
//             </Button>
//             <Button
//               size="sm"
//               className="flex-1 bg-[#0037FF] text-white hover:bg-[#0028cc]"
//               onClick={handleSubmit}
//               disabled={loading}
//             >
//               {loading ? "Saving…" : "Record Payment"}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// ── Add Payment Modal ─────────────────────────────────────────────────────────
const AddPaymentModal = ({
  studentId,
  installments,
  feeMode,
  onClose,
  onSuccess,
}: {
  studentId: string;
  installments: FeeInstallment[];
  feeMode?: "full" | "emi";
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const selectableInstallments = installments.filter(
    (i) => i.status !== "paid" && i.remainingAmount > 0
  );

  const [installmentId, setInstallmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [txnId, setTxnId] = useState("");
  const [notes, setNotes] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedInstallment = installments.find((i) => i._id === installmentId) || null;

  const handleSelectInstallment = (value: string) => {
    setInstallmentId(value);
    const inst = installments.find((i) => i._id === value);
    if (inst) setAmount(String(inst.remainingAmount));
  };

  const handleSubmit = async () => {
    if (feeMode === "emi" && !installmentId) {
      setError("Please select which EMI this payment is for");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (
      selectedInstallment &&
      Number(amount) > selectedInstallment.remainingAmount + 0.01
    ) {
      setError(
        `Amount cannot exceed the remaining balance of ${fmt(selectedInstallment.remainingAmount)} for this EMI`
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await feeCollectionApi.addPayment(studentId, {
        amount: Number(amount),
        paymentMethod: method,
        transactionId: txnId || undefined,
        notes: notes || undefined,
        paidAt: paidAt || undefined,
        installmentId: feeMode === "emi" ? installmentId : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">Record Payment</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {feeMode === "emi" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">EMI *</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={installmentId}
                onChange={(e) => handleSelectInstallment(e.target.value)}
              >
                <option value="">Select EMI…</option>
                {selectableInstallments.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    EMI {inst.installmentNumber} — {fmt(inst.remainingAmount)} remaining —{" "}
                    {inst.status}
                  </option>
                ))}
              </select>
              {selectableInstallments.length === 0 && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  All EMIs are fully paid.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">Amount (₹) *</label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              max={selectedInstallment ? selectedInstallment.remainingAmount : undefined}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 h-9"
            />
          </div>

          {selectedInstallment && (
            <div className="rounded-lg bg-secondary/40 px-3 py-2 text-xs space-y-0.5">
              <p>EMI Amount: {fmt(selectedInstallment.amount)}</p>
              <p>Already Paid: {fmt(selectedInstallment.paidAmount)}</p>
              <p>Remaining: {fmt(selectedInstallment.remainingAmount)}</p>
              <p>Due Date: {fmtDate(selectedInstallment.dueDate)}</p>
              <p className="capitalize">Status: {selectedInstallment.status}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {["Cash", "UPI", "Bank Transfer", "Card", "Cheque", "Other"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Transaction ID</label>
            <Input
              placeholder="Optional"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              className="mt-1 h-9"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Payment Date</label>
            <Input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="mt-1 h-9"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Defaults to today — pick an earlier date for a backdated payment.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <textarea
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="Optional notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#0037FF] text-white hover:bg-[#0028cc]"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving…" : "Record Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Add Note Modal ─────────────────────────────────────────────────────────────
const AddNoteModal = ({
  studentId,
  onClose,
  onSuccess,
}: {
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!note.trim()) {
      setError("Note content is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await feeCollectionApi.addNote(studentId, note.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">Add Note</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary">
            <X size={16} />
          </button>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          rows={4}
          placeholder="Write your note here…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[#0037FF] text-white hover:bg-[#0028cc]"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving…" : "Add Note"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Add Follow-up Modal ───────────────────────────────────────────────────────
const CALL_STATUSES: CallStatus[] = [
  "Connected",
  "Busy",
  "Switched Off",
  "Parent Talked",
  "Student Talked",
  "No Response",
];

const AddFollowUpModal = ({
  studentId,
  existing,
  onClose,
  onSuccess,
}: {
  studentId: string;
  existing?: FeeFollowUp;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(
    existing?.callStatus ?? "Connected"
  );
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    existing?.nextFollowUpDate
      ? new Date(existing.nextFollowUpDate).toISOString().slice(0, 16)
      : ""
  );
  const [expectedPaymentDate, setExpectedPaymentDate] = useState(
    existing?.expectedPaymentDate
      ? new Date(existing.expectedPaymentDate).toISOString().slice(0, 16)
      : ""
  );
  const [expectedAmount, setExpectedAmount] = useState(
    String(existing?.expectedAmount ?? "")
  );
  const [remarks, setRemarks] = useState(existing?.remarks ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        callStatus,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined,
        expectedPaymentDate: expectedPaymentDate ? new Date(expectedPaymentDate).toISOString() : undefined,
        expectedAmount: expectedAmount ? Number(expectedAmount) : undefined,
        remarks: remarks || undefined,
      };

      if (existing) {
        await feeCollectionApi.updateFollowUp(studentId, existing._id, payload);
      } else {
        await feeCollectionApi.addFollowUp(studentId, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save follow-up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">
            {existing ? "Update Follow-up" : "Add Follow-up"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Call Status *
            </label>
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={callStatus}
              onChange={(e) => setCallStatus(e.target.value as CallStatus)}
            >
              {CALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Next Follow-up Date
            </label>
            <Input
              type="datetime-local"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
              className="mt-1 h-9"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Expected Payment Date
            </label>
            <Input
              type="datetime-local"
              value={expectedPaymentDate}
              onChange={(e) => setExpectedPaymentDate(e.target.value)}
              className="mt-1 h-9"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Expected Amount (₹)
            </label>
            <Input
              type="number"
              placeholder="Optional"
              value={expectedAmount}
              onChange={(e) => setExpectedAmount(e.target.value)}
              className="mt-1 h-9"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Remarks
            </label>
            <textarea
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="Add remarks…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#0037FF] text-white hover:bg-[#0028cc]"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving…" : existing ? "Update" : "Add Follow-up"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
type Tab = "overview" | "installments" | "payments" | "notes" | "followups";

const FeeCollectionDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<StudentFeeDetails | null>(null);
  const [installments, setInstallments] = useState<FeeInstallment[]>([]);
  const [followUps, setFollowUps] = useState<FeeFollowUp[]>([]);
  const [notes, setNotes] = useState<FeeNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [editFollowUp, setEditFollowUp] = useState<FeeFollowUp | undefined>();

  const loadDetails = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const [d, inst, fu, n] = await Promise.all([
        feeCollectionApi.getStudentDetails(studentId),
        feeCollectionApi.getInstallments(studentId),
        feeCollectionApi.getFollowUps(studentId),
        feeCollectionApi.getNotes(studentId),
      ]);
      setDetails(d);
      setInstallments(inst);
      setFollowUps(fu);
      setNotes(n);
    } catch (err: any) {
      setError(err.message || "Failed to load student fee details");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const markFollowUpDone = async (fu: FeeFollowUp) => {
    if (!studentId) return;
    try {
      await feeCollectionApi.updateFollowUp(studentId, fu._id, {
        status: "completed",
      });
      loadDetails();
    } catch (err: any) {
      alert(err.message || "Failed to update follow-up");
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Fee Details" subtitle="">
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      </AdminLayout>
    );
  }

  if (error || !details) {
    return (
      <AdminLayout title="Fee Details" subtitle="">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error || "Student not found"}
        </div>
      </AdminLayout>
    );
  }

  const { student, fee, payments } = details;
  const feeStatusColor = fee
    ? statusColors[fee.feeStatus] ?? "bg-gray-100 text-gray-600"
    : "bg-gray-100 text-gray-600";

  return (
    <AdminLayout
      title={student.fullName}
      subtitle={`Student ID: ${student.studentId ?? "—"} · Fee Details`}
      actions={
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/fee-collection")}
          >
            <ArrowLeft size={14} />
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={loadDetails}>
            <RefreshCw size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNoteModal(true)}
          >
            <FileText size={14} />
            Add Note
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditFollowUp(undefined);
              setShowFollowUpModal(true);
            }}
          >
            <Phone size={14} />
            Follow-up
          </Button>
          <Button
            size="sm"
            className="bg-[#0037FF] text-white hover:bg-[#0028cc]"
            onClick={() => setShowPaymentModal(true)}
          >
            <Plus size={14} />
            Add Payment
          </Button>
        </div>
      }
    >
      {/* ── Student + Fee Summary Cards ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
        {/* Student Info */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Student Info
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">{student.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap
                size={14}
                className="text-muted-foreground flex-shrink-0"
              />
              <span className="text-sm text-muted-foreground font-mono">
                #{student.studentId ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText
                size={14}
                className="text-muted-foreground flex-shrink-0"
              />
              <span className="text-sm text-muted-foreground">
                {student.email}
              </span>
            </div>
            {student.branch && typeof student.branch === "object" && (
              <div className="flex items-center gap-2">
                <Building2
                  size={14}
                  className="text-muted-foreground flex-shrink-0"
                />
                <span className="text-sm text-muted-foreground">
                  {student.branch.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CalendarDays
                size={14}
                className="text-muted-foreground flex-shrink-0"
              />
              <span className="text-xs text-muted-foreground">
                Enrolled {fmtDate(student.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fee Summary
            </h3>
            {fee && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${feeStatusColor}`}
              >
                {fee.feeStatus}
              </span>
            )}
          </div>

          {!fee ? (
            <div className="flex items-center gap-3 rounded-lg bg-secondary/40 px-4 py-3">
              <AlertCircle size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                No fee plan set up yet.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[11px] text-muted-foreground">Total Fee</p>
                <p className="text-lg font-bold mt-0.5">
                  {fmt(fee.finalFee || fee.totalFees)}
                </p>
                {fee.discount > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Discount: {fmt(fee.discount)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Paid</p>
                <p className="text-lg font-bold mt-0.5 text-emerald-600">
                  {fmt(fee.totalPaid)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Remaining</p>
                <p className="text-lg font-bold mt-0.5 text-red-600">
                  {fmt(fee.remainingAmount)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Mode</p>
                <p className="text-sm font-semibold mt-0.5 capitalize">
                  {fee.paymentMode}
                </p>
                {fee.paymentMode === "emi" && fee.monthlyEmiAmount && (
                  <p className="text-[11px] text-muted-foreground">
                    {fmt(fee.monthlyEmiAmount)}/mo × {fee.emiMonths}
                  </p>
                )}
              </div>
            </div>
          )}

          {fee && (
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    fee.feeStatus === "paid"
                      ? "bg-emerald-500"
                      : fee.feeStatus === "overdue"
                      ? "bg-red-500"
                      : "bg-[#0037FF]"
                  }`}
                  style={{
                    width: `${
                      fee.totalFees > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (fee.totalPaid / (fee.finalFee || fee.totalFees)) *
                                100
                            )
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
                <span>
                  {fee.totalFees > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (fee.totalPaid / (fee.finalFee || fee.totalFees)) * 100
                        )
                      )
                    : 0}
                  % collected
                </span>
                {fee.nextDueDate && (
                  <span className="text-amber-600">
                    Next due: {fmtDate(fee.nextDueDate)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-border mb-4 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          <TabBtn active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
            <IndianRupee size={14} />
            Overview
          </TabBtn>
          <TabBtn
            active={activeTab === "installments"}
            onClick={() => setActiveTab("installments")}
            count={installments.length}
          >
            <CalendarDays size={14} />
            Installments
          </TabBtn>
          <TabBtn
            active={activeTab === "payments"}
            onClick={() => setActiveTab("payments")}
            count={payments.length}
          >
            <CreditCard size={14} />
            Payments
          </TabBtn>
          <TabBtn
            active={activeTab === "notes"}
            onClick={() => setActiveTab("notes")}
            count={notes.length}
          >
            <FileText size={14} />
            Notes
          </TabBtn>
          <TabBtn
            active={activeTab === "followups"}
            onClick={() => setActiveTab("followups")}
            count={followUps.length}
          >
            <Phone size={14} />
            Follow-ups
          </TabBtn>
        </div>
      </div>

      {/* ── Tab Content ── */}

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Recent payments */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold">Recent Payments</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("payments")}
              >
                View all
              </Button>
            </div>
            {payments.length === 0 ? (
              <p className="px-5 py-4 text-xs text-muted-foreground">
                No payments yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {payments.slice(0, 4).map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{fmt(p.amount)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.paymentMethod} · {fmtDate(p.paidAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {p.receiptNumber || "—"}
                      </p>
                      <StatusPill status={p.paymentStatus} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent follow-ups */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold">Recent Follow-ups</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("followups")}
              >
                View all
              </Button>
            </div>
            {followUps.length === 0 ? (
              <p className="px-5 py-4 text-xs text-muted-foreground">
                No follow-ups yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {followUps.slice(0, 4).map((f) => (
                  <li key={f._id} className="px-5 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <StatusPill status={f.callStatus} />
                        {f.remarks && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {f.remarks}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                        {fmtDate(f.createdAt)}
                      </span>
                    </div>
                    {f.nextFollowUpDate && (
                      <p className="mt-1 text-[11px] text-amber-600">
                        Next: {fmtDateTime(f.nextFollowUpDate)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* INSTALLMENTS */}
      {activeTab === "installments" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {installments.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              {fee?.paymentMode === "emi"
                ? "No installments found."
                : "This student has a full payment plan. No installments."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b border-border bg-secondary/30">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">#</th>
                    <th className="px-5 py-3 text-left font-medium">Due Date</th>
                    <th className="px-5 py-3 text-left font-medium">Amount</th>
                    <th className="px-5 py-3 text-left font-medium">Paid</th>
                    <th className="px-5 py-3 text-left font-medium">Remaining</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Paid On</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((inst) => (
                    <tr
                      key={inst._id}
                      className={`border-b border-border last:border-0 ${
                        inst.status === "overdue" ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="px-5 py-3 font-medium">
                        EMI {inst.installmentNumber}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {fmtDate(inst.dueDate)}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {fmt(inst.amount)}
                      </td>
                      <td className="px-5 py-3 text-emerald-600">
                        {fmt(inst.paidAmount)}
                      </td>
                      <td className="px-5 py-3 text-red-600">
                        {fmt(inst.remainingAmount)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={inst.status} />
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {fmtDate(inst.paidDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PAYMENT HISTORY */}
      {activeTab === "payments" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {payments.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No payments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b border-border bg-secondary/30">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">#</th>
                    <th className="px-5 py-3 text-left font-medium">Receipt</th>
                    <th className="px-5 py-3 text-left font-medium">Amount</th>
                    <th className="px-5 py-3 text-left font-medium">Method</th>
                    <th className="px-5 py-3 text-left font-medium">Txn ID</th>
                    <th className="px-5 py-3 text-left font-medium">Date</th>
                    <th className="px-5 py-3 text-left font-medium">By</th>
                    <th className="px-5 py-3 text-left font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30"
                    >
                      <td className="px-5 py-3 text-muted-foreground">
                        {p.paymentNumber}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {p.receiptNumber || "—"}
                      </td>
                      <td className="px-5 py-3 font-semibold text-emerald-700">
                        {fmt(p.amount)}
                      </td>
                      <td className="px-5 py-3 text-xs">{p.paymentMethod}</td>
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                        {p.transactionId || "—"}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {fmtDate(p.paidAt)}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {typeof p.recordedBy === "object"
                          ? (p.recordedBy as any)?.fullName
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground max-w-[120px] truncate">
                        {p.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* NOTES */}
      {activeTab === "notes" && (
        <div>
          <div className="mb-3 flex justify-end">
            <Button
              size="sm"
              className="bg-[#0037FF] text-white hover:bg-[#0028cc]"
              onClick={() => setShowNoteModal(true)}
            >
              <Plus size={14} />
              Add Note
            </Button>
          </div>
          {notes.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
              No notes yet. Add the first note.
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div
                  key={n._id}
                  className="rounded-xl border border-border bg-card px-5 py-4"
                >
                  <p className="text-sm">{n.note}</p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-medium">
                      {n.addedBy?.fullName ?? "Unknown"}
                    </span>
                    <span>·</span>
                    <span className="capitalize">
                      {n.addedBy?.role ?? "staff"}
                    </span>
                    <span>·</span>
                    <span>{fmtDateTime(n.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FOLLOW-UPS */}
      {activeTab === "followups" && (
        <div>
          <div className="mb-3 flex justify-end">
            <Button
              size="sm"
              className="bg-[#0037FF] text-white hover:bg-[#0028cc]"
              onClick={() => {
                setEditFollowUp(undefined);
                setShowFollowUpModal(true);
              }}
            >
              <Plus size={14} />
              Add Follow-up
            </Button>
          </div>
          {followUps.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
              No follow-ups yet.
            </div>
          ) : (
            <div className="space-y-3">
              {followUps.map((f) => (
                <div
                  key={f._id}
                  className={`rounded-xl border bg-card px-5 py-4 ${
                    f.status === "completed"
                      ? "border-emerald-200 opacity-70"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusPill status={f.callStatus} />
                        <StatusPill status={f.status} />
                      </div>
                      {f.remarks && (
                        <p className="mt-2 text-sm">{f.remarks}</p>
                      )}
                      <div className="mt-2 grid grid-cols-2 gap-x-4 text-[11px] text-muted-foreground sm:grid-cols-3">
                        {f.nextFollowUpDate && (
                          <span>
                            Next: {" "}
                            <span className="text-amber-600 font-medium">
                              {fmtDateTime(f.nextFollowUpDate)}
                            </span>
                          </span>
                        )}
                        {f.expectedPaymentDate && (
                          <span>
                            Exp. Payment: {fmtDateTime(f.expectedPaymentDate)}
                          </span>
                        )}
                        {f.expectedAmount && (
                          <span>
                            Exp. Amount:{" "}
                            <span className="font-medium text-emerald-600">
                              {fmt(f.expectedAmount)}
                            </span>
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        By {f.createdBy?.fullName ?? "Unknown"} ·{" "}
                        {fmtDateTime(f.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {f.status !== "completed" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => {
                              setEditFollowUp(f);
                              setShowFollowUpModal(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-[11px] text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => markFollowUpDone(f)}
                          >
                            Done
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showPaymentModal && studentId && (
  <AddPaymentModal
    studentId={studentId}
    installments={installments}
    feeMode={fee?.paymentMode}
    onClose={() => setShowPaymentModal(false)}
    onSuccess={loadDetails}
  />
)}
      {showNoteModal && studentId && (
        <AddNoteModal
          studentId={studentId}
          onClose={() => setShowNoteModal(false)}
          onSuccess={loadDetails}
        />
      )}
      {showFollowUpModal && studentId && (
        <AddFollowUpModal
          studentId={studentId}
          existing={editFollowUp}
          onClose={() => {
            setShowFollowUpModal(false);
            setEditFollowUp(undefined);
          }}
          onSuccess={loadDetails}
        />
      )}
    </AdminLayout>
  );
};

export default FeeCollectionDetail;