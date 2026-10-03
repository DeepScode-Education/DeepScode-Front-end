import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, MessageCircle, Mail, Users,
  Calendar, Clock, CheckSquare, Square, FileText,
  Star, TrendingUp, AlertTriangle, Download, Pencil, X, Save,
  Flag, Video, MapPin, CalendarIcon,
} from "lucide-react";
import CounsellorLayout from "../../components/CounsellorLayout";
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
import { StatusBadge } from "../../components/DataTable";
import { useLeadDetail } from "../../hooks/useLeadDetail";
import { ParentInfoCard } from "../ParentInfoCard";
import { FeeHistoryCard } from "../FeeHistoryCard";

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

const STATUS_OPTIONS = ["new", "contacted", "interested", "follow-up", "lost"];

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  new: "neutral",
  contacted: "warning",
  interested: "success",
  "follow-up": "warning",
  converted: "success",
  lost: "danger",
};

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

// ── Shared shadcn date + time picker ──────────────────────────────────────
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

const CounsellorLeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    lead, followUps, timeline, timelineLoading, loading,
    updateStatus, addFollowUp, updateObjections,
    updateLeadDetails, updatePaymentPlan, updateParentInfo,
    requestConversion, updateDemo, markLost, updateLeadInfo,
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

  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    fullName: "", mobileNumber: "", email: "", course: "", source: "", remarks: "",
    feesMin: "", feesMax: "", leadHealth: "Untouched",
  });
  const [savingInfo, setSavingInfo] = useState(false);
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

  // ── Conversion request state ──────────────────────────────────────────────
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [convertNote, setConvertNote] = useState("");
  const [convertFee, setConvertFee] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [convertMessage, setConvertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

 
const openFollowUpForm = () => {
  setFormData({
    contactedBy: getCurrentUserName(),
    communicationType: "call",
    note: "",
    nextFollowUpDate: "",
    nextFollowUpTime: "",
  });
  setShowForm(true);
};

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
    setCheckedObjections(lead.objections ?? []);
  }, [lead]);

  const handleStatusChange = async (newStatus: string) => {
    setStatusChanging(true);
    await updateStatus(newStatus as any);
    setStatusChanging(false);
  };

  const buildNextFollowUpISO = () => {
  if (!formData.nextFollowUpDate && !formData.nextFollowUpTime) return undefined;
  const datePart = formData.nextFollowUpDate || new Date().toISOString().slice(0, 10);
  const timePart = formData.nextFollowUpTime || "09:00";
  return new Date(`${datePart}T${timePart}`).toISOString();
};

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

  const toggleObjection = async (obj: string) => {
    const next = checkedObjections.includes(obj)
      ? checkedObjections.filter((o) => o !== obj)
      : [...checkedObjections, obj];
    setCheckedObjections(next);
    await updateObjections(next);
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

  const handleRequestConversion = async () => {
    setRequesting(true);
    setConvertMessage(null);
    try {
      const result = await requestConversion({
        note: convertNote.trim() || undefined,
        finalFee: convertFee ? Number(convertFee) : undefined,
      });
      if (result.success) {
        setConvertMessage({ type: "success", text: result.message || "Conversion request submitted." });
        setShowConvertConfirm(false);
        setConvertNote("");
        setConvertFee("");
      } else {
        setConvertMessage({ type: "error", text: result.message || "Failed to submit conversion request." });
      }
    } catch {
      setConvertMessage({ type: "error", text: "Network error — please try again." });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <CounsellorLayout title="Lead Detail" subtitle="">
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          Loading...
        </div>
      </CounsellorLayout>
    );
  }

  if (!lead) {
    return (
      <CounsellorLayout title="Lead Not Found" subtitle="">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-muted-foreground">Lead not found or not assigned to you.</p>
          <Button onClick={() => navigate("/counsellor/leads")}>Back to My Leads</Button>
        </div>
      </CounsellorLayout>
    );
  }

  const fees = lead.fees;
  const documents = lead.documents ?? [];
  const alreadyConverted = lead.leadStatus === "converted";
  const isLost = lead.leadStatus === "lost";
  const leadAny = lead as any;
  const currentHealth = (leadAny.leadHealth || "Untouched") as string;
  const healthMeta = HEALTH_META[currentHealth] || HEALTH_META.Untouched;
  const conversionRequest = lead.conversionRequest;
  const hasPendingRequest = conversionRequest?.status === "pending";

  return (
    <CounsellorLayout
      title={lead.fullName}
      subtitle={`Lead #${lead._id.slice(-6).toUpperCase()} · ${getCourseTitle(lead.course)}`}
      actions={
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </Button>
      }
    >
      {/* ── Conversion status banners ──────────────────────────────────────── */}
      {convertMessage && (
        <div
          className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
            convertMessage.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {convertMessage.text}
        </div>
      )}

      {hasPendingRequest && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4 flex items-center gap-3">
          <Clock size={18} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">
              Conversion Pending Approval
            </p>
            <p className="text-sm text-foreground">
              Submitted {conversionRequest?.requestedAt ? new Date(conversionRequest.requestedAt).toLocaleString("en-IN") : ""} — awaiting admin review.
            </p>
          </div>
        </div>
      )}

      {conversionRequest?.status === "rejected" && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4">
          <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">
            Conversion Rejected
          </p>
          <p className="text-sm text-foreground mt-0.5">{conversionRequest.rejectionReason || "No reason provided."}</p>
          <p className="text-xs text-muted-foreground mt-1">Update the lead details below and resubmit when ready.</p>
        </div>
      )}

      {/* ── Request Conversion dialog ──────────────────────────────────────── */}
      <Dialog open={showConvertConfirm} onOpenChange={(open) => { if (!requesting) setShowConvertConfirm(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Conversion to Student</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This sends <strong>{lead.fullName}</strong> to admin/super admin for approval.
            No student account is created until it's approved.
          </p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Final Fee (₹)</Label>
              <Input
                type="number"
                value={convertFee}
                onChange={(e) => setConvertFee(e.target.value)}
                placeholder="e.g. 45000"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Note for admin (optional)</Label>
              <Textarea
                value={convertNote}
                onChange={(e) => setConvertNote(e.target.value)}
                rows={3}
                placeholder="Anything admin should know before approving…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowConvertConfirm(false)} disabled={requesting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleRequestConversion} disabled={requesting}>
              {requesting ? "Submitting…" : "Submit Request"}
            </Button>
          </DialogFooter>
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
                <button onClick={() => setEditingInfo(true)} className="flex items-center gap-1 text-xs text-black font-bold hover:underline">
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
                <Row label="Course" value={<span className="text-white font-semibold">{typeof lead.course === "object"
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
                <Row label="Assigned To" value={lead.assignedTo ?? "You"} />
                <Row
                  label="Status"
                  value={<StatusBadge tone={STATUS_TONE[lead.leadStatus] ?? "neutral"}>{lead.leadStatus}</StatusBadge>}
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

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <Button
              className="w-full justify-start gap-2 bg-[#0037FF] hover:bg-[#0037FF]/20 text-gray-100"
              size="sm"
              onClick={() => setShowConvertConfirm(true)}
              disabled={alreadyConverted || hasPendingRequest}
            >
              <TrendingUp size={13} />
              {alreadyConverted ? "Already Converted" : hasPendingRequest ? "Request Pending" : "Request Conversion ★"}
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm" onClick={openFollowUpForm}>
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
                <button onClick={() => setEditingPayment(true)} className="flex items-center gap-1 text-xs text-black font-bold hover:underline">
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
                {lead.paymentPlan?.notes && <Row label="Notes" value={lead.paymentPlan.notes} />}
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
                <Field label="Notes">
                  <Textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    rows={2} />
                </Field>
              </div>
            )}
          </div>

          {/* Parent Information (shared component) */}
          <ParentInfoCard lead={lead} onSave={updateParentInfo} />

          {/* Fee Negotiation History (shared component) */}
          <FeeHistoryCard lead={lead} />

          {/* Demo Info Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <Video size={14} className="text-white" /> Demo Class
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
                <button onClick={() => setEditingDemo(true)} className="flex items-center gap-1 text-xs text-black hover:underline pt-1">
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
                <div className="flex gap-2 pt-1 text-white">
                  <Button size="sm" className="bg-red-500" onClick={() => setEditingDemo(false)} disabled={savingDemo}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSaveDemo(false)} disabled={savingDemo}>
                    {savingDemo ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSaveDemo(true)} disabled={savingDemo}>
                    Save & Mark Complete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Change Status — no Assign Counselor for counsellors */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Change Status</h3>
            <p className="text-[11px] text-muted-foreground">
              Conversion to student requires admin approval after you submit a request.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  disabled={statusChanging || lead.leadStatus === s}
                  onClick={() => handleStatusChange(s)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors
                    ${lead.leadStatus === s
                      ? "border-primary bg-[#0037FF] text-white-foreground"
                      : "border-border hover:bg-secondary"
                    }`}
                >
                  {s}
                </button>
              ))}
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
                    <CheckSquare size={15} className="text-white shrink-0" />
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
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <DateField
                        value={formData.nextFollowUpDate}
                        onChange={(d) => setFormData({ ...formData, nextFollowUpDate: d })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          nextFollowUpDate: new Date().toISOString().slice(0, 10),
                        })
                      }
                    >
                      Today
                    </Button>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Next Follow-up Time</Label>
                  <TimeField
                    value={formData.nextFollowUpTime}
                    onChange={(t) => setFormData({ ...formData, nextFollowUpTime: t })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end ">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button size="sm" className="text-white" disabled={saving} onClick={handleFollowUpSubmit}>
                  {saving ? "Saving..." : "Save Follow-up"}
                </Button>
              </div>
            </div>
          )}

          {!showForm && (
            <Button className="w-full text-gray-100" onClick={openFollowUpForm}>
              <Calendar size={14} /> Add Follow-up / Log Activity
            </Button>
          )}

          {/* Merged Activity Timeline (timeline + follow-ups) */}
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
                        <span className={`h-2 w-2 rounded-full ${entry.kind === "followup" ? "bg-[#0037FF]" : "bg-slate-400"}`} />
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
    </CounsellorLayout>
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

export default CounsellorLeadDetail;