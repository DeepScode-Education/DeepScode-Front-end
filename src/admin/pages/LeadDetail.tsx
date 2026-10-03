import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Phone, MessageCircle, Mail, Users,
  Calendar, Clock, CheckSquare, Square, FileText,
  TrendingUp, AlertTriangle, Download, Copy, Check,
  Pencil, X, Save, Flag, Video, MapPin, CheckCircle2, XCircle,
  Star, Wallet, CalendarIcon,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { StatusBadge } from "../components/DataTable";
import { useLeadDetail, type ConvertResult } from "../hooks/useLeadDetail";
import { ParentInfoCard } from "./ParentInfoCard";
import { FeeHistoryCard } from "./FeeHistoryCard";


const API_BASE = import.meta.env.VITE_API_BASE || "https://slateserver1.onrender.com";

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const COMM_ICON: Record<string, ReactNode> = {
  call: <Phone size={14} />,
  whatsapp: <MessageCircle size={14} />,
  email: <Mail size={14} />,
  meeting: <Users size={14} />,
};

const COMM_COLOR: Record<string, string> = {
  call: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  whatsapp: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  email: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  meeting: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const COMMUNICATION_TYPES = [
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
];

const STATUS_OPTIONS = ["new", "contacted", "interested", "follow-up"];

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  new: "neutral",
  contacted: "warning",
  interested: "success",
  "follow-up": "warning",
  converted: "success",
  lost: "danger",
};

const PRIORITY_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "low",    label: "Low",    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "high",   label: "High",   color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
];

const COURSE_OPTIONS = ["UiUX", "GraphicDesign", "MotionVFX", "3D", "Marketing", "Data"];
const SOURCE_OPTIONS = ["Manual", "Website", "WhatsApp", "Instagram", "Facebook", "Referral", "Other"];
const OBJECTIONS = ["High Fees", "Course Duration", "Placement Guarantee", "Schedule Conflict", "Needs Time"];

const LOST_REASON_OPTIONS = [
  ...OBJECTIONS,
  "Went with competitor",
  "Not interested anymore",
  "Unreachable",
  "Other",
];

const getCourseTitle = (course: string | { title: string }) =>
  typeof course === "string" ? course : course.title;

const formatLeadDateTime = (value: string | number | null | undefined) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Reads the logged-in user's name from localStorage so "Contacted By"
// doesn't need to be typed manually every time.
const getCurrentUserName = (): string => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.fullName || parsed?.name || "";
  } catch {
    return "";
  }
};

interface CounsellorOption {
  _id: string;
  fullName: string;
  email: string;
  isActive: boolean;
}

// ── Shared shadcn date + time picker ──────────────────────────────────────
// A Popover + Calendar for the date, paired with a plain time Input styled
// to match. Keeps the two fields visually and behaviourally consistent
// wherever a "next follow-up" / "scheduled at" pair is needed.
const DateField = ({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value: string; // yyyy-MM-dd
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 font-normal text-sm"
        >
          <CalendarIcon size={14} className="text-muted-foreground shrink-0" />
          {selected ? format(selected, "d MMM yyyy") : <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarPicker
          mode="single"
          selected={selected}
          onSelect={(date) => date && onChange(format(date, "yyyy-MM-dd"))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

const TimeField = ({
  value,
  onChange,
}: {
  value: string; // HH:mm
  onChange: (v: string) => void;
}) => (
  <div className="relative">
    <Clock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-8"
    />
  </div>
);

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    lead, followUps, timeline, timelineLoading, loading,
    updateStatus, assignCounselor, assignFeeCollectionCounsellor, requestConversion, approveConversion, rejectConversion,
    addFollowUp, updateLeadDetails, updatePriority, updateDemo, markLost, updatePaymentPlan,
    updateParentInfo, updateLeadInfo,
  } = useLeadDetail(id!);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    // contactedBy: "",
    contactedBy: getCurrentUserName(),
     communicationType: "call", note: "", nextFollowUpDate: "",
  nextFollowUpTime: "",  
  });
  const [saving, setSaving] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [checkedObjections, setCheckedObjections] = useState<string[]>([]);

  const [showAssign, setShowAssign] = useState(false);
  const [counsellors, setCounsellors] = useState<CounsellorOption[]>([]);
  const [counsellorsLoading, setCounsellorsLoading] = useState(false);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [assigning, setAssigning] = useState(false);

  // ── NEW: Fee Collection Counselor assignment state ─────────────────────────
  // Independent of the lead counsellor above. Reuses the same counsellors
  // list (loaded once via openAssignPanel / openFeeCollectorPanel).
  const [showAssignFeeCollector, setShowAssignFeeCollector] = useState(false);
  const [selectedFeeCollectorId, setSelectedFeeCollectorId] = useState("");
  const [feeCollectorReason, setFeeCollectorReason] = useState("");
  const [assigningFeeCollector, setAssigningFeeCollector] = useState(false);

  // ── Conversion workflow state ───────────────────────────────────────────────
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [approving, setApproving] = useState(false);

  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    fullName: "", mobileNumber: "", email: "", course: "", source: "", remarks: "",
    feesMin: "", feesMax: "",
    leadHealth: "Untouched",
  });
  const [savingInfo, setSavingInfo] = useState(false);

  const [priorityChanging, setPriorityChanging] = useState(false);
  const [healthChanging, setHealthChanging] = useState(false);

  const [editingDemo, setEditingDemo] = useState(false);
  const [demoForm, setDemoForm] = useState({
    demoScheduledAt: "", demoMode: "online", demoFeedback: "", demoRating: 0,
  });
  const [savingDemo, setSavingDemo] = useState(false);

  const [editingPayment, setEditingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    negotiatedAmount: "", mode: "full", emiMonths: "", downPayment: "", notes: "",
  });
  const [savingPayment, setSavingPayment] = useState(false);

  const [showLostModal, setShowLostModal] = useState(false);
  const [lostForm, setLostForm] = useState({ lostReason: "", competitor: "", remarks: "" });
  const [markingLost, setMarkingLost] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (!lead) return;
    setInfoForm({
      fullName: lead.fullName || "",
      mobileNumber: lead.mobileNumber || "",
      email: lead.email || "",
      course: getCourseTitle(lead.course),
      source: (lead as any).source || "",
      remarks: lead.remarks || "",
      feesMin: lead.fees?.min?.toString() ?? "",
      feesMax: lead.fees?.max?.toString() ?? "",
      leadHealth: (lead as any).leadHealth || "Untouched",
    });
    setDemoForm({
      demoScheduledAt: (lead as any).demoScheduledAt
        ? new Date((lead as any).demoScheduledAt).toISOString().slice(0, 16)
        : "",
      demoMode: (lead as any).demoMode || "online",
      demoFeedback: (lead as any).demoFeedback || "",
      demoRating: (lead as any).demoRating || 0,
    });
    setPaymentForm({
      negotiatedAmount: lead.fees?.negotiatedAmount?.toString() ?? "",
      mode: lead.paymentPlan?.mode ?? "full",
      emiMonths: lead.paymentPlan?.emiMonths?.toString() ?? "",
      downPayment: lead.paymentPlan?.downPayment?.toString() ?? "",
      notes: lead.paymentPlan?.notes ?? "",
    });
  }, [lead]);

  const handleStatusChange = async (
    newStatus: "new" | "contacted" | "interested" | "follow-up"
  ) => {
    setStatusChanging(true);
    await updateStatus(newStatus);
    setStatusChanging(false);
  };

  const loadCounsellorsIfNeeded = async () => {
    if (counsellors.length > 0) return;
    setCounsellorsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/staff?role=counsellor`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setCounsellors(data.data);
    } catch (err) {
      console.error("Failed to load counsellors", err);
    } finally {
      setCounsellorsLoading(false);
    }
  };

  const openAssignPanel = async () => {
    setShowAssign(true);
    await loadCounsellorsIfNeeded();
  };

  const handleAssign = async () => {
    if (!selectedCounsellorId) return;
    setAssigning(true);
    await assignCounselor(selectedCounsellorId, assignReason.trim() || undefined);
    setAssigning(false);
    setShowAssign(false);
    setSelectedCounsellorId("");
    setAssignReason("");
  };

  // ── NEW: Fee Collection Counselor panel handlers ────────────────────────────
  const openFeeCollectorPanel = async () => {
    setShowAssignFeeCollector(true);
    await loadCounsellorsIfNeeded();
  };

  const handleAssignFeeCollector = async () => {
    setAssigningFeeCollector(true);
    await assignFeeCollectionCounsellor(
      selectedFeeCollectorId || null,
      feeCollectorReason.trim() || undefined
    );
    setAssigningFeeCollector(false);
    setShowAssignFeeCollector(false);
    setSelectedFeeCollectorId("");
    setFeeCollectorReason("");
  };

  // ── Admin/Super Admin direct conversion (auto-approved server-side) ───────────
  const handleConvert = async () => {
    setConverting(true);
    const result = await requestConversion();
    setConverting(false);
    setConvertResult(result);
  };

  // ── Approve a counsellor's pending request ─────────────────────────────────
  const handleApprovePending = async () => {
    setApproving(true);
    const result = await approveConversion();
    setApproving(false);
    setConvertResult(result);
    setShowConvertConfirm(true); // reuse the same result modal
  };

  const handleRejectPending = async () => {
    if (!rejectReason.trim()) return;
    setRejecting(true);
    const result = await rejectConversion(rejectReason.trim());
    setRejecting(false);
    if (result.success) {
      setShowRejectModal(false);
      setRejectReason("");
    }
  };

  const copyTempPassword = () => {
    const pw = convertResult?.data?.tempPassword;
    if (!pw) return;
    navigator.clipboard.writeText(pw);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const buildNextFollowUpISO = () => {
  if (!formData.nextFollowUpDate && !formData.nextFollowUpTime) return undefined;
  const datePart = formData.nextFollowUpDate || new Date().toISOString().slice(0, 10);
  const timePart = formData.nextFollowUpTime || "09:00";
  return new Date(`${datePart}T${timePart}`).toISOString();
};

  // const handleFollowUpSubmit = async () => {
  //   if (!formData.contactedBy || !formData.note) return;
  //   setSaving(true);
  //   await addFollowUp(formData);
  //   setSaving(false);
  //   setShowForm(false);
  //   setFormData({ contactedBy: "", communicationType: "call", note: "", nextFollowUpDate: "" });
  // };

  const handleFollowUpSubmit = async () => {
  if (!formData.contactedBy || !formData.note) return;
  setSaving(true);
  await addFollowUp({
    contactedBy: formData.contactedBy,
    communicationType: formData.communicationType,
    note: formData.note,
    nextFollowUpDate: buildNextFollowUpISO(),
  });
  setSaving(false);
  setShowForm(false);
  setFormData({
    // contactedBy: "",
    contactedBy: getCurrentUserName(),
    communicationType: "call",
    note: "",
    nextFollowUpDate: "",
    nextFollowUpTime: "",
  });
};

  const toggleObjection = (obj: string) => {
    setCheckedObjections((prev) =>
      prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj]
    );
  };

  const handleSaveInfo = async () => {
    if (!infoForm.fullName.trim() || !infoForm.mobileNumber.trim()) return;
    setSavingInfo(true);
    await updateLeadDetails({
      fullName: infoForm.fullName.trim(),
      mobileNumber: infoForm.mobileNumber.trim(),
      email: infoForm.email.trim(),
      course: infoForm.course,
      source: infoForm.source,
      remarks: infoForm.remarks,
      leadHealth: infoForm.leadHealth,
    });
    // ── Save fee range separately via updateLeadInfo ──
    if (infoForm.feesMin || infoForm.feesMax) {
      await updateLeadInfo({
        fees: {
          min: infoForm.feesMin ? Number(infoForm.feesMin) : undefined,
          max: infoForm.feesMax ? Number(infoForm.feesMax) : undefined,
        },
      });
    }
    setSavingInfo(false);
    setEditingInfo(false);
  };

  const handlePriorityChange = async (priority: string) => {
    setPriorityChanging(true);
    await updatePriority(priority as "low" | "medium" | "high" | "urgent");
    setPriorityChanging(false);
  };

  const handleLeadHealthChange = async (leadHealth: string) => {
    setHealthChanging(true);
    await updateLeadDetails({ leadHealth });
    setHealthChanging(false);
  };

  const handleSaveDemo = async (markComplete = false) => {
    setSavingDemo(true);
    await updateDemo({
      demoScheduledAt: demoForm.demoScheduledAt ? new Date(demoForm.demoScheduledAt).toISOString() : null,
      demoMode: demoForm.demoMode,
      demoFeedback: demoForm.demoFeedback,
      demoRating: demoForm.demoRating || undefined,
      ...(markComplete ? { demoCompleted: true } : {}),
    });
    setSavingDemo(false);
    setEditingDemo(false);
  };

  const handleSavePayment = async () => {
    setSavingPayment(true);
    await updatePaymentPlan({
      negotiatedAmount: paymentForm.negotiatedAmount ? Number(paymentForm.negotiatedAmount) : undefined,
      mode: paymentForm.mode as "full" | "emi",
      emiMonths: paymentForm.emiMonths ? Number(paymentForm.emiMonths) : undefined,
      downPayment: paymentForm.downPayment ? Number(paymentForm.downPayment) : undefined,
      notes: paymentForm.notes,
    });
    setSavingPayment(false);
    setEditingPayment(false);
  };

  const handleMarkLost = async () => {
    setMarkingLost(true);
    await markLost(lostForm);
    setMarkingLost(false);
    setShowLostModal(false);
    setLostForm({ lostReason: "", competitor: "", remarks: "" });
  };

  const LEAD_HEALTH_OPTIONS = [
  "Untouched",
  "Hot",
  "Warm",
  "Cold",
  "Dead",
  "Fake",
  "Not picked",
  "Not reachable",
  "Collaboration",
] as const;

const HEALTH_META: Record<string, { emoji: string; color: string }> = {
  Untouched: {
    emoji: "⚪",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  Hot: {
    emoji: "🟢",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  Warm: {
    emoji: "🟠",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  Cold: {
    emoji: "🔵",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  Dead: {
    emoji: "⚫",
    color: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  },
  Fake: {
    emoji: "🟣",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  "Not picked": {
    emoji: "🟡",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  "Not reachable": {
    emoji: "🔴",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  Collaboration: {
    emoji: "🔷",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
};


  if (loading) {
    return (
      <AdminLayout title="Lead Detail" subtitle="">
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          Loading...
        </div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout title="Lead Not Found" subtitle="">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-muted-foreground">This lead does not exist.</p>
          <Button onClick={() => navigate(location.state?.from || "/admin/leads")}>Back to Leads</Button>
        </div>
      </AdminLayout>
    );
  }

  const fees = lead.fees;
  const parentInfo = lead.parentInfo;
  const documents = lead.documents ?? [];
  const alreadyConverted = lead.leadStatus === "converted";
  const isLost = lead.leadStatus === "lost";
  const leadAny = lead as any;
  const currentPriority = leadAny.priority || "medium";
  const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === currentPriority) || PRIORITY_OPTIONS[1];
  const currentHealth = (leadAny.leadHealth || "Untouched") as string;
  const healthMeta = HEALTH_META[currentHealth] || HEALTH_META.Untouched;

  const conversionRequest = lead.conversionRequest;
  const requestedByCounsellor =
    conversionRequest?.status === "pending" &&
    typeof conversionRequest.requestedBy === "object" &&
    (conversionRequest.requestedBy as any)?.role === "counsellor";
  const hasPendingFromCounsellor = requestedByCounsellor;

  return (
    <AdminLayout
      title={lead.fullName}
      subtitle={`Lead #${lead._id.slice(-6).toUpperCase()} · ${getCourseTitle(lead.course)}`}
      actions={
        <div className="flex items-center gap-2">
          <Select value={currentPriority} disabled={priorityChanging} onValueChange={handlePriorityChange}>
            <SelectTrigger className={`h-auto rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${priorityMeta.color}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label} priority</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/leads")}>
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      }
    >
      {/* ── Pending counsellor conversion request banner ───────────────────── */}
      {hasPendingFromCounsellor && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">
                Conversion Request Pending Your Approval
              </p>
              <p className="text-sm text-foreground mt-0.5">
                Requested by {(conversionRequest!.requestedBy as any)?.fullName || "a counsellor"}
                {conversionRequest?.finalFee ? ` — final fee ₹${conversionRequest.finalFee.toLocaleString("en-IN")}` : ""}
              </p>
              {conversionRequest?.requestNote && (
                <p className="text-xs text-muted-foreground mt-1">"{conversionRequest.requestNote}"</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowRejectModal(true)}
              >
                <XCircle size={14} /> Reject
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleApprovePending}
                disabled={approving}
              >
                <CheckCircle2 size={14} /> {approving ? "Approving…" : "Approve & Create Student"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {conversionRequest?.status === "rejected" && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4">
          <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">
            Last Conversion Request Rejected
          </p>
          <p className="text-sm text-foreground mt-0.5">{conversionRequest.rejectionReason}</p>
        </div>
      )}

      {/* ── Reject modal ───────────────────────────────────────────────────── */}
      <Dialog open={showRejectModal} onOpenChange={(open) => { if (!rejecting) setShowRejectModal(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Reject Conversion Request</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Reason for rejecting this request…"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)} disabled={rejecting}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleRejectPending}
              disabled={rejecting || !rejectReason.trim()}
            >
              {rejecting ? "Rejecting…" : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Convert to Student confirm/result dialog ──────────────────────── */}
      <Dialog
        open={showConvertConfirm}
        onOpenChange={(open) => {
          if (!converting) {
            setShowConvertConfirm(open);
            if (!open) setConvertResult(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {!convertResult ? (
            <>
              <DialogHeader>
                <DialogTitle>Convert to Student?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                This creates a real student account for <strong>{lead.fullName}</strong> (or links
                one if {lead.email ? "this email" : "this lead"} already has an account), generates
                a Student ID, creates the enrollment, and marks this lead as converted.
              </p>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setShowConvertConfirm(false)} disabled={converting}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleConvert} disabled={converting}>
                  {converting ? "Converting..." : "Yes, Convert"}
                </Button>
              </DialogFooter>
            </>
          ) : convertResult.success ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-emerald-600">✅ {convertResult.message}</DialogTitle>
              </DialogHeader>
              {convertResult.data?.student && (
                <div className="mt-1 space-y-2 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                  <Row label="Student ID" value={convertResult.data.student.studentId} />
                  <Row label="Email" value={convertResult.data.student.email} />
                  {convertResult.data.tempPassword && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Temp Password</span>
                      <button
                        onClick={copyTempPassword}
                        className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 font-mono text-xs hover:bg-secondary/80"
                      >
                        {convertResult.data.tempPassword}
                        {copiedPassword ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {convertResult.data?.tempPassword && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Share this password with the student securely — it won't be shown again.
                </p>
              )}
              <DialogFooter>
                <Button size="sm" onClick={() => { setShowConvertConfirm(false); setConvertResult(null); }}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-destructive">Conversion failed</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{convertResult.message}</p>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setConvertResult(null)}>
                  Try Again
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Mark as Lost modal ──────────────────────────────────────────────── */}
      <Dialog open={showLostModal} onOpenChange={(open) => { if (!markingLost) setShowLostModal(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Mark Lead as Lost</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Reason</Label>
              <Select value={lostForm.lostReason} onValueChange={(v) => setLostForm({ ...lostForm, lostReason: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {LOST_REASON_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Competitor (if applicable)</Label>
              <Input
                value={lostForm.competitor}
                onChange={(e) => setLostForm({ ...lostForm, competitor: e.target.value })}
                placeholder="e.g. Another academy name"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Remarks</Label>
              <Textarea
                value={lostForm.remarks}
                onChange={(e) => setLostForm({ ...lostForm, remarks: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowLostModal(false)} disabled={markingLost}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleMarkLost}
              disabled={markingLost}
            >
              {markingLost ? "Saving..." : "Confirm Lost"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left Column ── */}
        <div className="space-y-4 lg:col-span-1">

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Lead Health</h3>
              <Select value={currentHealth} disabled={healthChanging} onValueChange={handleLeadHealthChange}>
                <SelectTrigger className={`h-auto rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${healthMeta.color}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_HEALTH_OPTIONS.map((health) => (
                    <SelectItem key={health} value={health}>
                      {HEALTH_META[health].emoji} {health}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Lead Information</h3>
              {!editingInfo ? (
                <button onClick={() => setEditingInfo(true)} className="flex items-center gap-1 text-xs text-[#0037FF] hover:underline">
                  <Pencil size={12} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={handleSaveInfo} disabled={savingInfo} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
                    <Save size={12} /> {savingInfo ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditingInfo(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {!editingInfo ? (
              <div className="space-y-2 text-sm">
                <Row label="Name" value={lead.fullName} />
                <Row label="Mobile" value={lead.mobileNumber} />
                <Row label="Email" value={lead.email || "Not added"} />
                <Row label="Course" value={<span className="text-[#0037FF] font-semibold">{typeof lead.course === "object"
  ? lead.course?.title
  : lead.course}</span>} />
                <Row label="Source" value={leadAny.source || "—"} />
                <Row
                  label="Fees"
                  value={
                    <div className="text-right">
                      <div>
                        {fees && (fees.min || fees.max)
                          ? `₹${(fees.min ?? 0).toLocaleString("en-IN")} – ₹${(fees.max ?? 0).toLocaleString("en-IN")}`
                          : "Range not set"}
                      </div>
                      {fees?.negotiatedAmount ? (
                        <div className="text-xs text-emerald-600 font-semibold">
                          Negotiated: ₹{fees.negotiatedAmount.toLocaleString("en-IN")}
                        </div>
                      ) : null}
                    </div>
                  }
                />
                <Row label="Assigned To" value={lead.assignedTo ?? "Unassigned"} />
                {/* NEW: Fee Collection Counselor shown in read-only info list */}
                <Row
                  label="Fee Collection Counselor"
                  value={leadAny.feeCollectionCounsellor ?? "Unassigned"}
                />
                <Row
                  label="Status"
                  value={<StatusBadge tone={STATUS_TONE[lead.leadStatus] ?? "neutral"}>{lead.leadStatus}</StatusBadge>}
                />
                <Row
  label="Lead Health"
  value={`${HEALTH_META[leadAny.leadHealth || "Untouched"].emoji} ${
    leadAny.leadHealth || "Untouched"
  }`}
/>
                <Row
                  label="Next Follow-up"
                  value={lead.nextFollowUpDate ? formatLeadDateTime(lead.nextFollowUpDate) : "Not set"}
                />
                <Row label="Remarks" value={lead.remarks || "—"} />
                <Row label="Created" value={new Date(lead.createdAt).toLocaleDateString("en-IN")} />
              </div>
            ) : (
              <div className="space-y-2.5">
                <Field label="Name">
                  <Input value={infoForm.fullName} onChange={(e) => setInfoForm({ ...infoForm, fullName: e.target.value })} />
                </Field>
                <Field label="Mobile">
                  <Input value={infoForm.mobileNumber} onChange={(e) => setInfoForm({ ...infoForm, mobileNumber: e.target.value })} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })} />
                </Field>
                <Field label="Course">
                  <Select value={infoForm.course} onValueChange={(v) => setInfoForm({ ...infoForm, course: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COURSE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Source">
                  <Select value={infoForm.source} onValueChange={(v) => setInfoForm({ ...infoForm, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>


        <Field label="Lead Health">
          <Select value={infoForm.leadHealth} onValueChange={(v) => setInfoForm({ ...infoForm, leadHealth: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LEAD_HEALTH_OPTIONS.map((h) => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>


                <Field label="Fees Min (₹)">
                  <Input type="number" value={infoForm.feesMin}
                    onChange={(e) => setInfoForm({ ...infoForm, feesMin: e.target.value })} />
                </Field>
                <Field label="Fees Max (₹)">
                  <Input type="number" value={infoForm.feesMax}
                    onChange={(e) => setInfoForm({ ...infoForm, feesMax: e.target.value })} />
                </Field>
                <Field label="Remarks">
                  <Textarea value={infoForm.remarks} onChange={(e) => setInfoForm({ ...infoForm, remarks: e.target.value })}
                    rows={2} />
                </Field>
              </div>
            )}
          </div>

          {/* Workflow Actions */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold mb-3">Workflow Actions</h3>
            <Button
              className="w-full justify-start gap-2 bg-[#0037FF] hover:bg-[#0037FF]/90 text-white"
              size="sm"
              onClick={() => setShowConvertConfirm(true)}
              disabled={alreadyConverted || hasPendingFromCounsellor}
            >
              <TrendingUp size={13} />
              {alreadyConverted ? "Already Converted" : "Convert to Student ★"}
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => setShowForm(true)}>
              <Calendar size={13} /> Schedule Follow-up
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={() => setEditingDemo(true)}>
              <Video size={13} /> Schedule / Update Demo
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
              size="sm"
              onClick={() => setShowLostModal(true)}
              disabled={isLost}
            >
              <AlertTriangle size={13} /> {isLost ? "Already Lost" : "Mark as Lost"}
            </Button>
          </div>

          {/* Fee Negotiation / Payment Plan */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Fee &amp; Payment Plan</h3>
              {!editingPayment ? (
                <button onClick={() => setEditingPayment(true)} className="flex items-center gap-1 text-xs text-[#0037FF] hover:underline">
                  <Pencil size={12} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={handleSavePayment} disabled={savingPayment} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
                    <Save size={12} /> {savingPayment ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditingPayment(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            {!editingPayment ? (
              <div className="space-y-2 text-sm">
                <Row label="Negotiated Amount" value={fees?.negotiatedAmount ? `₹${fees.negotiatedAmount.toLocaleString("en-IN")}` : "Not negotiated"} />
                <Row label="Payment Mode" value={lead.paymentPlan?.mode?.toUpperCase() || "—"} />
                {lead.paymentPlan?.mode === "emi" && <Row label="EMI Months" value={lead.paymentPlan?.emiMonths ?? "—"} />}
                <Row label="Down Payment" value={lead.paymentPlan?.downPayment ? `₹${lead.paymentPlan.downPayment.toLocaleString("en-IN")}` : "—"} />
              </div>
            ) : (
              <div className="space-y-2.5">
                <Field label="Amount (₹)">
                  <Input type="number" value={paymentForm.negotiatedAmount} onChange={(e) => setPaymentForm({ ...paymentForm, negotiatedAmount: e.target.value })} />
                </Field>
                <Field label="Payment Mode">
                  <Select value={paymentForm.mode} onValueChange={(v) => setPaymentForm({ ...paymentForm, mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Payment</SelectItem>
                      <SelectItem value="emi">EMI</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {paymentForm.mode === "emi" && (
                  <Field label="EMI Months">
                    <Input type="number" value={paymentForm.emiMonths} onChange={(e) => setPaymentForm({ ...paymentForm, emiMonths: e.target.value })} />
                  </Field>
                )}
                <Field label="Down Payment (₹)">
                  <Input type="number" value={paymentForm.downPayment} onChange={(e) => setPaymentForm({ ...paymentForm, downPayment: e.target.value })} />
                </Field>
              </div>
            )}
          </div>

          {/* ── NEW: Parent Information (shared component) ── */}
          <ParentInfoCard lead={lead} onSave={updateParentInfo} />

          {/* ── NEW: Fee Negotiation History (shared component) ── */}
          <FeeHistoryCard lead={lead} />

          {/* Demo Info Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <Video size={14} className="text-[#0037FF]" /> Demo Class
              </h3>
              {leadAny.demoCompleted && (
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold px-2 py-0.5">
                  Completed
                </span>
              )}
            </div>

            {!editingDemo ? (
              <div className="space-y-2 text-sm">
                <Row
                  label="Scheduled"
                  value={leadAny.demoScheduledAt ? formatLeadDateTime(leadAny.demoScheduledAt) : "Not scheduled"}
                />
                <Row label="Mode" value={leadAny.demoMode || "—"} />
                {leadAny.demoRating ? <Row label="Rating" value={`${leadAny.demoRating}/5 ⭐`} /> : null}
                {leadAny.demoFeedback ? <Row label="Feedback" value={leadAny.demoFeedback} /> : null}
                <button onClick={() => setEditingDemo(true)} className="flex items-center gap-1 text-xs text-[#0037FF] hover:underline pt-1">
                  <Pencil size={12} /> Edit demo info
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <Field label="Scheduled date">
                  <DateField
                    value={demoForm.demoScheduledAt ? demoForm.demoScheduledAt.slice(0, 10) : ""}
                    onChange={(d) => {
                      const time = demoForm.demoScheduledAt ? demoForm.demoScheduledAt.slice(11, 16) : "09:00";
                      setDemoForm({ ...demoForm, demoScheduledAt: `${d}T${time}` });
                    }}
                  />
                </Field>
                <Field label="Scheduled time">
                  <TimeField
                    value={demoForm.demoScheduledAt ? demoForm.demoScheduledAt.slice(11, 16) : ""}
                    onChange={(t) => {
                      const datePart = demoForm.demoScheduledAt ? demoForm.demoScheduledAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
                      setDemoForm({ ...demoForm, demoScheduledAt: `${datePart}T${t}` });
                    }}
                  />
                </Field>
                <Field label="Mode">
                  <Select value={demoForm.demoMode} onValueChange={(v) => setDemoForm({ ...demoForm, demoMode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Feedback">
                  <Textarea value={demoForm.demoFeedback} onChange={(e) => setDemoForm({ ...demoForm, demoFeedback: e.target.value })}
                    rows={2} />
                </Field>
                <Field label="Rating (1–5)">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setDemoForm({ ...demoForm, demoRating: n })} className="p-0.5">
                        <Star size={18} className={n <= demoForm.demoRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"} />
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setEditingDemo(false)} disabled={savingDemo}>
                    Cancel
                  </Button>
                  <Button className="text-white" size="sm" onClick={() => handleSaveDemo(false)} disabled={savingDemo}>
                    {savingDemo ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSaveDemo(true)} disabled={savingDemo}>
                    Save & Mark Complete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Change Status */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Change Status</h3>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  disabled={statusChanging || lead.leadStatus === s}
                  onClick={() => handleStatusChange(s as any)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors
                    ${lead.leadStatus === s
                      ? "border-primary bg-[#0037FF] text-white"
                      : "border-border hover:bg-secondary"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Assign Counselor — admin/super_admin only */}
            <div className="pt-2 space-y-1.5">
              <p className="text-xs text-muted-foreground">Assign Counselor</p>
              {showAssign ? (
                <div className="space-y-2">
                  {counsellorsLoading ? (
                    <p className="text-xs text-muted-foreground">Loading counsellors...</p>
                  ) : (
                    <Select value={selectedCounsellorId} onValueChange={setSelectedCounsellorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a counsellor" />
                      </SelectTrigger>
                      <SelectContent>
                        {counsellors.map((c) => (
                          <SelectItem key={c._id} value={c._id} disabled={!c.isActive}>
                            {c.fullName}{!c.isActive ? " (inactive)" : ""}
                          </SelectItem>
                        ))}
                        {counsellors.length === 0 && <SelectItem value="__none" disabled>No counsellors found</SelectItem>}
                      </SelectContent>
                    </Select>
                  )}
                  <Input
                    value={assignReason}
                    onChange={(e) => setAssignReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleAssign} disabled={!selectedCounsellorId || assigning}>
                      {assigning ? "Assigning..." : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAssign(false)}>✕</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={openAssignPanel}>
                  <Users size={13} />
                  {lead.assignedTo ? `Re-assign (${lead.assignedTo})` : "Assign Counselor"}
                </Button>
              )}
            </div>

            {/* ── NEW: Assign Fee Collection Counselor — independent assignment ── */}
            <div className="pt-3 mt-3 border-t border-border space-y-1.5">
              <p className="text-xs text-muted-foreground">Assign Fee Collection Counselor</p>
              {showAssignFeeCollector ? (
                <div className="space-y-2">
                  {counsellorsLoading ? (
                    <p className="text-xs text-muted-foreground">Loading counsellors...</p>
                  ) : (
                    <Select value={selectedFeeCollectorId} onValueChange={setSelectedFeeCollectorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unassign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassign</SelectItem>
                        {counsellors.map((c) => (
                          <SelectItem key={c._id} value={c._id} disabled={!c.isActive}>
                            {c.fullName}{!c.isActive ? " (inactive)" : ""}
                          </SelectItem>
                        ))}
                        {counsellors.length === 0 && <SelectItem value="__none" disabled>No counsellors found</SelectItem>}
                      </SelectContent>
                    </Select>
                  )}
                  <Input
                    value={feeCollectorReason}
                    onChange={(e) => setFeeCollectorReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleAssignFeeCollector} disabled={assigningFeeCollector}>
                      {assigningFeeCollector ? "Saving..." : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAssignFeeCollector(false)}>✕</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={openFeeCollectorPanel}>
                  <Wallet size={13} />
                  {leadAny.feeCollectionCounsellor
                    ? `Re-assign (${leadAny.feeCollectionCounsellor})`
                    : "Assign Fee Collection Counselor"}
                </Button>
              )}
            </div>
          </div>

          {/* Objection Tracker */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Objection Tracker</h3>
            <div className="space-y-2">
              {OBJECTIONS.map((obj) => (
                <button
                  key={obj}
                  onClick={() => toggleObjection(obj)}
                  className="flex w-full items-center gap-2 text-sm hover:text-foreground text-muted-foreground transition-colors"
                >
                  {checkedObjections.includes(obj) ? (
                    <CheckSquare size={15} className="text-[#0037FF] shrink-0" />
                  ) : (
                    <Square size={15} className="shrink-0" />
                  )}
                  {obj}
                  {checkedObjections.includes(obj) && <AlertTriangle size={11} className="ml-auto text-amber-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Documents ({documents.length})</h3>
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <FileText size={16} className="text-red-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <Download size={13} className="text-muted-foreground shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-4 lg:col-span-2">

          {lead.nextFollowUpDate && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-amber-500" />
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">
                    Next Follow-Up
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatLeadDateTime(lead.nextFollowUpDate)}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-500 text-white text-xs px-3 py-1 font-semibold">Scheduled</span>
            </div>
          )}

          {isLost && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 mt-0.5" />
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">Lead Lost</p>
                {leadAny.lostReason && <p className="text-sm text-foreground">Reason: {leadAny.lostReason}</p>}
                {leadAny.competitor && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> Went with: {leadAny.competitor}
                  </p>
                )}
              </div>
            </div>
          )}

          {showForm && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Add Follow-up</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Contacted By *</Label>
                  <Input
                    value={formData.contactedBy}
                    onChange={(e) => setFormData({ ...formData, contactedBy: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Type *</Label>
                  <Select value={formData.communicationType} onValueChange={(v) => setFormData({ ...formData, communicationType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COMMUNICATION_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground mb-1 block">Notes *</Label>
                  <Textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="What happened in this interaction..."
                    rows={3}
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Next Follow-up Date</Label>
                  <DateField
                    value={formData.nextFollowUpDate}
                    onChange={(d) => setFormData({ ...formData, nextFollowUpDate: d })}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Next Follow-up Time</Label>
                  <TimeField
                    value={formData.nextFollowUpTime}
                    onChange={(t) => setFormData({ ...formData, nextFollowUpTime: t })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button size="sm" className="text-white" disabled={saving} onClick={handleFollowUpSubmit}>
                  {saving ? "Saving..." : "Save Follow-up"}
                </Button>
              </div>
            </div>
          )}

          {!showForm && (
            <Button className="w-full text-white" onClick={() => setShowForm(true)}>
              <Calendar size={14} /> Add Follow-up / Log Activity
            </Button>
          )}

          {/* Real Activity Timeline (timeline + follow-ups merged) */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Activity Timeline</h3>
            {timelineLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading timeline...</div>
            ) : timeline.length === 0 && followUps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm gap-2">
                <Clock size={28} className="opacity-40" />
                <p>No activity yet. Add the first follow-up!</p>
              </div>
            ) : (
              <ol className="relative border-l border-border ml-3 space-y-0">
                {[
                  ...timeline.map((t) => ({
                    key: `tl-${t._id}`,
                    date: t.createdAt,
                    kind: "timeline" as const,
                    data: t,
                  })),
                  ...followUps.map((f) => ({
                    key: `fu-${f._id}`,
                    date: f.createdAt,
                    kind: "followup" as const,
                    data: f,
                  })),
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <li key={entry.key} className="mb-6 ml-5">
                      <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border">
                        <span className={`h-2 w-2 rounded-full ${entry.kind === "followup" ? "bg-[#0037FF] text-white" : "bg-slate-400"}`} />
                      </span>

                      {entry.kind === "followup" ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            {(entry.data as any).communicationType && (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${COMM_COLOR[(entry.data as any).communicationType] ?? "bg-secondary text-foreground"}`}>
                                {COMM_ICON[(entry.data as any).communicationType]}
                                {(entry.data as any).communicationType.charAt(0).toUpperCase() + (entry.data as any).communicationType.slice(1)}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {entry.date
                                ? new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                : "—"}
                            </span>
                            {(entry.data as any).contactedBy && (
                              <span className="text-xs text-muted-foreground">· by {(entry.data as any).contactedBy}</span>
                            )}
                          </div>
                          <p className="text-sm text-foreground">{(entry.data as any).note ?? ""}</p>
                          {(entry.data as any).nextFollowUpDate && (
                            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar size={11} />
                              Next: {formatLeadDateTime((entry.data as any).nextFollowUpDate)}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                              <Flag size={11} />
                              {((entry.data as any).action ?? "activity").replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entry.date
                                ? new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                : "—"}
                            </span>
                            {(entry.data as any).performedBy &&
                              typeof (entry.data as any).performedBy === "object" &&
                              (entry.data as any).performedBy?.fullName && (
                                <span className="text-xs text-muted-foreground">
                                  · by {(entry.data as any).performedBy.fullName}
                                </span>
                              )}
                          </div>
                          <p className="text-sm text-foreground">
                            {(entry.data as any).description ?? "No description"}
                          </p>
                        </>
                      )}
                    </li>
                  ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex items-start justify-between gap-2">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="text-right font-medium">{value}</span>
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
    {children}
  </div>
);

export default LeadDetail;