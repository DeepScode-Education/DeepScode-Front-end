// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Loader2,
//   IdCard,
//   GraduationCap,
//   UserPlus,
//   Plus,
//   Wallet,
//   X,
//   IndianRupee,
//   History,
//   Pencil,
//   Save,
//   CheckCircle2,
//   CalendarClock,
//   AlertTriangle,
// } from "lucide-react";
// import AdminLayout from "../components/AdminLayout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import {
//   adminStudentApi,
//   coursesApi,
//   mentorApi,
//   assignmentApi,
//   feeApi,
//   paymentApi,
//   studentApprovalApi,
//   type Course,
//   type Mentor,
//   type AdminStudentDetails,
//   type PaymentRecord,
//   type UpdateStudentProfilePayload,
// } from "../../integrations/client";
// import { FileCheck2, AlertOctagon } from "lucide-react";
// import { adminDocumentApi, type DocumentSlotKey, type StudentDocumentApiRecord } from "../../integrations/client";
// import { UserCog } from "lucide-react";
// import { useCounsellors } from "../hooks/useLeads";
// import { feeInstallmentApi } from "../../integrations/client";
// import { Layers } from "lucide-react";
// import { DatePicker } from "@/components/DatePicker";


// const DOC_SLOTS: { key: DocumentSlotKey; label: string }[] = [
//   { key: "aadhaar", label: "Aadhaar Card" },
//   { key: "pan", label: "PAN Card" },
//   { key: "resume", label: "Resume" },
//   { key: "offer_letter", label: "Offer Letter" },
//   { key: "passport_photo", label: "Passport Size Photo" },
//   { key: "course_certificate", label: "Course Certificate" },
// ];

// const PAYMENT_METHODS = ["UPI", "Cash", "Bank Transfer", "Card", "Cheque", "Other"] as const;
// const GOVT_ID_TYPES = ["Aadhaar", "PAN", "Driving License", "Passport"] as const;

// const BATCH_DAYS_OPTIONS = ["MTW", "MWT", "MTT", "SS"] as const;
// const BATCH_TIME_OPTIONS = [
//   { value: "10:00-12:00", label: "10:00 AM - 12:00 PM" },
//   { value: "12:00-2:00", label: "12:00 PM - 02:00 PM" },
//   { value: "2:30-4:30", label: "02:30 PM - 04:30 PM" },
//   { value: "4:30-6:30", label: "04:30 PM - 06:30 PM" },
// ] as const;

// const formatDate = (dateStr?: string | null) => {
//   if (!dateStr) return "—";
//   const d = new Date(dateStr);
//   if (isNaN(d.getTime())) return "—";
//   return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
// };

// // Returns true if the date is in the past (overdue)
// const isOverdue = (dateStr?: string | null): boolean => {
//   if (!dateStr) return false;
//   return new Date(dateStr) < new Date();
// };

// // ── EMI row shape used only within this page's local edit state ────────────
// interface EmiRow {
//     id?: string;        
//    installmentNumber?: number;
//   amount: string;
//   dueDate: string;
//   paidAmount: number;
//   remainingAmount: number;
//   status: string;
//   locked: boolean;
// }

// // ── Editable field component ──────────────────────────────────────────────────
// interface EditableFieldProps {
//   label: string;
//   value: string;
//   editValue: string;
//   isEditing: boolean;
//   onEdit: () => void;
//   onChange: (val: string) => void;
//   type?: string;
//   selectOptions?: readonly string[];
// }

// const EditableField = ({
//   label,
//   value,
//   editValue,
//   isEditing,
//   onEdit,
//   onChange,
//   type = "text",
//   selectOptions,
// }: EditableFieldProps) => (
//   <div className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0 gap-4">
//     <span className="text-sm text-muted-foreground shrink-0 w-40">{label}</span>
//     {isEditing ? (
//       selectOptions ? (
//         <select
//           value={editValue}
//           onChange={(e) => onChange(e.target.value)}
//           className="flex-1 h-9 rounded-lg border border-[#0037FF] bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0037FF]/20"
//         >
//           <option value="">Select…</option>
//           {selectOptions.map((o) => (
//             <option key={o} value={o}>{o}</option>
//           ))}
//         </select>
//       ) : (
//         <Input
//           type={type}
//           value={editValue}
//           onChange={(e) => onChange(e.target.value)}
//           className="flex-1 h-9 border-[#0037FF] focus:ring-[#0037FF]/20"
//           autoFocus
//         />
//       )
//     ) : (
//       <div className="flex items-center gap-2 flex-1 justify-end">
//         <span className="text-sm font-medium text-foreground text-right">{value || "—"}</span>
//         <button
//           onClick={onEdit}
//           className="text-muted-foreground hover:text-[#0037FF] transition-colors p-1 rounded"
//           title={`Edit ${label}`}
//         >
//           <Pencil size={12} />
//         </button>
//       </div>
//     )}
//   </div>
// );

// const Stat = ({ label, value }: { label: string; value: string }) => (
//   <div>
//     <p className="text-xs text-muted-foreground">{label}</p>
//     <p className="text-base font-semibold text-foreground mt-0.5">{value}</p>
//   </div>
// );

// export default function StudentDetailsPage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [details, setDetails] = useState<AdminStudentDetails | null>(null);
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [mentors, setMentors] = useState<Mentor[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ── Profile edit state ────────────────────────────────────────────────────
//   const [editingField, setEditingField] = useState<string>("");
//   const [editValues, setEditValues] = useState<Record<string, string>>({});
//   const [savingProfile, setSavingProfile] = useState(false);

//   // ── Assignment state ──────────────────────────────────────────────────────
//   const [selectedCourse, setSelectedCourse] = useState("");
//   const [selectedMentor, setSelectedMentor] = useState("");
//   const [selectedBatchDays, setSelectedBatchDays] = useState("");
//   const [selectedBatchTime, setSelectedBatchTime] = useState("");
//   const [assigning, setAssigning] = useState(false);
//   const [showAddMentor, setShowAddMentor] = useState(false);
//   const [newMentor, setNewMentor] = useState({ name: "", email: "", specialization: "" });
//   const [addingMentor, setAddingMentor] = useState(false);

//   // ── Fee Collection Counsellor assignment ────────────────────────────────
//   const { counsellors: feeCounsellors, loading: feeCounsellorsLoading } = useCounsellors();
//   const [showAssignFeeCollector, setShowAssignFeeCollector] = useState(false);
//   const [selectedFeeCollectorId, setSelectedFeeCollectorId] = useState("");
//   const [feeCollectorReason, setFeeCollectorReason] = useState("");
//   const [assigningFeeCollector, setAssigningFeeCollector] = useState(false);

//   // ── Fee state ─────────────────────────────────────────────────────────────
//   const [editingFee, setEditingFee] = useState(false);
//   const [feeForm, setFeeForm] = useState<{
//     totalFees: string;
//     paymentMode: "full" | "emi";
//     emiMonths: string;
//     nextDueDate: string;
//   }>({ totalFees: "", paymentMode: "full", emiMonths: "", nextDueDate: "" });
//   const [paymentEntries, setPaymentEntries] = useState([
//     { amount: "", paymentMethod: "UPI", transactionId: "" },
//   ]);
//   const [savingFee, setSavingFee] = useState(false);

//   // ── EMI plan state (lives inside the Fee section now) ────────────────────
//   const [emiRows, setEmiRows] = useState<EmiRow[]>([]);
//   const [emiLoading, setEmiLoading] = useState(false);

//   // ── Due date quick-edit (full-payment mode only) ───────────────────────
//   const [editingDueDate, setEditingDueDate] = useState(false);
//   const [dueDateValue, setDueDateValue] = useState("");
//   const [savingDueDate, setSavingDueDate] = useState(false);

//   // ── Payment Tracking state ────────────────────────────────────────────────
//   const [showAddPayment, setShowAddPayment] = useState(false);
//  const [newPayment, setNewPayment] = useState({
//   amount: "",
//   paymentMethod: "UPI" as (typeof PAYMENT_METHODS)[number],
//   transactionId: "",
//   paidAt: new Date().toISOString().slice(0, 10),
//   installmentId: "",
// });
//   const [addingPayment, setAddingPayment] = useState(false);

//   const [documents, setDocuments] = useState<StudentDocumentApiRecord[]>([]);
//   const [docsLoading, setDocsLoading] = useState(true);
//   const [reviewingType, setReviewingType] = useState<DocumentSlotKey | null>(null);
//   const [actionNoteFor, setActionNoteFor] = useState<DocumentSlotKey | null>(null);
//   const [actionNoteText, setActionNoteText] = useState("");

//   const openFeeCollectorPanel = () => {
//     // Pre-fill with the currently assigned counsellor, if any
//     const current = (details as any)?.student?.feeCollectionCounsellor;
//     setSelectedFeeCollectorId(current?._id || "");
//     setFeeCollectorReason("");
//     setShowAssignFeeCollector(true);
//   };

//   const handleAssignFeeCollector = async () => {
//     if (!id) return;
//     setAssigningFeeCollector(true);
//     try {
//       const res = await adminStudentApi.assignFeeCollection(id, {
//         feeCollectionCounsellorId: selectedFeeCollectorId || null,
//         reason: feeCollectorReason.trim() || undefined,
//       });
//       toast.success(res.message || "Fee collection counsellor updated");
//       setShowAssignFeeCollector(false);
//       await loadData();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to update fee collection counsellor");
//     } finally {
//       setAssigningFeeCollector(false);
//     }
//   };

//   const loadDocuments = async () => {
//     if (!id) return;
//     setDocsLoading(true);
//     try {
//       const res = await adminDocumentApi.getByStudent(id);
//       setDocuments(res.data ?? []);
//     } catch (err: any) {
//       toast.error(err.message || "Failed to load documents");
//     } finally {
//       setDocsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDocuments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const handleVerify = async (type: DocumentSlotKey) => {
//     if (!id) return;
//     setReviewingType(type);
//     try {
//       await adminDocumentApi.verify(id, type);
//       toast.success("Document verified");
//       await loadDocuments();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to verify document");
//     } finally {
//       setReviewingType(null);
//     }
//   };

//   const handleRequestAction = async () => {
//     if (!id || !actionNoteFor || !actionNoteText.trim()) {
//       toast.error("Please enter a note explaining what's needed");
//       return;
//     }
//     setReviewingType(actionNoteFor);
//     try {
//       await adminDocumentApi.requestAction(id, actionNoteFor, actionNoteText.trim());
//       toast.success("Action requested from student");
//       setActionNoteFor(null);
//       setActionNoteText("");
//       await loadDocuments();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to request action");
//     } finally {
//       setReviewingType(null);
//     }
//   };

//   // ── Load data ─────────────────────────────────────────────────────────────
//   const loadData = async () => {
//     if (!id) return;
//     setLoading(true);
//     try {
//       const [detailsRes, courseList, mentorList] = await Promise.all([
//         adminStudentApi.getById(id),
//         coursesApi.getAll(),
//         mentorApi.getAll(),
//       ]);
//       setDetails(detailsRes);
//       setCourses(courseList);
//       setMentors(mentorList);

//       const assignedCourse = detailsRes.assignment?.course;
//       const assignedMentor = detailsRes.assignment?.mentor;
//       setSelectedCourse(
//         typeof assignedCourse === "string" ? assignedCourse : (assignedCourse as any)?._id || ""
//       );
//       setSelectedMentor(
//         typeof assignedMentor === "string" ? assignedMentor : (assignedMentor as any)?._id || ""
//       );
//       setSelectedBatchDays(detailsRes.assignment?.batch?.days || "");
//       setSelectedBatchTime(detailsRes.assignment?.batch?.time || "");

//       // Init edit values from profile
//       const p = detailsRes.profile;
//       const s = detailsRes.student;
//       setEditValues({
//         fullName: p?.fullName || (s as any)?.fullName || "",
//         mobileNumber: p?.mobileNumber || "",
//         dob: p?.dob ? new Date(p.dob).toISOString().slice(0, 10) : "",
//         fatherName: p?.fatherName || "",
//         address: p?.address || "",
//         city: p?.city || "",
//         state: p?.state || "",
//         pincode: p?.pincode || "",
//         govtIdType: p?.govtIdType || "",
//         govtIdNumber: p?.govtIdNumber || "",
//       });

//       // Sync due-date quick-edit value from loaded fee
//       const currentDue = detailsRes.fee?.nextDueDate;
//       setDueDateValue(
//         currentDue ? new Date(currentDue).toISOString().slice(0, 10) : ""
//       );
//     } catch (err: any) {
//       toast.error(err.message || "Failed to load student details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   // ── Load EMI plan whenever fee is in EMI mode (view + edit both need it) ──
//   useEffect(() => {
//     const loadEmiPlan = async () => {
//       if (!id) return;
//       if (details?.fee?.paymentMode !== "emi") {
//         setEmiRows([]);
//         return;
//       }
//       setEmiLoading(true);
//       try {
//         const res = await feeInstallmentApi.getAll(id);
//         const rows: EmiRow[] = (res.data ?? [])
//   .slice()
//   .sort((a, b) => a.installmentNumber - b.installmentNumber)
//   .map((inst) => ({
//     id: inst._id,                          
//     installmentNumber: inst.installmentNumber, 
//     amount: String(inst.amount),
//     dueDate: new Date(inst.dueDate).toISOString().slice(0, 10),
//     paidAmount: inst.paidAmount,
//     remainingAmount: inst.remainingAmount,
//     status: inst.status,
//     locked: inst.paidAmount > 0,
//   }));
//         setEmiRows(rows);
//       } catch (err: any) {
//         toast.error(err.message || "Failed to load EMI schedule");
//       } finally {
//         setEmiLoading(false);
//       }
//     };
//     loadEmiPlan();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, details?.fee?.paymentMode, details?.fee?.totalPaid]);

//   // ── Profile field save ────────────────────────────────────────────────────
//   const handleSaveField = async (fieldKey: string) => {
//     if (!id) return;
//     setSavingProfile(true);
//     try {
//       const payload: UpdateStudentProfilePayload = {
//         [fieldKey]: editValues[fieldKey],
//       };
//       await studentApprovalApi.updateStudentProfile(id, payload);
//       toast.success("Profile updated");
//       setEditingField("");
//       await loadData();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to update profile");
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   const handleSaveAllProfile = async () => {
//     if (!id) return;
//     setSavingProfile(true);
//     try {
//       await studentApprovalApi.updateStudentProfile(id, editValues as UpdateStudentProfilePayload);
//       toast.success("All profile changes saved");
//       setEditingField("");
//       await loadData();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to save profile");
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   // ── Assignment handlers ───────────────────────────────────────────────────
//   const handleAssign = async () => {
//     if (!id || !selectedCourse) {
//       toast.error("Please select a course");
//       return;
//     }
//     if ((selectedBatchDays && !selectedBatchTime) || (!selectedBatchDays && selectedBatchTime)) {
//       toast.error("Please select both batch days and batch timing, or leave both blank");
//       return;
//     }
//     setAssigning(true);
//     try {
//       const batch =
//         selectedBatchDays && selectedBatchTime
//           ? { days: selectedBatchDays as any, time: selectedBatchTime as any }
//           : undefined;
//       await assignmentApi.assign(id, selectedCourse, selectedMentor || undefined, batch);
//       toast.success("Course & Mentor assigned successfully");
//       await loadData();
//     } catch (err: any) {
//       toast.error(err.message || "Assignment failed");
//     } finally {
//       setAssigning(false);
//     }
//   };

//   const handleAddMentor = async () => {
//     if (!newMentor.name || !newMentor.email) {
//       toast.error("Mentor name and email are required");
//       return;
//     }
//     setAddingMentor(true);
//     try {
//       const res = await mentorApi.create(newMentor);
//       toast.success("Mentor added");
//       setMentors((prev) => [...prev, res.data]);
//       setSelectedMentor(res.data._id);
//       setShowAddMentor(false);
//       setNewMentor({ name: "", email: "", specialization: "" });
//     } catch (err: any) {
//       toast.error(err.message || "Failed to add mentor");
//     } finally {
//       setAddingMentor(false);
//     }
//   };

//   // ── Fee handlers ──────────────────────────────────────────────────────────
//   const startEditFee = () => {
//     if (details?.fee) {
//       const existingDue = details.fee.nextDueDate
//         ? new Date(details.fee.nextDueDate).toISOString().slice(0, 10)
//         : "";
//       setFeeForm({
//         totalFees: String(details.fee.totalFees),
//         paymentMode: details.fee.paymentMode,
//         emiMonths: details.fee.emiMonths ? String(details.fee.emiMonths) : "",
//         nextDueDate: existingDue,
//       });
//     }
//     setEditingFee(true);
//   };

//   const updatePaymentEntry = (idx: number, field: string, value: string) => {
//     setPaymentEntries((prev) =>
//       prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
//     );
//   };

//   const removePaymentEntry = (idx: number) => {
//     setPaymentEntries((prev) => prev.filter((_, i) => i !== idx));
//   };

//   const totalEnteredPaid = paymentEntries.reduce(
//     (sum, p) => sum + (Number(p.amount) || 0),
//     0
//   );

//   // ── EMI plan handlers ─────────────────────────────────────────────────────
//   const minEmiMonths = emiRows.filter((r) => r.locked).length;

//   const handleEmiMonthsChange = (value: string) => {
//     setFeeForm((prev) => ({ ...prev, emiMonths: value }));
//     const count = Math.max(0, Number(value) || 0);
//     setEmiRows((prev) => {
//       const rows = [...prev];
//       if (count > rows.length) {
//         for (let i = rows.length; i < count; i++) {
//           rows.push({ amount: "", dueDate: "", paidAmount: 0, remainingAmount: 0, status: "pending", locked: false });
//         }
//       } else if (count < rows.length) {
//         const safeCount = Math.max(count, minEmiMonths);
//         rows.length = safeCount;
//       }
//       return rows;
//     });
//   };

//   const updateEmiRow = (index: number, field: "amount" | "dueDate", value: string) => {
//     setEmiRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
//   };

//   const scheduledEmiTotal = emiRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
//   const remainingToSchedule = Number(feeForm.totalFees || 0) - scheduledEmiTotal;

//   const handleSaveFee = async () => {
//     if (!id) return;
//     if (!feeForm.totalFees || Number(feeForm.totalFees) <= 0) {
//       toast.error("Enter a valid total fee amount");
//       return;
//     }

//     if (feeForm.paymentMode === "emi") {
//       if (!feeForm.emiMonths || Number(feeForm.emiMonths) < 1) {
//         toast.error("Enter the number of EMI");
//         return;
//       }
//       if (emiRows.length !== Number(feeForm.emiMonths)) {
//         toast.error("EMI boxes don't match the number of EMI entered");
//         return;
//       }
//       for (let i = 0; i < emiRows.length; i++) {
//         const row = emiRows[i];
//         if (!row.amount || Number(row.amount) <= 0) {
//           toast.error(`EMI ${i + 1}: enter a valid amount`);
//           return;
//         }
//         if (!row.dueDate) {
//           toast.error(`EMI ${i + 1}: select a due date`);
//           return;
//         }
//       }
//       const total = Math.round(Number(feeForm.totalFees) * 100) / 100;
//       const scheduled = Math.round(scheduledEmiTotal * 100) / 100;
//       if (scheduled !== total) {
//         toast.error(
//           `EMI amounts must total ₹${total.toLocaleString("en-IN")}. Current total is ₹${scheduled.toLocaleString(
//             "en-IN"
//           )}.`
//         );
//         return;
//       }
//     }

//     setSavingFee(true);
//     try {
//       const payload: any = {
//         totalFees: Number(feeForm.totalFees),
//         paymentMode: feeForm.paymentMode,
//         nextDueDate: feeForm.paymentMode === "full" ? feeForm.nextDueDate || undefined : undefined,
//       };

//       if (feeForm.paymentMode === "emi") {
//         payload.emiMonths = Number(feeForm.emiMonths);
//         payload.installments = emiRows.map((r, i) => ({
//           installmentNumber: i + 1,
//           amount: Number(r.amount),
//           dueDate: r.dueDate,
//         }));
//       }

//       if (!details?.fee) {
//         const validEntries = paymentEntries.filter((p) => p.amount && Number(p.amount) > 0);
//         if (validEntries.length > 0) {
//           payload.payments = validEntries.map((p) => ({
//             amount: Number(p.amount),
//             paymentMethod: p.paymentMethod,
//             transactionId: p.transactionId || undefined,
//           }));
//         }
//       }

//       await feeApi.setup(id, payload);
//       toast.success("Fee plan saved successfully");
//       setEditingFee(false);
//       setPaymentEntries([{ amount: "", paymentMethod: "UPI", transactionId: "" }]);
//       await loadData();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to save fee plan");
//     } finally {
//       setSavingFee(false);
//     }
//   };

//   // ── Due date quick-save (full-payment mode only) ─────────────────────────
//   const handleSaveDueDate = async () => {
//     if (!id || !details?.fee) return;
//     setSavingDueDate(true);
//     try {
//       await feeApi.setup(id, {
//         totalFees: details.fee.totalFees,
//         paymentMode: details.fee.paymentMode,
//         emiMonths: details.fee.emiMonths ?? undefined,
//         nextDueDate: dueDateValue || undefined,
//       } as any);
//       toast.success(dueDateValue ? "Due date updated" : "Due date cleared");
//       setEditingDueDate(false);
//       await loadData();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to update due date");
//     } finally {
//       setSavingDueDate(false);
//     }
//   };

//   // ── Add Payment handler ───────────────────────────────────────────────────
//   // const handleAddPayment = async () => {
//   //   if (!id) return;
//   //   if (!newPayment.amount || Number(newPayment.amount) <= 0) {
//   //     toast.error("Enter a valid payment amount");
//   //     return;
//   //   }

//   //   setAddingPayment(true);
//   //   try {
//   //     await paymentApi.add(id, {
//   //       amount: Number(newPayment.amount),
//   //       paymentMethod: newPayment.paymentMethod,
//   //       transactionId: newPayment.transactionId || undefined,
//   //       paidAt: newPayment.paidAt,
//   //     });
//   //     toast.success("Payment recorded — due date auto-updated if applicable");
//   //     setShowAddPayment(false);
//   //     setNewPayment({
//   //       amount: "",
//   //       paymentMethod: "UPI",
//   //       transactionId: "",
//   //       paidAt: new Date().toISOString().slice(0, 10),
//   //     });
//   //     await loadData();
//   //   } catch (err: any) {
//   //     toast.error(err.message || "Failed to record payment");
//   //   } finally {
//   //     setAddingPayment(false);
//   //   }
//   // };

//   const handleAddPayment = async () => {
//   if (!id) return;
//   if (!newPayment.amount || Number(newPayment.amount) <= 0) {
//     toast.error("Enter a valid payment amount");
//     return;
//   }
//   if (details.fee?.paymentMode === "emi" && !newPayment.installmentId) {
//     toast.error("Please select which EMI this payment is for");
//     return;
//   }

//   setAddingPayment(true);
//   try {
//     await paymentApi.add(id, {
//       amount: Number(newPayment.amount),
//       paymentMethod: newPayment.paymentMethod,
//       transactionId: newPayment.transactionId || undefined,
//       paidAt: newPayment.paidAt,
//       installmentId:
//         details.fee?.paymentMode === "emi" ? newPayment.installmentId : undefined,
//     });
//     toast.success("Payment recorded successfully");
//     setShowAddPayment(false);
//     setNewPayment({
//       amount: "",
//       paymentMethod: "UPI",
//       transactionId: "",
//       paidAt: new Date().toISOString().slice(0, 10),
//       installmentId: "",
//     });
//     await loadData();
//   } catch (err: any) {
//     toast.error(err.message || "Failed to record payment");
//   } finally {
//     setAddingPayment(false);
//   }
// };

//   // ── Helpers ───────────────────────────────────────────────────────────────
//   const getDisplayValue = (key: string): string => {
//     const p = details?.profile;
//     switch (key) {
//       case "fullName":
//         return p?.fullName || (details?.student as any)?.fullName || "—";
//       case "mobileNumber":
//         return p?.mobileNumber || (details?.student as any)?.phone || "—";
//       case "dob":
//         return p?.dob ? formatDate(p.dob) : "—";
//       case "fatherName":
//         return p?.fatherName || "—";
//       case "address":
//         return p?.address || "—";
//       case "city":
//         return p?.city || "—";
//       case "state":
//         return p?.state || "—";
//       case "pincode":
//         return p?.pincode || "—";
//       case "govtIdType":
//         return p?.govtIdType || "—";
//       case "govtIdNumber":
//         return p?.govtIdNumber || "—";
//       default:
//         return "—";
//     }
//   };

//   const makeFieldProps = (key: string, label: string, extra: Partial<EditableFieldProps> = {}) => ({
//     label,
//     value: getDisplayValue(key),
//     editValue: editValues[key] ?? "",
//     isEditing: editingField === key,
//     onEdit: () => setEditingField(key),
//     onChange: (val: string) =>
//       setEditValues((prev) => ({ ...prev, [key]: val })),
//     ...extra,
//   });

//   // ── Render ────────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <AdminLayout title="Student Details" subtitle="Loading...">
//         <div className="flex items-center justify-center py-20">
//           <Loader2 className="h-6 w-6 animate-spin text-[#0037FF]" />
//         </div>
//       </AdminLayout>
//     );
//   }

//   if (!details) {
//     return (
//       <AdminLayout title="Student Details" subtitle="">
//         <p className="text-muted-foreground">Student not found.</p>
//       </AdminLayout>
//     );
//   }

//   const { student, profile } = details;
//   const payments: PaymentRecord[] = details.payments || [];
//   const hasUnsavedEdits = editingField !== "";

//   // Is the due date overdue?
//   const dueDateOverdue = isOverdue(details.fee?.nextDueDate);

//   // Next EMI (first unlocked/unpaid row) — used in the summary card
//   const nextEmiRow = emiRows.find((r) => !r.locked);

//   return (
//     <AdminLayout
//       title={
//         profile?.fullName ||
//         (student as any)?.fullName ||
//         [(student as any)?.firstName, (student as any)?.lastName].filter(Boolean).join(" ") ||
//         student.email ||
//         "Student"
//       }
//       subtitle={`Student ID: ${(student as any).studentId || "Not approved yet"}`}
//       actions={
//         <div className="flex gap-2">
//           {hasUnsavedEdits && (
//             <Button
//               size="sm"
//               className="text-white bg-green-600 hover:bg-green-700"
//               onClick={handleSaveAllProfile}
//               disabled={savingProfile}
//             >
//               <Save size={14} className="mr-1" />
//               {savingProfile ? "Saving..." : "Save Changes"}
//             </Button>
//           )}
//           <Button variant="outline" size="sm" onClick={() => navigate("/admin/students")}>
//             <ArrowLeft size={14} className="mr-1" /> Back to Students
//           </Button>
//         </div>
//       }
//     >
//       {hasUnsavedEdits && (
//         <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
//           <span>You have unsaved changes. Click a field's save icon or use "Save Changes" above.</span>
//           <button
//             onClick={() => {
//               setEditingField("");
//               const p = details?.profile;
//               const s = details?.student;
//               setEditValues({
//                 fullName: p?.fullName || (s as any)?.fullName || "",
//                 mobileNumber: p?.mobileNumber || "",
//                 dob: p?.dob ? new Date(p.dob).toISOString().slice(0, 10) : "",
//                 fatherName: p?.fatherName || "",
//                 address: p?.address || "",
//                 city: p?.city || "",
//                 state: p?.state || "",
//                 pincode: p?.pincode || "",
//                 govtIdType: p?.govtIdType || "",
//                 govtIdNumber: p?.govtIdNumber || "",
//               });
//             }}
//             className="ml-4 text-amber-600 hover:text-amber-800 font-medium underline"
//           >
//             Discard
//           </button>
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//         {/* ── Student Information ── */}
//         <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-sm font-semibold flex items-center gap-2">
//               <IdCard size={16} className="text-[#0037FF]" /> Student Information
//             </h3>
//             <span className="text-xs text-muted-foreground flex items-center gap-1">
//               <Pencil size={11} /> Click any field to edit
//             </span>
//           </div>

//           {/* Read-only fields */}
//           <div className="flex items-center justify-between py-2.5 border-b border-border/60">
//             <span className="text-sm text-muted-foreground w-40">Student ID</span>
//             <span className="text-sm font-medium font-mono text-[#0037FF]">
//               {(student as any).studentId || "—"}
//             </span>
//           </div>
//           <div className="flex items-center justify-between py-2.5 border-b border-border/60">
//             <span className="text-sm text-muted-foreground w-40">Email</span>
//             <span className="text-sm font-medium">{student.email}</span>
//           </div>
//           <div className="flex items-center justify-between py-2.5 border-b border-border/60">
//             <span className="text-sm text-muted-foreground w-40">Registration Date</span>
//             <span className="text-sm font-medium">{formatDate((student as any).createdAt)}</span>
//           </div>
//           <div className="flex items-center justify-between py-2.5 border-b border-border/60">
//             <span className="text-sm text-muted-foreground w-40">Approval Date</span>
//             <span className="text-sm font-medium">{formatDate((student as any).approvedAt)}</span>
//           </div>

//           {/* Editable fields */}
//           {[
//             makeFieldProps("fullName", "Full Name"),
//             makeFieldProps("mobileNumber", "Mobile Number", { type: "tel" }),
//             makeFieldProps("dob", "Date of Birth", { type: "date" }),
//             makeFieldProps("fatherName", "Father's Name"),
//             makeFieldProps("address", "Address"),
//             makeFieldProps("city", "City"),
//             makeFieldProps("state", "State"),
//             makeFieldProps("pincode", "Pincode"),
//             makeFieldProps("govtIdType", "Govt ID Type", { selectOptions: GOVT_ID_TYPES }),
//             makeFieldProps("govtIdNumber", "Govt ID Number"),
//           ].map((fieldProps) => (
//             <div key={fieldProps.label} className="relative">
//               <EditableField {...fieldProps} />
//               {fieldProps.isEditing && (
//                 <div className="flex justify-end gap-2 py-1.5">
//                   <button
//                     onClick={() => setEditingField("")}
//                     className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={() => {
//                       const keyMap: Record<string, string> = {
//                         "Full Name": "fullName",
//                         "Mobile Number": "mobileNumber",
//                         "Date of Birth": "dob",
//                         "Father's Name": "fatherName",
//                         Address: "address",
//                         City: "city",
//                         State: "state",
//                         Pincode: "pincode",
//                         "Govt ID Type": "govtIdType",
//                         "Govt ID Number": "govtIdNumber",
//                       };
//                       handleSaveField(keyMap[fieldProps.label] || "");
//                     }}
//                     disabled={savingProfile}
//                     className="text-xs text-white bg-[#0037FF] hover:bg-[#0028cc] px-3 py-1 rounded flex items-center gap-1 disabled:opacity-50"
//                   >
//                     <CheckCircle2 size={11} />
//                     {savingProfile ? "Saving…" : "Save"}
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))}

//           {/* Govt ID Image */}
//           {profile?.govtIdImageUrl ? (
//             <div className="mt-4">
//               <p className="text-sm text-muted-foreground mb-2">Government ID Image</p>
//               <img
//                 src={profile.govtIdImageUrl}
//                 alt="Government ID"
//                 className="w-full max-w-sm rounded-lg border border-border"
//               />
//             </div>
//           ) : (
//             <p className="mt-4 text-sm text-muted-foreground italic">
//               Student hasn't completed their profile yet. Fields above can still be filled by admin.
//             </p>
//           )}
//         </div>

//         {/* ── Course Assignment ── */}
//         <div className="rounded-xl border border-border bg-card p-5 self-start">
//           <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
//             <GraduationCap size={16} className="text-[#0037FF]" /> Course Assignment
//           </h3>

//           <div className="space-y-4">
//             <div className="space-y-1.5">
//               <Label className="text-xs">Assigned Course</Label>
//               <select
//                 value={selectedCourse}
//                 onChange={(e) => setSelectedCourse(e.target.value)}
//                 className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
//               >
//                 <option value="">Select course</option>
//                 {courses.map((c) => (
//                   <option key={c._id || c.id} value={c._id || c.id}>
//                     {c.title}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="space-y-1.5">
//               <div className="flex items-center justify-between">
//                 <Label className="text-xs">Assigned Teacher</Label>
//                 <button
//                   type="button"
//                   onClick={() => setShowAddMentor((v) => !v)}
//                   className="text-xs text-[#0037FF] flex items-center gap-1 hover:underline"
//                 >
//                   <Plus size={12} /> New mentor
//                 </button>
//               </div>
//               <select
//                 value={selectedMentor}
//                 onChange={(e) => setSelectedMentor(e.target.value)}
//                 className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
//               >
//                 <option value="">No mentor</option>
//                 {mentors.map((m) => (
//                   <option key={m._id} value={m._id}>
//                     {m.name} {m.specialization ? `· ${m.specialization}` : ""}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div className="space-y-1.5">
//                 <Label className="text-xs">Batch Days</Label>
//                 <select
//                   value={selectedBatchDays}
//                   onChange={(e) => setSelectedBatchDays(e.target.value)}
//                   className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
//                 >
//                   <option value="">Select days</option>
//                   {BATCH_DAYS_OPTIONS.map((d) => (
//                     <option key={d} value={d}>{d}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-1.5">
//                 <Label className="text-xs">Batch Timing</Label>
//                 <select
//                   value={selectedBatchTime}
//                   onChange={(e) => setSelectedBatchTime(e.target.value)}
//                   className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
//                 >
//                   <option value="">Select timing</option>
//                   {BATCH_TIME_OPTIONS.map((t) => (
//                     <option key={t.value} value={t.value}>{t.label}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {showAddMentor && (
//               <div className="rounded-lg border border-dashed border-border p-3 space-y-2 bg-muted/30">
//                 <Input
//                   placeholder="Mentor name"
//                   value={newMentor.name}
//                   onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
//                   className="h-9"
//                 />
//                 <Input
//                   placeholder="Mentor email"
//                   value={newMentor.email}
//                   onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
//                   className="h-9"
//                 />
//                 <Input
//                   placeholder="Specialization (optional)"
//                   value={newMentor.specialization}
//                   onChange={(e) =>
//                     setNewMentor({ ...newMentor, specialization: e.target.value })
//                   }
//                   className="h-9"
//                 />
//                 <Button
//                   size="sm"
//                   className="w-full"
//                   onClick={handleAddMentor}
//                   disabled={addingMentor}
//                 >
//                   <UserPlus size={14} className="mr-1" />
//                   {addingMentor ? "Adding..." : "Add Mentor"}
//                 </Button>
//               </div>
//             )}

//             <Button className="w-full text-white" onClick={handleAssign} disabled={assigning}>
//               {assigning ? "Saving..." : "Save Assignment"}
//             </Button>

//             {/* ── Currently Assigned (confirmation display) ── */}
//             {details.assignment && (
//               <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1.5">
//                 <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
//                   <CheckCircle2 size={12} /> Currently Assigned
//                 </p>
//                 <p className="text-sm text-foreground">
//                   <span className="text-muted-foreground">Course:</span>{" "}
//                   <span className="font-medium">
//                     {typeof details.assignment.course === "object"
//                       ? details.assignment.course.title
//                       : "—"}
//                   </span>
//                 </p>
//                 <p className="text-sm text-foreground">
//                   <span className="text-muted-foreground">Mentor:</span>{" "}
//                   <span className="font-medium">
//                     {details.assignment.mentor && typeof details.assignment.mentor === "object"
//                       ? (details.assignment.mentor as any).name
//                       : "Not assigned"}
//                   </span>
//                 </p>

//                 {details.assignment.batch?.days && details.assignment.batch?.time && (
//                   <p className="text-sm text-foreground">
//                     <span className="text-muted-foreground">Batch:</span>{" "}
//                     <span className="font-medium">
//                       {details.assignment.batch.days} ·{" "}
//                       {BATCH_TIME_OPTIONS.find((t) => t.value === details.assignment!.batch!.time)?.label}
//                     </span>
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ── Fees Management ── */}
//       <div className="mt-5 rounded-xl border border-border bg-card p-5">
//         <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
//           <Wallet size={16} className="text-[#0037FF]" /> Fees Management
//         </h3>

//         {/* ── Fee Collection Counsellor ── */}
//         <div className="mb-4 rounded-lg border border-border bg-secondary/20 p-4">
//           <div className="flex items-center justify-between flex-wrap gap-3">
//             <div className="flex items-center gap-2">
//               <UserCog size={15} className="text-[#0037FF]" />
//               <span className="text-sm font-medium text-foreground">Fee Collection Counsellor</span>
//             </div>
//             <button
//               onClick={openFeeCollectorPanel}
//               className="text-xs text-[#0037FF] hover:underline flex items-center gap-1"
//             >
//               <Pencil size={11} />
//               {(details as any)?.student?.feeCollectionCounsellor ? "Change" : "Assign"}
//             </button>
//           </div>
//           <p className="mt-2 text-sm text-foreground">
//             {(details as any)?.student?.feeCollectionCounsellor?.fullName || (
//               <span className="text-muted-foreground italic">Unassigned</span>
//             )}
//           </p>
//           {(details as any)?.student?.feeCollectionCounsellor?.email && (
//             <p className="text-xs text-muted-foreground">
//               {(details as any).student.feeCollectionCounsellor.email}
//             </p>
//           )}
//         </div>

//         {details.fee && !editingFee ? (
//           <div className="space-y-4">
//             {/* ── Stats row ── */}
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//               <Stat label="Total Fees" value={`₹${details.fee.totalFees.toLocaleString()}`} />
//               <Stat label="Total Paid" value={`₹${details.fee.totalPaid.toLocaleString()}`} />
//               <Stat label="Remaining" value={`₹${details.fee.remainingAmount.toLocaleString()}`} />
//               <Stat
//                 label="Payment Mode"
//                 value={details.fee.paymentMode === "emi" ? `EMI (${details.fee.emiMonths})` : "Full Payment"}
//               />
//             </div>

//             {details.fee.paymentMode === "emi" && (
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                 <Stat
//                   label="Next EMI Amount"
//                   value={nextEmiRow ? `₹${Number(nextEmiRow.amount).toLocaleString()}` : "—"}
//                 />
//                 <Stat
//                   label="Next EMI Due"
//                   value={nextEmiRow ? formatDate(nextEmiRow.dueDate) : "—"}
//                 />
//               </div>
//             )}

//             {/* ── Progress bar ── */}
//             <div>
//               <div className="flex justify-between text-xs text-muted-foreground mb-1">
//                 <span>Payment Progress</span>
//                 <span>
//                   {Math.min(
//                     100,
//                     Math.round((details.fee.totalPaid / details.fee.totalFees) * 100)
//                   )}%
//                 </span>
//               </div>
//               <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
//                 <div
//                   className="h-full rounded-full bg-[#0037FF] transition-all duration-500"
//                   style={{
//                     width: `${Math.min(
//                       100,
//                       Math.round((details.fee.totalPaid / details.fee.totalFees) * 100)
//                     )}%`,
//                   }}
//                 />
//               </div>
//             </div>

//             {/* ── Next Fee Due Date block (only meaningful for full-payment) ── */}
//             {details.fee.paymentMode === "full" && (
//               <div className="rounded-lg border border-border bg-secondary/20 p-4">
//                 <div className="flex items-center justify-between flex-wrap gap-3">
//                   <div className="flex items-center gap-2">
//                     <CalendarClock
//                       size={15}
//                       className={
//                         details.fee.remainingAmount <= 0
//                           ? "text-emerald-500"
//                           : dueDateOverdue
//                           ? "text-red-500"
//                           : "text-[#0037FF]"
//                       }
//                     />
//                     <span className="text-sm font-medium text-foreground">Next Fee Due Date</span>

//                     {details.fee.remainingAmount <= 0 ? (
//                       <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
//                         <CheckCircle2 size={11} /> Fully Paid
//                       </span>
//                     ) : dueDateOverdue && details.fee.nextDueDate ? (
//                       <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
//                         <AlertTriangle size={11} /> Overdue
//                       </span>
//                     ) : null}
//                   </div>

//                   {details.fee.remainingAmount > 0 && (
//                     <div className="flex items-center gap-2">
//                       {!editingDueDate ? (
//                         <button
//                           onClick={() => {
//                             setDueDateValue(
//                               details.fee?.nextDueDate
//                                 ? new Date(details.fee.nextDueDate).toISOString().slice(0, 10)
//                                 : ""
//                             );
//                             setEditingDueDate(true);
//                           }}
//                           className="text-xs text-[#0037FF] hover:underline flex items-center gap-1"
//                         >
//                           <Pencil size={11} />
//                           {details.fee.nextDueDate ? "Change" : "Set date"}
//                         </button>
//                       ) : (
//                         <div className="flex items-center gap-2">
//                           <DatePicker
//                             value={dueDateValue}
//                             onChange={setDueDateValue}
//                             disablePast
//                             placeholder="Pick due date"
//                             triggerClassName="h-8 text-xs"
//                           />
//                           <button
//                             onClick={handleSaveDueDate}
//                             disabled={savingDueDate}
//                             className="text-xs text-white bg-[#0037FF] hover:bg-[#0028cc] px-3 py-1.5 rounded flex items-center gap-1 disabled:opacity-50"
//                           >
//                             <CheckCircle2 size={11} />
//                             {savingDueDate ? "Saving…" : "Save"}
//                           </button>
//                           {dueDateValue && (
//                             <button
//                               onClick={() => setDueDateValue("")}
//                               className="text-xs text-muted-foreground hover:text-destructive px-2 py-1.5 rounded border border-border"
//                               title="Clear due date"
//                             >
//                               Clear
//                             </button>
//                           )}
//                           <button
//                             onClick={() => setEditingDueDate(false)}
//                             className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded border border-border"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-2">
//                   {details.fee.remainingAmount <= 0 ? (
//                     <p className="text-sm text-emerald-600 font-medium">
//                       All dues cleared — no upcoming payments required.
//                     </p>
//                   ) : details.fee.nextDueDate ? (
//                     <p
//                       className={`text-base font-semibold ${
//                         dueDateOverdue ? "text-red-600" : "text-foreground"
//                       }`}
//                     >
//                       {formatDate(details.fee.nextDueDate)}
//                       {dueDateOverdue && (
//                         <span className="ml-2 text-xs font-normal text-red-500">
//                           (
//                           {Math.ceil(
//                             (new Date().getTime() -
//                               new Date(details.fee.nextDueDate).getTime()) /
//                               (1000 * 60 * 60 * 24)
//                           )}{" "}
//                           day
//                           {Math.ceil(
//                             (new Date().getTime() -
//                               new Date(details.fee.nextDueDate).getTime()) /
//                               (1000 * 60 * 60 * 24)
//                           ) !== 1
//                             ? "s"
//                             : ""}{" "}
//                           overdue)
//                         </span>
//                       )}
//                     </p>
//                   ) : (
//                     <p className="text-sm text-muted-foreground italic">
//                       No due date set. Click "Set date" to add one.
//                     </p>
//                   )}

//                   {details.fee.nextDueDate && details.fee.remainingAmount > 0 && (
//                     <p className="text-[11px] text-muted-foreground mt-1">
//                       This date auto-advances to the same date next month after each successful
//                       payment. It clears automatically when the fee is fully paid.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* ── EMI Schedule (read-only view, inside Fee section) ── */}
//             {details.fee.paymentMode === "emi" && (
//               <div className="rounded-lg border border-border bg-secondary/20 p-4">
//                 <div className="flex items-center gap-2 mb-3">
//                   <Layers size={15} className="text-[#0037FF]" />
//                   <span className="text-sm font-medium text-foreground">EMI Payment Plan</span>
//                 </div>

//                 {emiLoading ? (
//                   <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
//                     <Loader2 size={14} className="animate-spin" /> Loading EMI schedule…
//                   </div>
//                 ) : emiRows.length === 0 ? (
//                   <p className="text-sm text-muted-foreground">No EMI schedule found.</p>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                       <thead className="text-xs text-muted-foreground border-b border-border">
//                         <tr>
//                           <th className="px-3 py-2 text-left font-medium">EMI #</th>
//                           <th className="px-3 py-2 text-left font-medium">Amount</th>
//                           <th className="px-3 py-2 text-left font-medium">Due Date</th>
//                           <th className="px-3 py-2 text-left font-medium">Paid</th>
//                           <th className="px-3 py-2 text-left font-medium">Remaining</th>
//                           <th className="px-3 py-2 text-left font-medium">Status</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {emiRows.map((row, idx) => {
//                           const statusStyle: Record<string, string> = {
//                             pending: "bg-secondary text-muted-foreground",
//                             partial: "bg-yellow-500/10 text-yellow-600",
//                             paid: "bg-green-500/10 text-green-600",
//                             overdue: "bg-red-500/10 text-red-600",
//                           };
//                           return (
//                             <tr key={idx} className="border-b border-border/50 last:border-0">
//                               <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">#{idx + 1}</td>
//                               <td className="px-3 py-2.5 font-semibold">₹{Number(row.amount).toLocaleString()}</td>
//                               <td className="px-3 py-2.5">{formatDate(row.dueDate)}</td>
//                               <td className="px-3 py-2.5 text-muted-foreground">₹{row.paidAmount.toLocaleString()}</td>
//                               <td className="px-3 py-2.5 text-muted-foreground">₹{row.remainingAmount.toLocaleString()}</td>
//                               <td className="px-3 py-2.5">
//                                 <span
//                                   className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
//                                     statusStyle[row.status] || statusStyle.pending
//                                   }`}
//                                 >
//                                   {row.status}
//                                 </span>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             )}

//             <Button variant="outline" size="sm" onClick={startEditFee}>
//               <Pencil size={13} className="mr-1" /> Edit Fee Plan
//             </Button>
//           </div>
//         ) : (
//           /* ── Fee setup / edit form ── */
//           <div className="space-y-4 max-w-2xl">
//             <div className="space-y-1.5">
//               <Label className="text-xs">Total Course Fees (₹)</Label>
//               <Input
//                 type="number"
//                 value={feeForm.totalFees}
//                 onChange={(e) => setFeeForm({ ...feeForm, totalFees: e.target.value })}
//                 placeholder="e.g. 50000"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <Label className="text-xs">Payment Mode</Label>
//               <div className="flex gap-2">
//                 {(["full", "emi"] as const).map((mode) => (
//                   <button
//                     key={mode}
//                     type="button"
//                     onClick={() => setFeeForm({ ...feeForm, paymentMode: mode })}
//                     className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors capitalize ${
//                       feeForm.paymentMode === mode
//                         ? "bg-[#0037FF] text-white border-[#0037FF]"
//                         : "border-border text-muted-foreground hover:bg-secondary/40"
//                     }`}
//                   >
//                     {mode === "emi" ? "EMI" : "Full Payment"}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* ── EMI Payment Plan (auto-generated boxes) ── */}
//             {feeForm.paymentMode === "emi" && (
//               <div className="space-y-3">
//                 <div className="space-y-1.5">
//                   <Label className="text-xs">Number of EMI</Label>
//                   <Input
//                     type="number"
//                     min={minEmiMonths || 1}
//                     value={feeForm.emiMonths}
//                     onChange={(e) => handleEmiMonthsChange(e.target.value)}
//                     placeholder="e.g. 6"
//                   />
//                   {minEmiMonths > 0 && (
//                     <p className="text-[11px] text-muted-foreground">
//                       {minEmiMonths} EMI{minEmiMonths > 1 ? "s" : ""} already paid — count can't go below this.
//                     </p>
//                   )}
//                 </div>

//                 {emiLoading ? (
//                   <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
//                     <Loader2 size={14} className="animate-spin" /> Loading EMI plan…
//                   </div>
//                 ) : emiRows.length > 0 ? (
//                   <div className="space-y-3">
//                     <p className="text-xs font-semibold text-foreground">EMI Payment Plan</p>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       {emiRows.map((row, idx) => (
//                         <div key={idx} className="rounded-xl border border-border p-3 space-y-2 bg-muted/20">
//                           <div className="flex items-center justify-between">
//                             <span className="text-xs font-semibold">EMI {idx + 1}</span>
//                             {row.locked && (
//                               <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 capitalize">
//                                 {row.status} (locked)
//                               </span>
//                             )}
//                           </div>
//                           <div className="space-y-1">
//                             <Label className="text-[11px]">Amount (₹)</Label>
//                             <Input
//                               type="number"
//                               value={row.amount}
//                               disabled={row.locked}
//                               onChange={(e) => updateEmiRow(idx, "amount", e.target.value)}
//                               className="h-8 text-xs"
//                             />
//                           </div>
//                           <div className="space-y-1">
//                             <Label className="text-[11px]">Due Date</Label>
//                             <DatePicker
//                               value={row.dueDate}
//                               onChange={(val) => updateEmiRow(idx, "dueDate", val)}
//                               disabled={row.locked}
//                               placeholder="Pick due date"
//                               triggerClassName="h-8 text-xs w-full"
//                             />
//                           </div>
//                           {row.locked && (
//                             <p className="text-[11px] text-muted-foreground pt-1">
//                               Paid ₹{row.paidAmount.toLocaleString()} · Remaining ₹{row.remainingAmount.toLocaleString()}
//                             </p>
//                           )}
//                         </div>
//                       ))}
//                     </div>

//                     <div className="rounded-lg bg-secondary/30 px-3 py-2 text-xs space-y-0.5">
//                       <p>Total Fee: ₹{Number(feeForm.totalFees || 0).toLocaleString("en-IN")}</p>
//                       <p>Scheduled EMI: ₹{scheduledEmiTotal.toLocaleString("en-IN")}</p>
//                       <p
//                         className={
//                           remainingToSchedule === 0
//                             ? "text-emerald-600 font-medium"
//                             : "text-amber-600 font-medium"
//                         }
//                       >
//                         Remaining to Schedule: ₹{remainingToSchedule.toLocaleString("en-IN")}
//                       </p>
//                     </div>
//                   </div>
//                 ) : null}
//               </div>
//             )}

//             {/* ── Next Fee Due Date (full-payment mode only) ── */}
//             {feeForm.paymentMode === "full" && (
//               <div className="space-y-1.5">
//                 <Label className="text-xs flex items-center gap-1.5">
//                   <CalendarClock size={12} className="text-[#0037FF]" />
//                   Next Fee Due Date
//                   <span className="text-muted-foreground font-normal">(optional)</span>
//                 </Label>
//                 <DatePicker
//                   value={feeForm.nextDueDate}
//                   onChange={(val) => setFeeForm({ ...feeForm, nextDueDate: val })}
//                   disablePast
//                   placeholder="Pick due date"
//                   triggerClassName="w-full"
//                 />
//                 <p className="text-[11px] text-muted-foreground">
//                   Set the date by which the full payment should be received.
//                 </p>
//               </div>
//             )}

//             {/* Initial payment entries (first-time only) */}
//             {!details?.fee && (
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label className="text-xs">
//                     {feeForm.paymentMode === "emi"
//                       ? "Initial EMI Payments (optional)"
//                       : "Amount Paid (optional)"}
//                   </Label>
//                   {feeForm.paymentMode === "emi" && (
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setPaymentEntries((prev) => [
//                           ...prev,
//                           { amount: "", paymentMethod: "UPI", transactionId: "" },
//                         ])
//                       }
//                       className="text-xs text-[#0037FF] flex items-center gap-1 hover:underline"
//                     >
//                       <Plus size={12} /> Add entry
//                     </button>
//                   )}
//                 </div>
//                 {paymentEntries.map((entry, idx) => (
//                   <div key={idx} className="flex gap-2">
//                     <Input
//                       type="number"
//                       placeholder={`Payment ${idx + 1} amount`}
//                       value={entry.amount}
//                       onChange={(e) => updatePaymentEntry(idx, "amount", e.target.value)}
//                       className="h-9"
//                     />
//                     <select
//                       value={entry.paymentMethod}
//                       onChange={(e) => updatePaymentEntry(idx, "paymentMethod", e.target.value)}
//                       className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
//                     >
//                       {PAYMENT_METHODS.map((m) => (
//                         <option key={m} value={m}>{m}</option>
//                       ))}
//                     </select>
//                     {feeForm.paymentMode === "emi" && paymentEntries.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removePaymentEntry(idx)}
//                         className="text-muted-foreground hover:text-destructive"
//                       >
//                         <X size={16} />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 {totalEnteredPaid > 0 && (
//                   <p className="text-xs text-muted-foreground">
//                     Total Paid so far: ₹{totalEnteredPaid} · Remaining: ₹
//                     {(Number(feeForm.totalFees || 0) - totalEnteredPaid).toFixed(2)}
//                   </p>
//                 )}
//               </div>
//             )}

//             <div className="flex gap-2">
//               <Button onClick={handleSaveFee} disabled={savingFee} className="text-white">
//                 {savingFee ? "Saving..." : "Save Fee Plan"}
//               </Button>
//               {details?.fee && (
//                 <Button variant="outline" onClick={() => setEditingFee(false)}>
//                   Cancel
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Payment Tracking ── */}
//       <div className="mt-5 rounded-xl border border-border bg-card p-5">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-sm font-semibold flex items-center gap-2">
//             <History size={16} className="text-[#0037FF]" /> Payment Tracking
//           </h3>
//           {details.fee && (
//             <Button
//               size="sm"
//               onClick={() => setShowAddPayment((v) => !v)}
//               variant={showAddPayment ? "outline" : "default"}
//               className={showAddPayment ? "" : "text-white"}
//             >
//               {showAddPayment ? (
//                 <>
//                   <X size={14} className="mr-1" /> Cancel
//                 </>
//               ) : (
//                 <>
//                   <Plus size={14} className="mr-1" /> Record Payment
//                 </>
//               )}
//             </Button>
//           )}
//         </div>

//         {/* Add Payment Form */}
//         {/* {showAddPayment && (
//           <div className="mb-5 p-4 rounded-xl border border-dashed border-border bg-muted/30 space-y-3 max-w-lg">
//             <p className="text-xs font-semibold text-foreground">New Payment Entry</p>
//             <div className="grid grid-cols-2 gap-3">
//               <div className="space-y-1">
//                 <Label className="text-xs">Amount (₹) *</Label>
//                 <Input
//                   type="number"
//                   placeholder="e.g. 5000"
//                   value={newPayment.amount}
//                   onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
//                   className="h-9"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <Label className="text-xs">Payment Method</Label>
//                 <select
//                   value={newPayment.paymentMethod}
//                   onChange={(e) =>
//                     setNewPayment({ ...newPayment, paymentMethod: e.target.value as any })
//                   }
//                   className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
//                 >
//                   {PAYMENT_METHODS.map((m) => (
//                     <option key={m} value={m}>{m}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="space-y-1">
//                 <Label className="text-xs">Transaction ID (optional)</Label>
//                 <Input
//                   placeholder="TXN123..."
//                   value={newPayment.transactionId}
//                   onChange={(e) =>
//                     setNewPayment({ ...newPayment, transactionId: e.target.value })
//                   }
//                   className="h-9"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <Label className="text-xs">Payment Date</Label>
//                 <DatePicker
//                   value={newPayment.paidAt}
//                   onChange={(val) => setNewPayment({ ...newPayment, paidAt: val })}
//                   disableFuture
//                   placeholder="Pick payment date"
//                   triggerClassName="w-full h-9"
//                 />
//               </div>
//             </div>

//             {details.fee && newPayment.amount && Number(newPayment.amount) > 0 && (
//               <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 space-y-0.5">
//                 <p>
//                   After this: Paid ₹
//                   {(details.fee.totalPaid + Number(newPayment.amount)).toLocaleString()} ·
//                   Remaining ₹
//                   {Math.max(
//                     0,
//                     details.fee.remainingAmount - Number(newPayment.amount)
//                   ).toLocaleString()}
//                 </p>
//                 {details.fee.paymentMode === "full" &&
//                   details.fee.nextDueDate &&
//                   details.fee.remainingAmount - Number(newPayment.amount) > 0 && (
//                     <p>
//                       Due date will auto-advance to{" "}
//                       <strong>
//                         {formatDate(
//                           (() => {
//                             const d = new Date(details.fee!.nextDueDate! as string);
//                             d.setMonth(d.getMonth() + 1);
//                             return d.toISOString();
//                           })()
//                         )}
//                       </strong>{" "}
//                       if current due date has passed.
//                     </p>
//                   )}
//                 {details.fee.paymentMode === "emi" && (
//                   <p>This payment will be applied to the earliest unpaid EMI first.</p>
//                 )}
//               </div>
//             )}

//             <Button
//               size="sm"
//               onClick={handleAddPayment}
//               disabled={addingPayment}
//               className="w-full text-white"
//             >
//               <IndianRupee size={14} className="mr-1" />
//               {addingPayment ? "Recording..." : "Record Payment"}
//             </Button>
//           </div>
//         )} */}


//         {/* Add Payment Form */}
// {showAddPayment && (
//   <div className="mb-5 p-4 rounded-xl border border-dashed border-border bg-muted/30 space-y-3 max-w-lg">
//     <p className="text-xs font-semibold text-foreground">New Payment Entry</p>

//     {details.fee?.paymentMode === "emi" && (
//       <div className="space-y-1">
//         <Label className="text-xs">EMI *</Label>
//         <select
//           value={newPayment.installmentId}
//           onChange={(e) => {
//             const selectedId = e.target.value;
//             const row = emiRows.find((r) => r.id === selectedId);
//             setNewPayment((prev) => ({
//               ...prev,
//               installmentId: selectedId,
//               amount: row ? row.remainingAmount.toString() : prev.amount,
//             }));
//           }}
//           className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
//         >
//           <option value="">Select EMI…</option>
//           {emiRows
//             .filter((r) => r.status !== "paid" && r.remainingAmount > 0)
//             .map((row, idx) => (
//               <option key={row.id ?? idx} value={row.id ?? ""}>
//                 EMI {row.installmentNumber ?? idx + 1} — ₹
//                 {Number(row.remainingAmount).toLocaleString()} remaining — {row.status}
//               </option>
//             ))}
//         </select>
//         {emiRows.every((r) => r.status === "paid") && emiRows.length > 0 && (
//           <p className="text-[11px] text-muted-foreground">All EMIs are fully paid.</p>
//         )}
//       </div>
//     )}

//     {(() => {
//       const selectedRow = emiRows.find((r) => r.id === newPayment.installmentId);
//       return selectedRow ? (
//         <div className="rounded-lg bg-secondary/30 px-3 py-2 text-xs space-y-0.5">
//           <p>EMI Amount: ₹{Number(selectedRow.amount).toLocaleString()}</p>
//           <p>Already Paid: ₹{selectedRow.paidAmount.toLocaleString()}</p>
//           <p>Remaining: ₹{selectedRow.remainingAmount.toLocaleString()}</p>
//           <p>Due Date: {formatDate(selectedRow.dueDate)}</p>
//           <p className="capitalize">Status: {selectedRow.status}</p>
//         </div>
//       ) : null;
//     })()}

//     <div className="grid grid-cols-2 gap-3">
//       <div className="space-y-1">
//         <Label className="text-xs">Amount (₹) *</Label>
//         <Input
//           type="number"
//           placeholder="e.g. 5000"
//           value={newPayment.amount}
//           max={
//             emiRows.find((r) => r.id === newPayment.installmentId)?.remainingAmount ?? undefined
//           }
//           onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
//           className="h-9"
//         />
//       </div>
//       <div className="space-y-1">
//         <Label className="text-xs">Payment Method</Label>
//         <select
//           value={newPayment.paymentMethod}
//           onChange={(e) =>
//             setNewPayment({ ...newPayment, paymentMethod: e.target.value as any })
//           }
//           className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
//         >
//           {PAYMENT_METHODS.map((m) => (
//             <option key={m} value={m}>{m}</option>
//           ))}
//         </select>
//       </div>
//       <div className="space-y-1">
//         <Label className="text-xs">Transaction ID (optional)</Label>
//         <Input
//           placeholder="TXN123..."
//           value={newPayment.transactionId}
//           onChange={(e) =>
//             setNewPayment({ ...newPayment, transactionId: e.target.value })
//           }
//           className="h-9"
//         />
//       </div>
//       <div className="space-y-1">
//         <Label className="text-xs">Payment Date</Label>
//         <DatePicker
//           value={newPayment.paidAt}
//           onChange={(val) => setNewPayment({ ...newPayment, paidAt: val })}
//           disableFuture
//           placeholder="Pick payment date"
//           triggerClassName="w-full h-9"
//         />
//       </div>
//     </div>

//     {details.fee && newPayment.amount && Number(newPayment.amount) > 0 && (
//       <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 space-y-0.5">
//         <p>
//           After this: Paid ₹
//           {(details.fee.totalPaid + Number(newPayment.amount)).toLocaleString()} ·
//           Remaining ₹
//           {Math.max(
//             0,
//             details.fee.remainingAmount - Number(newPayment.amount)
//           ).toLocaleString()}
//         </p>
//         {details.fee.paymentMode === "full" &&
//           details.fee.nextDueDate &&
//           details.fee.remainingAmount - Number(newPayment.amount) > 0 && (
//             <p>
//               Due date will auto-advance to{" "}
//               <strong>
//                 {formatDate(
//                   (() => {
//                     const d = new Date(details.fee!.nextDueDate! as string);
//                     d.setMonth(d.getMonth() + 1);
//                     return d.toISOString();
//                   })()
//                 )}
//               </strong>{" "}
//               if current due date has passed.
//             </p>
//           )}
//         {details.fee.paymentMode === "emi" && (
//           <p>This payment will be applied only to the selected EMI.</p>
//         )}
//       </div>
//     )}

//     <Button
//       size="sm"
//       onClick={handleAddPayment}
//       disabled={addingPayment}
//       className="w-full text-white"
//     >
//       <IndianRupee size={14} className="mr-1" />
//       {addingPayment ? "Recording..." : "Record Payment"}
//     </Button>
//   </div>
// )}  

//         {/* Payment History Table */}
//         {!details.fee ? (
//           <p className="text-sm text-muted-foreground text-center py-6">
//             Set up a fee plan first to start tracking payments.
//           </p>
//         ) : payments.length === 0 ? (
//           <p className="text-sm text-muted-foreground text-center py-6">
//             No payments recorded yet.
//           </p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="text-xs text-muted-foreground border-b border-border">
//                 <tr>
//                   <th className="px-3 py-2 text-left font-medium">#</th>
//                   <th className="px-3 py-2 text-left font-medium">Amount</th>
//                   <th className="px-3 py-2 text-left font-medium">Method</th>
//                   <th className="px-3 py-2 text-left font-medium">Transaction ID</th>
//                   <th className="px-3 py-2 text-left font-medium">Date</th>
//                   <th className="px-3 py-2 text-left font-medium">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {payments.map((p) => (
//                   <tr
//                     key={p._id}
//                     className="border-b border-border/50 last:border-0 hover:bg-secondary/20"
//                   >
//                     <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">
//                       #{p.paymentNumber}
//                     </td>
//                     <td className="px-3 py-2.5 font-semibold text-foreground">
//                       ₹{p.amount.toLocaleString()}
//                     </td>
//                     <td className="px-3 py-2.5 text-muted-foreground">{p.paymentMethod}</td>
//                     <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
//                       {p.transactionId || "—"}
//                     </td>
//                     <td className="px-3 py-2.5 text-muted-foreground">{formatDate(p.paidAt)}</td>
//                     <td className="px-3 py-2.5">
//                       <span
//                         className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
//                           p.paymentStatus === "success"
//                             ? "bg-green-500/10 text-green-600"
//                             : p.paymentStatus === "pending"
//                             ? "bg-yellow-500/10 text-yellow-600"
//                             : "bg-red-500/10 text-red-600"
//                         }`}
//                       >
//                         {p.paymentStatus}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//               <tfoot className="border-t border-border">
//                 <tr className="bg-muted/30">
//                   <td className="px-3 py-2.5 text-xs font-semibold text-muted-foreground">
//                     Total
//                   </td>
//                   <td className="px-3 py-2.5 font-bold text-foreground">
//                     ₹
//                     {payments
//                       .filter((p) => p.paymentStatus === "success")
//                       .reduce((sum, p) => sum + p.amount, 0)
//                       .toLocaleString()}
//                   </td>
//                   <td colSpan={4} />
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ── Assign Fee Collection Counsellor Modal ──────────────────────── */}
//       {showAssignFeeCollector && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
//             <div className="flex items-center justify-between border-b border-border px-6 py-4">
//               <div>
//                 <h2 className="text-base font-semibold">Assign Fee Collection Counsellor</h2>
//                 <p className="text-xs text-muted-foreground mt-0.5">
//                   Independent of the assigned lead/course counsellor.
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowAssignFeeCollector(false)}
//                 className="rounded-lg p-1.5 hover:bg-secondary/60 text-muted-foreground"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             <div className="space-y-4 px-6 py-5">
//               <div className="space-y-1.5">
//                 <Label className="text-xs">Counsellor</Label>
//                 {feeCounsellorsLoading ? (
//                   <p className="text-xs text-muted-foreground">Loading counsellors…</p>
//                 ) : (
//                   <select
//                     value={selectedFeeCollectorId}
//                     onChange={(e) => setSelectedFeeCollectorId(e.target.value)}
//                     className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
//                   >
//                     <option value="">Unassign</option>
//                     {feeCounsellors.map((c) => (
//                       <option key={c._id} value={c._id}>
//                         {c.fullName} ({c.email})
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </div>

//               <div className="space-y-1.5">
//                 <Label className="text-xs">Reason (optional)</Label>
//                 <Input
//                   value={feeCollectorReason}
//                   onChange={(e) => setFeeCollectorReason(e.target.value)}
//                   placeholder="e.g. Reassigning to balance workload"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowAssignFeeCollector(false)}
//                 disabled={assigningFeeCollector}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 className="text-white"
//                 onClick={handleAssignFeeCollector}
//                 disabled={assigningFeeCollector}
//               >
//                 {assigningFeeCollector ? "Saving…" : "Save"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Documents Review ── */}
//       <div className="mt-5 rounded-xl border border-border bg-card p-5">
//         <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
//           <FileCheck2 size={16} className="text-[#0037FF]" /> Documents
//         </h3>

//         {docsLoading ? (
//           <p className="text-sm text-muted-foreground">Loading documents...</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {DOC_SLOTS.map((slot) => {
//               const doc = documents.find((d) => d.id === slot.key);
//               const status = doc?.status ?? "empty";
//               const isBusy = reviewingType === slot.key;

//               const statusStyle: Record<string, string> = {
//                 empty: "bg-secondary text-muted-foreground",
//                 under_review: "bg-yellow-500/10 text-yellow-600",
//                 verified: "bg-green-500 text-white",
//                 action_required: "bg-red-500/10 text-red-600",
//               };

//               return (
//                 <div key={slot.key} className="rounded-lg border border-border p-3 space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-medium">{slot.label}</span>
//                     <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium text-white ${statusStyle[status]}`}>
//                       {status === "empty" ? "Not Uploaded" : status.replace("_", " ")}
//                     </span>
//                   </div>

//                   {doc?.note && (
//                     <p className="text-xs text-red-600 flex items-start gap-1">
//                       <AlertOctagon size={12} className="mt-0.5 shrink-0" /> {doc.note}
//                     </p>
//                   )}

//                   {doc?.fileUrl && (
//                     <div className="flex flex-wrap gap-2">
//                       <a
//                         href={doc.fileUrl}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-xs text-[#0037FF] hover:underline"
//                       >
//                         View file
//                       </a>
//                       {status !== "verified" && (
//                         <button
//                           onClick={() => handleVerify(slot.key)}
//                           disabled={isBusy}
//                           className="text-xs text-white bg-green-600 px-2.5 py-1 rounded "
//                         >
//                           {isBusy ? "..." : "Verify"}
//                         </button>
//                       )}
//                       <button
//                         onClick={() => {
//                           setActionNoteFor(slot.key);
//                           setActionNoteText(doc.note || "");
//                         }}
//                         disabled={isBusy}
//                         className="text-xs text-red-600 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded disabled:opacity-50"
//                       >
//                         Request Action
//                       </button>
//                     </div>
//                   )}

//                   {actionNoteFor === slot.key && (
//                     <div className="pt-1 space-y-1.5">
//                       <Input
//                         placeholder="Reason (e.g. blurry image, wrong document)"
//                         value={actionNoteText}
//                         onChange={(e) => setActionNoteText(e.target.value)}
//                         className="h-8 text-xs"
//                       />
//                       <div className="flex gap-2">
//                         <button
//                           onClick={handleRequestAction}
//                           disabled={isBusy}
//                           className="text-xs text-white bg-[#0037FF] px-2.5 py-1 rounded disabled:opacity-50"
//                         >
//                           {isBusy ? "Sending..." : "Send"}
//                         </button>
//                         <button
//                           onClick={() => {
//                             setActionNoteFor(null);
//                             setActionNoteText("");
//                           }}
//                           className="text-xs text-muted-foreground px-2.5 py-1 rounded border border-border"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }

















import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  IdCard,
  GraduationCap,
  UserPlus,
  Plus,
  Wallet,
  X,
  IndianRupee,
  History,
  Pencil,
  Save,
  CheckCircle2,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  adminStudentApi,
  coursesApi,
  mentorApi,
  assignmentApi,
  feeApi,
  paymentApi,
  studentApprovalApi,
  getAdminToken,
  getToken,
  type Course,
  type Mentor,
  type AdminStudentDetails,
  type PaymentRecord,
  type UpdateStudentProfilePayload,
} from "../../integrations/client";
import { FileCheck2, AlertOctagon } from "lucide-react";
import { adminDocumentApi, type DocumentSlotKey, type StudentDocumentApiRecord } from "../../integrations/client";
import { UserCog } from "lucide-react";
import { useCounsellors } from "../hooks/useLeads";
import { feeInstallmentApi } from "../../integrations/client";
import { Layers } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";


const DOC_SLOTS: { key: DocumentSlotKey; label: string }[] = [
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "pan", label: "PAN Card" },
  { key: "resume", label: "Resume" },
  { key: "offer_letter", label: "Offer Letter" },
  { key: "passport_photo", label: "Passport Size Photo" },
  { key: "course_certificate", label: "Course Certificate" },
];

const PAYMENT_METHODS = ["UPI", "Cash", "Bank Transfer", "Card", "Cheque", "Other"] as const;
const GOVT_ID_TYPES = ["Aadhaar", "PAN", "Driving License", "Passport"] as const;

const BATCH_DAYS_OPTIONS = ["MTW", "MWT", "MTT", "SS"] as const;
const BATCH_TIME_OPTIONS = [
  { value: "10:00-12:00", label: "10:00 AM - 12:00 PM" },
  { value: "12:00-2:00", label: "12:00 PM - 02:00 PM" },
  { value: "2:30-4:30", label: "02:30 PM - 04:30 PM" },
  { value: "4:30-6:30", label: "04:30 PM - 06:30 PM" },
] as const;

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// Returns true if the date is in the past (overdue)
const isOverdue = (dateStr?: string | null): boolean => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

// Decodes the existing JWT to read the current user's role — no new context needed
const getCurrentUserRole = (): string | null => {
  const token = getAdminToken() ?? getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]))?.role ?? null;
  } catch {
    return null;
  }
};

// ── EMI row shape used only within this page's local edit state ────────────
interface EmiRow {
    id?: string;        
   installmentNumber?: number;
  amount: string;
  dueDate: string;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  locked: boolean;
}

// ── Editable field component ──────────────────────────────────────────────────
interface EditableFieldProps {
  label: string;
  value: string;
  editValue: string;
  isEditing: boolean;
  onEdit: () => void;
  onChange: (val: string) => void;
  type?: string;
  selectOptions?: readonly string[];
}

const EditableField = ({
  label,
  value,
  editValue,
  isEditing,
  onEdit,
  onChange,
  type = "text",
  selectOptions,
}: EditableFieldProps) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0 gap-4">
    <span className="text-sm text-muted-foreground shrink-0 w-40">{label}</span>
    {isEditing ? (
      selectOptions ? (
        <select
          value={editValue}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-9 rounded-lg border border-[#0037FF] bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0037FF]/20"
        >
          <option value="">Select…</option>
          {selectOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <Input
          type={type}
          value={editValue}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-9 border-[#0037FF] focus:ring-[#0037FF]/20"
          autoFocus
        />
      )
    ) : (
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-sm font-medium text-foreground text-right">{value || "—"}</span>
        <button
          onClick={onEdit}
          className="text-muted-foreground hover:text-[#0037FF] transition-colors p-1 rounded"
          title={`Edit ${label}`}
        >
          <Pencil size={12} />
        </button>
      </div>
    )}
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-base font-semibold text-foreground mt-0.5">{value}</p>
  </div>
);

export default function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Current user's role — used to gate Super Admin-only actions (e.g. deleting payments)
  const isSuperAdmin = getCurrentUserRole() === "super_admin";

  const [details, setDetails] = useState<AdminStudentDetails | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Profile edit state ────────────────────────────────────────────────────
  const [editingField, setEditingField] = useState<string>("");
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Assignment state ──────────────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedBatchDays, setSelectedBatchDays] = useState("");
  const [selectedBatchTime, setSelectedBatchTime] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [newMentor, setNewMentor] = useState({ name: "", email: "", specialization: "" });
  const [addingMentor, setAddingMentor] = useState(false);

  // ── Fee Collection Counsellor assignment ────────────────────────────────
  const { counsellors: feeCounsellors, loading: feeCounsellorsLoading } = useCounsellors();
  const [showAssignFeeCollector, setShowAssignFeeCollector] = useState(false);
  const [selectedFeeCollectorId, setSelectedFeeCollectorId] = useState("");
  const [feeCollectorReason, setFeeCollectorReason] = useState("");
  const [assigningFeeCollector, setAssigningFeeCollector] = useState(false);

  // ── Fee state ─────────────────────────────────────────────────────────────
  const [editingFee, setEditingFee] = useState(false);
  const [feeForm, setFeeForm] = useState<{
    totalFees: string;
    paymentMode: "full" | "emi";
    emiMonths: string;
    nextDueDate: string;
  }>({ totalFees: "", paymentMode: "full", emiMonths: "", nextDueDate: "" });
  const [paymentEntries, setPaymentEntries] = useState([
    { amount: "", paymentMethod: "UPI", transactionId: "" },
  ]);
  const [savingFee, setSavingFee] = useState(false);

  // ── Registration / Admission payment state (first-time setup only) ──────
  const [registrationPayment, setRegistrationPayment] = useState({ amount: "", paymentMethod: "UPI" });

  const registrationAmountNum = Number(registrationPayment.amount) || 0;
  const payableForEmi = Number(feeForm.totalFees || 0) - registrationAmountNum;

  // ── EMI plan state (lives inside the Fee section now) ────────────────────
  const [emiRows, setEmiRows] = useState<EmiRow[]>([]);
  const [emiLoading, setEmiLoading] = useState(false);

  // ── Due date quick-edit (full-payment mode only) ───────────────────────
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [dueDateValue, setDueDateValue] = useState("");
  const [savingDueDate, setSavingDueDate] = useState(false);

  // ── Payment Tracking state ────────────────────────────────────────────────
  const [showAddPayment, setShowAddPayment] = useState(false);
 const [newPayment, setNewPayment] = useState({
  amount: "",
  paymentMethod: "UPI" as (typeof PAYMENT_METHODS)[number],
  transactionId: "",
  paidAt: new Date().toISOString().slice(0, 10),
  installmentId: "",
});
  const [addingPayment, setAddingPayment] = useState(false);

  const [documents, setDocuments] = useState<StudentDocumentApiRecord[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [reviewingType, setReviewingType] = useState<DocumentSlotKey | null>(null);
  const [actionNoteFor, setActionNoteFor] = useState<DocumentSlotKey | null>(null);
  const [actionNoteText, setActionNoteText] = useState("");

  const openFeeCollectorPanel = () => {
    // Pre-fill with the currently assigned counsellor, if any
    const current = (details as any)?.student?.feeCollectionCounsellor;
    setSelectedFeeCollectorId(current?._id || "");
    setFeeCollectorReason("");
    setShowAssignFeeCollector(true);
  };

  const handleAssignFeeCollector = async () => {
    if (!id) return;
    setAssigningFeeCollector(true);
    try {
      const res = await adminStudentApi.assignFeeCollection(id, {
        feeCollectionCounsellorId: selectedFeeCollectorId || null,
        reason: feeCollectorReason.trim() || undefined,
      });
      toast.success(res.message || "Fee collection counsellor updated");
      setShowAssignFeeCollector(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update fee collection counsellor");
    } finally {
      setAssigningFeeCollector(false);
    }
  };

  const loadDocuments = async () => {
    if (!id) return;
    setDocsLoading(true);
    try {
      const res = await adminDocumentApi.getByStudent(id);
      setDocuments(res.data ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load documents");
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerify = async (type: DocumentSlotKey) => {
    if (!id) return;
    setReviewingType(type);
    try {
      await adminDocumentApi.verify(id, type);
      toast.success("Document verified");
      await loadDocuments();
    } catch (err: any) {
      toast.error(err.message || "Failed to verify document");
    } finally {
      setReviewingType(null);
    }
  };

  const handleRequestAction = async () => {
    if (!id || !actionNoteFor || !actionNoteText.trim()) {
      toast.error("Please enter a note explaining what's needed");
      return;
    }
    setReviewingType(actionNoteFor);
    try {
      await adminDocumentApi.requestAction(id, actionNoteFor, actionNoteText.trim());
      toast.success("Action requested from student");
      setActionNoteFor(null);
      setActionNoteText("");
      await loadDocuments();
    } catch (err: any) {
      toast.error(err.message || "Failed to request action");
    } finally {
      setReviewingType(null);
    }
  };

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [detailsRes, courseList, mentorList] = await Promise.all([
        adminStudentApi.getById(id),
        coursesApi.getAll(),
        mentorApi.getAll(),
      ]);
      setDetails(detailsRes);
      setCourses(courseList);
      setMentors(mentorList);

      const assignedCourse = detailsRes.assignment?.course;
      const assignedMentor = detailsRes.assignment?.mentor;
      setSelectedCourse(
        typeof assignedCourse === "string" ? assignedCourse : (assignedCourse as any)?._id || ""
      );
      setSelectedMentor(
        typeof assignedMentor === "string" ? assignedMentor : (assignedMentor as any)?._id || ""
      );
      setSelectedBatchDays(detailsRes.assignment?.batch?.days || "");
      setSelectedBatchTime(detailsRes.assignment?.batch?.time || "");

      // Init edit values from profile
      const p = detailsRes.profile;
      const s = detailsRes.student;
      setEditValues({
        fullName: p?.fullName || (s as any)?.fullName || "",
        mobileNumber: p?.mobileNumber || "",
        dob: p?.dob ? new Date(p.dob).toISOString().slice(0, 10) : "",
        fatherName: p?.fatherName || "",
        address: p?.address || "",
        city: p?.city || "",
        state: p?.state || "",
        pincode: p?.pincode || "",
        govtIdType: p?.govtIdType || "",
        govtIdNumber: p?.govtIdNumber || "",
      });

      // Sync due-date quick-edit value from loaded fee
      const currentDue = detailsRes.fee?.nextDueDate;
      setDueDateValue(
        currentDue ? new Date(currentDue).toISOString().slice(0, 10) : ""
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Load EMI plan whenever fee is in EMI mode (view + edit both need it) ──
  useEffect(() => {
    const loadEmiPlan = async () => {
      if (!id) return;
      if (details?.fee?.paymentMode !== "emi") {
        setEmiRows([]);
        return;
      }
      setEmiLoading(true);
      try {
        const res = await feeInstallmentApi.getAll(id);
        const rows: EmiRow[] = (res.data ?? [])
  .slice()
  .sort((a, b) => a.installmentNumber - b.installmentNumber)
  .map((inst) => ({
    id: inst._id,                          
    installmentNumber: inst.installmentNumber, 
    amount: String(inst.amount),
    dueDate: new Date(inst.dueDate).toISOString().slice(0, 10),
    paidAmount: inst.paidAmount,
    remainingAmount: inst.remainingAmount,
    status: inst.status,
    locked: inst.paidAmount > 0,
  }));
        setEmiRows(rows);
      } catch (err: any) {
        toast.error(err.message || "Failed to load EMI schedule");
      } finally {
        setEmiLoading(false);
      }
    };
    loadEmiPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, details?.fee?.paymentMode, details?.fee?.totalPaid]);

  // ── Profile field save ────────────────────────────────────────────────────
  const handleSaveField = async (fieldKey: string) => {
    if (!id) return;
    setSavingProfile(true);
    try {
      const payload: UpdateStudentProfilePayload = {
        [fieldKey]: editValues[fieldKey],
      };
      await studentApprovalApi.updateStudentProfile(id, payload);
      toast.success("Profile updated");
      setEditingField("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAllProfile = async () => {
    if (!id) return;
    setSavingProfile(true);
    try {
      await studentApprovalApi.updateStudentProfile(id, editValues as UpdateStudentProfilePayload);
      toast.success("All profile changes saved");
      setEditingField("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Assignment handlers ───────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!id || !selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    if ((selectedBatchDays && !selectedBatchTime) || (!selectedBatchDays && selectedBatchTime)) {
      toast.error("Please select both batch days and batch timing, or leave both blank");
      return;
    }
    setAssigning(true);
    try {
      const batch =
        selectedBatchDays && selectedBatchTime
          ? { days: selectedBatchDays as any, time: selectedBatchTime as any }
          : undefined;
      await assignmentApi.assign(id, selectedCourse, selectedMentor || undefined, batch);
      toast.success("Course & Mentor assigned successfully");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  const handleAddMentor = async () => {
    if (!newMentor.name || !newMentor.email) {
      toast.error("Mentor name and email are required");
      return;
    }
    setAddingMentor(true);
    try {
      const res = await mentorApi.create(newMentor);
      toast.success("Mentor added");
      setMentors((prev) => [...prev, res.data]);
      setSelectedMentor(res.data._id);
      setShowAddMentor(false);
      setNewMentor({ name: "", email: "", specialization: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to add mentor");
    } finally {
      setAddingMentor(false);
    }
  };

  // ── Fee handlers ──────────────────────────────────────────────────────────
  const startEditFee = () => {
    if (details?.fee) {
      const existingDue = details.fee.nextDueDate
        ? new Date(details.fee.nextDueDate).toISOString().slice(0, 10)
        : "";
      setFeeForm({
        totalFees: String(details.fee.totalFees),
        paymentMode: details.fee.paymentMode,
        emiMonths: details.fee.emiMonths ? String(details.fee.emiMonths) : "",
        nextDueDate: existingDue,
      });
    }
    setEditingFee(true);
  };

  const updatePaymentEntry = (idx: number, field: string, value: string) => {
    setPaymentEntries((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const removePaymentEntry = (idx: number) => {
    setPaymentEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalEnteredPaid = paymentEntries.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  // ── EMI plan handlers ─────────────────────────────────────────────────────
  const minEmiMonths = emiRows.filter((r) => r.locked).length;

  const handleEmiMonthsChange = (value: string) => {
    setFeeForm((prev) => ({ ...prev, emiMonths: value }));
    const count = Math.max(0, Number(value) || 0);
    setEmiRows((prev) => {
      const rows = [...prev];
      if (count > rows.length) {
        for (let i = rows.length; i < count; i++) {
          rows.push({ amount: "", dueDate: "", paidAmount: 0, remainingAmount: 0, status: "pending", locked: false });
        }
      } else if (count < rows.length) {
        const safeCount = Math.max(count, minEmiMonths);
        rows.length = safeCount;
      }
      return rows;
    });
  };

  const updateEmiRow = (index: number, field: "amount" | "dueDate", value: string) => {
    setEmiRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const scheduledEmiTotal = emiRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const handleSaveFee = async () => {
    if (!id) return;
    if (!feeForm.totalFees || Number(feeForm.totalFees) <= 0) {
      toast.error("Enter a valid total fee amount");
      return;
    }

    if (feeForm.paymentMode === "emi") {
      if (!feeForm.emiMonths || Number(feeForm.emiMonths) < 1) {
        toast.error("Enter the number of EMI");
        return;
      }
      if (emiRows.length !== Number(feeForm.emiMonths)) {
        toast.error("EMI boxes don't match the number of EMI entered");
        return;
      }
      for (let i = 0; i < emiRows.length; i++) {
        const row = emiRows[i];
        if (!row.amount || Number(row.amount) <= 0) {
          toast.error(`EMI ${i + 1}: enter a valid amount`);
          return;
        }
        if (!row.dueDate) {
          toast.error(`EMI ${i + 1}: select a due date`);
          return;
        }
      }
      const total = Math.round(payableForEmi * 100) / 100;
      const scheduled = Math.round(scheduledEmiTotal * 100) / 100;
      if (scheduled !== total) {
        toast.error(
          `EMI amounts must total ₹${total.toLocaleString("en-IN")} (Total Fee minus Registration Payment). Current total is ₹${scheduled.toLocaleString("en-IN")}.`
        );
        return;
      }
    }

    setSavingFee(true);
    try {
      const payload: any = {
        totalFees: Number(feeForm.totalFees),
        paymentMode: feeForm.paymentMode,
        nextDueDate: feeForm.paymentMode === "full" ? feeForm.nextDueDate || undefined : undefined,
      };

      if (feeForm.paymentMode === "emi") {
        payload.emiMonths = Number(feeForm.emiMonths);
        payload.installments = emiRows.map((r, i) => ({
          installmentNumber: i + 1,
          amount: Number(r.amount),
          dueDate: r.dueDate,
        }));
      }

      if (!details?.fee) {
        const validEntries = paymentEntries.filter((p) => p.amount && Number(p.amount) > 0);
        if (validEntries.length > 0) {
          payload.payments = validEntries.map((p) => ({
            amount: Number(p.amount),
            paymentMethod: p.paymentMethod,
            transactionId: p.transactionId || undefined,
          }));
        }

        if (registrationAmountNum > 0) {
          payload.registrationPayment = {
            amount: registrationAmountNum,
            paymentMethod: registrationPayment.paymentMethod,
          };
        }
      }

      await feeApi.setup(id, payload);
      toast.success("Fee plan saved successfully");
      setEditingFee(false);
      setPaymentEntries([{ amount: "", paymentMethod: "UPI", transactionId: "" }]);
      setRegistrationPayment({ amount: "", paymentMethod: "UPI" });
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save fee plan");
    } finally {
      setSavingFee(false);
    }
  };

  // ── Due date quick-save (full-payment mode only) ─────────────────────────
  const handleSaveDueDate = async () => {
    if (!id || !details?.fee) return;
    setSavingDueDate(true);
    try {
      await feeApi.setup(id, {
        totalFees: details.fee.totalFees,
        paymentMode: details.fee.paymentMode,
        emiMonths: details.fee.emiMonths ?? undefined,
        nextDueDate: dueDateValue || undefined,
      } as any);
      toast.success(dueDateValue ? "Due date updated" : "Due date cleared");
      setEditingDueDate(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update due date");
    } finally {
      setSavingDueDate(false);
    }
  };

  // ── Add Payment handler ───────────────────────────────────────────────────
  // const handleAddPayment = async () => {
  //   if (!id) return;
  //   if (!newPayment.amount || Number(newPayment.amount) <= 0) {
  //     toast.error("Enter a valid payment amount");
  //     return;
  //   }

  //   setAddingPayment(true);
  //   try {
  //     await paymentApi.add(id, {
  //       amount: Number(newPayment.amount),
  //       paymentMethod: newPayment.paymentMethod,
  //       transactionId: newPayment.transactionId || undefined,
  //       paidAt: newPayment.paidAt,
  //     });
  //     toast.success("Payment recorded — due date auto-updated if applicable");
  //     setShowAddPayment(false);
  //     setNewPayment({
  //       amount: "",
  //       paymentMethod: "UPI",
  //       transactionId: "",
  //       paidAt: new Date().toISOString().slice(0, 10),
  //     });
  //     await loadData();
  //   } catch (err: any) {
  //     toast.error(err.message || "Failed to record payment");
  //   } finally {
  //     setAddingPayment(false);
  //   }
  // };

  const handleAddPayment = async () => {
  if (!id) return;
  if (!newPayment.amount || Number(newPayment.amount) <= 0) {
    toast.error("Enter a valid payment amount");
    return;
  }
  if (details.fee?.paymentMode === "emi" && !newPayment.installmentId) {
    toast.error("Please select which EMI this payment is for");
    return;
  }

  setAddingPayment(true);
  try {
    await paymentApi.add(id, {
      amount: Number(newPayment.amount),
      paymentMethod: newPayment.paymentMethod,
      transactionId: newPayment.transactionId || undefined,
      paidAt: newPayment.paidAt,
      installmentId:
        details.fee?.paymentMode === "emi" ? newPayment.installmentId : undefined,
    });
    toast.success("Payment recorded successfully");
    setShowAddPayment(false);
    setNewPayment({
      amount: "",
      paymentMethod: "UPI",
      transactionId: "",
      paidAt: new Date().toISOString().slice(0, 10),
      installmentId: "",
    });
    await loadData();
  } catch (err: any) {
    toast.error(err.message || "Failed to record payment");
  } finally {
    setAddingPayment(false);
  }
};

  // ── Delete Payment handler (Super Admin only) ─────────────────────────────
  const handleDeletePayment = async (paymentId: string) => {
    if (!id) return;
    const confirmed = window.confirm(
      "Permanently delete this payment? This recalculates the fee, EMI status and totals, and cannot be undone."
    );
    if (!confirmed) return;
    try {
      await paymentApi.remove(id, paymentId);
      toast.success("Payment deleted and all records reconciled");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete payment");
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getDisplayValue = (key: string): string => {
    const p = details?.profile;
    switch (key) {
      case "fullName":
        return p?.fullName || (details?.student as any)?.fullName || "—";
      case "mobileNumber":
        return p?.mobileNumber || (details?.student as any)?.phone || "—";
      case "dob":
        return p?.dob ? formatDate(p.dob) : "—";
      case "fatherName":
        return p?.fatherName || "—";
      case "address":
        return p?.address || "—";
      case "city":
        return p?.city || "—";
      case "state":
        return p?.state || "—";
      case "pincode":
        return p?.pincode || "—";
      case "govtIdType":
        return p?.govtIdType || "—";
      case "govtIdNumber":
        return p?.govtIdNumber || "—";
      default:
        return "—";
    }
  };

  const makeFieldProps = (key: string, label: string, extra: Partial<EditableFieldProps> = {}) => ({
    label,
    value: getDisplayValue(key),
    editValue: editValues[key] ?? "",
    isEditing: editingField === key,
    onEdit: () => setEditingField(key),
    onChange: (val: string) =>
      setEditValues((prev) => ({ ...prev, [key]: val })),
    ...extra,
  });

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout title="Student Details" subtitle="Loading...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#0037FF]" />
        </div>
      </AdminLayout>
    );
  }

  if (!details) {
    return (
      <AdminLayout title="Student Details" subtitle="">
        <p className="text-muted-foreground">Student not found.</p>
      </AdminLayout>
    );
  }

  const { student, profile } = details;
  const payments: PaymentRecord[] = details.payments || [];
  const hasUnsavedEdits = editingField !== "";

  // Is the due date overdue?
  const dueDateOverdue = isOverdue(details.fee?.nextDueDate);

  // Next EMI (first unlocked/unpaid row) — used in the summary card
  const nextEmiRow = emiRows.find((r) => !r.locked);

  return (
    <AdminLayout
      title={
        profile?.fullName ||
        (student as any)?.fullName ||
        [(student as any)?.firstName, (student as any)?.lastName].filter(Boolean).join(" ") ||
        student.email ||
        "Student"
      }
      subtitle={`Student ID: ${(student as any).studentId || "Not approved yet"}`}
      actions={
        <div className="flex gap-2">
          {hasUnsavedEdits && (
            <Button
              size="sm"
              className="text-white bg-green-600 hover:bg-green-700"
              onClick={handleSaveAllProfile}
              disabled={savingProfile}
            >
              <Save size={14} className="mr-1" />
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/students")}>
            <ArrowLeft size={14} className="mr-1" /> Back to Students
          </Button>
        </div>
      }
    >
      {hasUnsavedEdits && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <span>You have unsaved changes. Click a field's save icon or use "Save Changes" above.</span>
          <button
            onClick={() => {
              setEditingField("");
              const p = details?.profile;
              const s = details?.student;
              setEditValues({
                fullName: p?.fullName || (s as any)?.fullName || "",
                mobileNumber: p?.mobileNumber || "",
                dob: p?.dob ? new Date(p.dob).toISOString().slice(0, 10) : "",
                fatherName: p?.fatherName || "",
                address: p?.address || "",
                city: p?.city || "",
                state: p?.state || "",
                pincode: p?.pincode || "",
                govtIdType: p?.govtIdType || "",
                govtIdNumber: p?.govtIdNumber || "",
              });
            }}
            className="ml-4 text-amber-600 hover:text-amber-800 font-medium underline"
          >
            Discard
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Student Information ── */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <IdCard size={16} className="text-[#0037FF]" /> Student Information
            </h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Pencil size={11} /> Click any field to edit
            </span>
          </div>

          {/* Read-only fields */}
          <div className="flex items-center justify-between py-2.5 border-b border-border/60">
            <span className="text-sm text-muted-foreground w-40">Student ID</span>
            <span className="text-sm font-medium font-mono text-[#0037FF]">
              {(student as any).studentId || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-border/60">
            <span className="text-sm text-muted-foreground w-40">Email</span>
            <span className="text-sm font-medium">{student.email}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-border/60">
            <span className="text-sm text-muted-foreground w-40">Registration Date</span>
            <span className="text-sm font-medium">{formatDate((student as any).createdAt)}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-border/60">
            <span className="text-sm text-muted-foreground w-40">Approval Date</span>
            <span className="text-sm font-medium">{formatDate((student as any).approvedAt)}</span>
          </div>

          {/* Editable fields */}
          {[
            makeFieldProps("fullName", "Full Name"),
            makeFieldProps("mobileNumber", "Mobile Number", { type: "tel" }),
            makeFieldProps("dob", "Date of Birth", { type: "date" }),
            makeFieldProps("fatherName", "Father's Name"),
            makeFieldProps("address", "Address"),
            makeFieldProps("city", "City"),
            makeFieldProps("state", "State"),
            makeFieldProps("pincode", "Pincode"),
            makeFieldProps("govtIdType", "Govt ID Type", { selectOptions: GOVT_ID_TYPES }),
            makeFieldProps("govtIdNumber", "Govt ID Number"),
          ].map((fieldProps) => (
            <div key={fieldProps.label} className="relative">
              <EditableField {...fieldProps} />
              {fieldProps.isEditing && (
                <div className="flex justify-end gap-2 py-1.5">
                  <button
                    onClick={() => setEditingField("")}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const keyMap: Record<string, string> = {
                        "Full Name": "fullName",
                        "Mobile Number": "mobileNumber",
                        "Date of Birth": "dob",
                        "Father's Name": "fatherName",
                        Address: "address",
                        City: "city",
                        State: "state",
                        Pincode: "pincode",
                        "Govt ID Type": "govtIdType",
                        "Govt ID Number": "govtIdNumber",
                      };
                      handleSaveField(keyMap[fieldProps.label] || "");
                    }}
                    disabled={savingProfile}
                    className="text-xs text-white bg-[#0037FF] hover:bg-[#0028cc] px-3 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle2 size={11} />
                    {savingProfile ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Govt ID Image */}
          {profile?.govtIdImageUrl ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Government ID Image</p>
              <img
                src={profile.govtIdImageUrl}
                alt="Government ID"
                className="w-full max-w-sm rounded-lg border border-border"
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground italic">
              Student hasn't completed their profile yet. Fields above can still be filled by admin.
            </p>
          )}
        </div>

        {/* ── Course Assignment ── */}
        <div className="rounded-xl border border-border bg-card p-5 self-start">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <GraduationCap size={16} className="text-[#0037FF]" /> Course Assignment
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Assigned Course</Label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Assigned Teacher</Label>
                <button
                  type="button"
                  onClick={() => setShowAddMentor((v) => !v)}
                  className="text-xs text-[#0037FF] flex items-center gap-1 hover:underline"
                >
                  <Plus size={12} /> New mentor
                </button>
              </div>
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="">No mentor</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} {m.specialization ? `· ${m.specialization}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Batch Days</Label>
                <select
                  value={selectedBatchDays}
                  onChange={(e) => setSelectedBatchDays(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="">Select days</option>
                  {BATCH_DAYS_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Batch Timing</Label>
                <select
                  value={selectedBatchTime}
                  onChange={(e) => setSelectedBatchTime(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="">Select timing</option>
                  {BATCH_TIME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {showAddMentor && (
              <div className="rounded-lg border border-dashed border-border p-3 space-y-2 bg-muted/30">
                <Input
                  placeholder="Mentor name"
                  value={newMentor.name}
                  onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                  className="h-9"
                />
                <Input
                  placeholder="Mentor email"
                  value={newMentor.email}
                  onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                  className="h-9"
                />
                <Input
                  placeholder="Specialization (optional)"
                  value={newMentor.specialization}
                  onChange={(e) =>
                    setNewMentor({ ...newMentor, specialization: e.target.value })
                  }
                  className="h-9"
                />
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleAddMentor}
                  disabled={addingMentor}
                >
                  <UserPlus size={14} className="mr-1" />
                  {addingMentor ? "Adding..." : "Add Mentor"}
                </Button>
              </div>
            )}

            <Button className="w-full text-white" onClick={handleAssign} disabled={assigning}>
              {assigning ? "Saving..." : "Save Assignment"}
            </Button>

            {/* ── Currently Assigned (confirmation display) ── */}
            {details.assignment && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1.5">
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Currently Assigned
                </p>
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">Course:</span>{" "}
                  <span className="font-medium">
                    {typeof details.assignment.course === "object"
                      ? details.assignment.course.title
                      : "—"}
                  </span>
                </p>
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">Mentor:</span>{" "}
                  <span className="font-medium">
                    {details.assignment.mentor && typeof details.assignment.mentor === "object"
                      ? (details.assignment.mentor as any).name
                      : "Not assigned"}
                  </span>
                </p>

                {details.assignment.batch?.days && details.assignment.batch?.time && (
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">Batch:</span>{" "}
                    <span className="font-medium">
                      {details.assignment.batch.days} ·{" "}
                      {BATCH_TIME_OPTIONS.find((t) => t.value === details.assignment!.batch!.time)?.label}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fees Management ── */}
      <div className="mt-5 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Wallet size={16} className="text-[#0037FF]" /> Fees Management
        </h3>

        {/* ── Fee Collection Counsellor ── */}
        <div className="mb-4 rounded-lg border border-border bg-secondary/20 p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <UserCog size={15} className="text-[#0037FF]" />
              <span className="text-sm font-medium text-foreground">Fee Collection Counsellor</span>
            </div>
            <button
              onClick={openFeeCollectorPanel}
              className="text-xs text-[#0037FF] hover:underline flex items-center gap-1"
            >
              <Pencil size={11} />
              {(details as any)?.student?.feeCollectionCounsellor ? "Change" : "Assign"}
            </button>
          </div>
          <p className="mt-2 text-sm text-foreground">
            {(details as any)?.student?.feeCollectionCounsellor?.fullName || (
              <span className="text-muted-foreground italic">Unassigned</span>
            )}
          </p>
          {(details as any)?.student?.feeCollectionCounsellor?.email && (
            <p className="text-xs text-muted-foreground">
              {(details as any).student.feeCollectionCounsellor.email}
            </p>
          )}
        </div>

        {details.fee && !editingFee ? (
          <div className="space-y-4">
            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Total Fees" value={`₹${details.fee.totalFees.toLocaleString()}`} />
              <Stat label="Total Paid" value={`₹${details.fee.totalPaid.toLocaleString()}`} />
              <Stat label="Remaining" value={`₹${details.fee.remainingAmount.toLocaleString()}`} />
              <Stat
                label="Payment Mode"
                value={details.fee.paymentMode === "emi" ? `EMI (${details.fee.emiMonths})` : "Full Payment"}
              />
            </div>

            {details.fee.paymentMode === "emi" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat
                  label="Next EMI Amount"
                  value={nextEmiRow ? `₹${Number(nextEmiRow.amount).toLocaleString()}` : "—"}
                />
                <Stat
                  label="Next EMI Due"
                  value={nextEmiRow ? formatDate(nextEmiRow.dueDate) : "—"}
                />
              </div>
            )}

            {/* ── Progress bar ── */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Payment Progress</span>
                <span>
                  {Math.min(
                    100,
                    Math.round((details.fee.totalPaid / details.fee.totalFees) * 100)
                  )}%
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0037FF] transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((details.fee.totalPaid / details.fee.totalFees) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* ── Next Fee Due Date block (only meaningful for full-payment) ── */}
            {details.fee.paymentMode === "full" && (
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarClock
                      size={15}
                      className={
                        details.fee.remainingAmount <= 0
                          ? "text-emerald-500"
                          : dueDateOverdue
                          ? "text-red-500"
                          : "text-[#0037FF]"
                      }
                    />
                    <span className="text-sm font-medium text-foreground">Next Fee Due Date</span>

                    {details.fee.remainingAmount <= 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 size={11} /> Fully Paid
                      </span>
                    ) : dueDateOverdue && details.fee.nextDueDate ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                        <AlertTriangle size={11} /> Overdue
                      </span>
                    ) : null}
                  </div>

                  {details.fee.remainingAmount > 0 && (
                    <div className="flex items-center gap-2">
                      {!editingDueDate ? (
                        <button
                          onClick={() => {
                            setDueDateValue(
                              details.fee?.nextDueDate
                                ? new Date(details.fee.nextDueDate).toISOString().slice(0, 10)
                                : ""
                            );
                            setEditingDueDate(true);
                          }}
                          className="text-xs text-[#0037FF] hover:underline flex items-center gap-1"
                        >
                          <Pencil size={11} />
                          {details.fee.nextDueDate ? "Change" : "Set date"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <DatePicker
                            value={dueDateValue}
                            onChange={setDueDateValue}
                            disablePast
                            placeholder="Pick due date"
                            triggerClassName="h-8 text-xs"
                          />
                          <button
                            onClick={handleSaveDueDate}
                            disabled={savingDueDate}
                            className="text-xs text-white bg-[#0037FF] hover:bg-[#0028cc] px-3 py-1.5 rounded flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckCircle2 size={11} />
                            {savingDueDate ? "Saving…" : "Save"}
                          </button>
                          {dueDateValue && (
                            <button
                              onClick={() => setDueDateValue("")}
                              className="text-xs text-muted-foreground hover:text-destructive px-2 py-1.5 rounded border border-border"
                              title="Clear due date"
                            >
                              Clear
                            </button>
                          )}
                          <button
                            onClick={() => setEditingDueDate(false)}
                            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded border border-border"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  {details.fee.remainingAmount <= 0 ? (
                    <p className="text-sm text-emerald-600 font-medium">
                      All dues cleared — no upcoming payments required.
                    </p>
                  ) : details.fee.nextDueDate ? (
                    <p
                      className={`text-base font-semibold ${
                        dueDateOverdue ? "text-red-600" : "text-foreground"
                      }`}
                    >
                      {formatDate(details.fee.nextDueDate)}
                      {dueDateOverdue && (
                        <span className="ml-2 text-xs font-normal text-red-500">
                          (
                          {Math.ceil(
                            (new Date().getTime() -
                              new Date(details.fee.nextDueDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          day
                          {Math.ceil(
                            (new Date().getTime() -
                              new Date(details.fee.nextDueDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) !== 1
                            ? "s"
                            : ""}{" "}
                          overdue)
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No due date set. Click "Set date" to add one.
                    </p>
                  )}

                  {details.fee.nextDueDate && details.fee.remainingAmount > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      This date auto-advances to the same date next month after each successful
                      payment. It clears automatically when the fee is fully paid.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── EMI Schedule (read-only view, inside Fee section) ── */}
            {details.fee.paymentMode === "emi" && (
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={15} className="text-[#0037FF]" />
                  <span className="text-sm font-medium text-foreground">EMI Payment Plan</span>
                </div>

                {emiLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
                    <Loader2 size={14} className="animate-spin" /> Loading EMI schedule…
                  </div>
                ) : emiRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No EMI schedule found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">EMI #</th>
                          <th className="px-3 py-2 text-left font-medium">Amount</th>
                          <th className="px-3 py-2 text-left font-medium">Due Date</th>
                          <th className="px-3 py-2 text-left font-medium">Paid</th>
                          <th className="px-3 py-2 text-left font-medium">Remaining</th>
                          <th className="px-3 py-2 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emiRows.map((row, idx) => {
                          const statusStyle: Record<string, string> = {
                            pending: "bg-secondary text-muted-foreground",
                            partial: "bg-yellow-500/10 text-yellow-600",
                            paid: "bg-green-500/10 text-green-600",
                            overdue: "bg-red-500/10 text-red-600",
                          };
                          return (
                            <tr key={idx} className="border-b border-border/50 last:border-0">
                              <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">#{idx + 1}</td>
                              <td className="px-3 py-2.5 font-semibold">₹{Number(row.amount).toLocaleString()}</td>
                              <td className="px-3 py-2.5">{formatDate(row.dueDate)}</td>
                              <td className="px-3 py-2.5 text-muted-foreground">₹{row.paidAmount.toLocaleString()}</td>
                              <td className="px-3 py-2.5 text-muted-foreground">₹{row.remainingAmount.toLocaleString()}</td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                    statusStyle[row.status] || statusStyle.pending
                                  }`}
                                >
                                  {row.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <Button variant="outline" size="sm" onClick={startEditFee}>
              <Pencil size={13} className="mr-1" /> Edit Fee Plan
            </Button>
          </div>
        ) : (
          /* ── Fee setup / edit form ── */
          <div className="space-y-4 max-w-2xl">
            <div className="space-y-1.5">
              <Label className="text-xs">Total Course Fees (₹)</Label>
              <Input
                type="number"
                value={feeForm.totalFees}
                onChange={(e) => setFeeForm({ ...feeForm, totalFees: e.target.value })}
                placeholder="e.g. 50000"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Payment Mode</Label>
              <div className="flex gap-2">
                {(["full", "emi"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFeeForm({ ...feeForm, paymentMode: mode })}
                    className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors capitalize ${
                      feeForm.paymentMode === mode
                        ? "bg-[#0037FF] text-white border-[#0037FF]"
                        : "border-border text-muted-foreground hover:bg-secondary/40"
                    }`}
                  >
                    {mode === "emi" ? "EMI" : "Full Payment"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── EMI Payment Plan (auto-generated boxes) ── */}
            {feeForm.paymentMode === "emi" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Number of EMI</Label>
                  <Input
                    type="number"
                    min={minEmiMonths || 1}
                    value={feeForm.emiMonths}
                    onChange={(e) => handleEmiMonthsChange(e.target.value)}
                    placeholder="e.g. 6"
                  />
                  {minEmiMonths > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      {minEmiMonths} EMI{minEmiMonths > 1 ? "s" : ""} already paid — count can't go below this.
                    </p>
                  )}
                </div>

                {emiLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
                    <Loader2 size={14} className="animate-spin" /> Loading EMI plan…
                  </div>
                ) : emiRows.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-foreground">EMI Payment Plan</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {emiRows.map((row, idx) => (
                        <div key={idx} className="rounded-xl border border-border p-3 space-y-2 bg-muted/20">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">EMI {idx + 1}</span>
                            {row.locked && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 capitalize">
                                {row.status} (locked)
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Amount (₹)</Label>
                            <Input
                              type="number"
                              value={row.amount}
                              disabled={row.locked}
                              onChange={(e) => updateEmiRow(idx, "amount", e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Due Date</Label>
                            <DatePicker
                              value={row.dueDate}
                              onChange={(val) => updateEmiRow(idx, "dueDate", val)}
                              disabled={row.locked}
                              placeholder="Pick due date"
                              triggerClassName="h-8 text-xs w-full"
                            />
                          </div>
                          {row.locked && (
                            <p className="text-[11px] text-muted-foreground pt-1">
                              Paid ₹{row.paidAmount.toLocaleString()} · Remaining ₹{row.remainingAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg bg-secondary/30 px-3 py-2 text-xs space-y-0.5">
                      <p>Total Fee: ₹{Number(feeForm.totalFees || 0).toLocaleString("en-IN")}</p>
                      {registrationAmountNum > 0 && (
                        <p>Registration Payment: ₹{registrationAmountNum.toLocaleString("en-IN")}</p>
                      )}
                      <p>Payable via EMI: ₹{payableForEmi.toLocaleString("en-IN")}</p>
                      <p>Scheduled EMI: ₹{scheduledEmiTotal.toLocaleString("en-IN")}</p>
                      <p
                        className={
                          payableForEmi - scheduledEmiTotal === 0
                            ? "text-emerald-600 font-medium"
                            : "text-amber-600 font-medium"
                        }
                      >
                        Remaining to Schedule: ₹{(payableForEmi - scheduledEmiTotal).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ── Next Fee Due Date (full-payment mode only) ── */}
            {feeForm.paymentMode === "full" && (
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <CalendarClock size={12} className="text-[#0037FF]" />
                  Next Fee Due Date
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <DatePicker
                  value={feeForm.nextDueDate}
                  onChange={(val) => setFeeForm({ ...feeForm, nextDueDate: val })}
                  disablePast
                  placeholder="Pick due date"
                  triggerClassName="w-full"
                />
                <p className="text-[11px] text-muted-foreground">
                  Set the date by which the full payment should be received.
                </p>
              </div>
            )}

            {/* Registration / Admission payment (first-time setup only, one-time) */}
            {!details?.fee && (
              <div className="space-y-1.5">
                <Label className="text-xs">Registration / Admission / Initial Payment (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="e.g. 10000"
                    value={registrationPayment.amount}
                    onChange={(e) => setRegistrationPayment((p) => ({ ...p, amount: e.target.value }))}
                    className="h-9"
                  />
                  <select
                    value={registrationPayment.paymentMethod}
                    onChange={(e) => setRegistrationPayment((p) => ({ ...p, paymentMethod: e.target.value }))}
                    className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Recorded immediately as a successful payment. Excluded from the EMI schedule below.
                </p>
              </div>
            )}

            {/* Initial payment entries (first-time only) */}
            {!details?.fee && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    {feeForm.paymentMode === "emi"
                      ? "Initial EMI Payments (optional)"
                      : "Amount Paid (optional)"}
                  </Label>
                  {feeForm.paymentMode === "emi" && (
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentEntries((prev) => [
                          ...prev,
                          { amount: "", paymentMethod: "UPI", transactionId: "" },
                        ])
                      }
                      className="text-xs text-[#0037FF] flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} /> Add entry
                    </button>
                  )}
                </div>
                {paymentEntries.map((entry, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={`Payment ${idx + 1} amount`}
                      value={entry.amount}
                      onChange={(e) => updatePaymentEntry(idx, "amount", e.target.value)}
                      className="h-9"
                    />
                    <select
                      value={entry.paymentMethod}
                      onChange={(e) => updatePaymentEntry(idx, "paymentMethod", e.target.value)}
                      className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    {feeForm.paymentMode === "emi" && paymentEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePaymentEntry(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {totalEnteredPaid > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Total Paid so far: ₹{totalEnteredPaid} · Remaining: ₹
                    {(Number(feeForm.totalFees || 0) - totalEnteredPaid).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSaveFee} disabled={savingFee} className="text-white">
                {savingFee ? "Saving..." : "Save Fee Plan"}
              </Button>
              {details?.fee && (
                <Button variant="outline" onClick={() => setEditingFee(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Payment Tracking ── */}
      <div className="mt-5 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <History size={16} className="text-[#0037FF]" /> Payment Tracking
          </h3>
          {details.fee && (
            <Button
              size="sm"
              onClick={() => setShowAddPayment((v) => !v)}
              variant={showAddPayment ? "outline" : "default"}
              className={showAddPayment ? "" : "text-white"}
            >
              {showAddPayment ? (
                <>
                  <X size={14} className="mr-1" /> Cancel
                </>
              ) : (
                <>
                  <Plus size={14} className="mr-1" /> Record Payment
                </>
              )}
            </Button>
          )}
        </div>

        {/* Add Payment Form */}
        {/* {showAddPayment && (
          <div className="mb-5 p-4 rounded-xl border border-dashed border-border bg-muted/30 space-y-3 max-w-lg">
            <p className="text-xs font-semibold text-foreground">New Payment Entry</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Amount (₹) *</Label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Payment Method</Label>
                <select
                  value={newPayment.paymentMethod}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, paymentMethod: e.target.value as any })
                  }
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Transaction ID (optional)</Label>
                <Input
                  placeholder="TXN123..."
                  value={newPayment.transactionId}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, transactionId: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Payment Date</Label>
                <DatePicker
                  value={newPayment.paidAt}
                  onChange={(val) => setNewPayment({ ...newPayment, paidAt: val })}
                  disableFuture
                  placeholder="Pick payment date"
                  triggerClassName="w-full h-9"
                />
              </div>
            </div>

            {details.fee && newPayment.amount && Number(newPayment.amount) > 0 && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 space-y-0.5">
                <p>
                  After this: Paid ₹
                  {(details.fee.totalPaid + Number(newPayment.amount)).toLocaleString()} ·
                  Remaining ₹
                  {Math.max(
                    0,
                    details.fee.remainingAmount - Number(newPayment.amount)
                  ).toLocaleString()}
                </p>
                {details.fee.paymentMode === "full" &&
                  details.fee.nextDueDate &&
                  details.fee.remainingAmount - Number(newPayment.amount) > 0 && (
                    <p>
                      Due date will auto-advance to{" "}
                      <strong>
                        {formatDate(
                          (() => {
                            const d = new Date(details.fee!.nextDueDate! as string);
                            d.setMonth(d.getMonth() + 1);
                            return d.toISOString();
                          })()
                        )}
                      </strong>{" "}
                      if current due date has passed.
                    </p>
                  )}
                {details.fee.paymentMode === "emi" && (
                  <p>This payment will be applied to the earliest unpaid EMI first.</p>
                )}
              </div>
            )}

            <Button
              size="sm"
              onClick={handleAddPayment}
              disabled={addingPayment}
              className="w-full text-white"
            >
              <IndianRupee size={14} className="mr-1" />
              {addingPayment ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        )} */}


        {/* Add Payment Form */}
{showAddPayment && (
  <div className="mb-5 p-4 rounded-xl border border-dashed border-border bg-muted/30 space-y-3 max-w-lg">
    <p className="text-xs font-semibold text-foreground">New Payment Entry</p>

    {details.fee?.paymentMode === "emi" && (
      <div className="space-y-1">
        <Label className="text-xs">EMI *</Label>
        <select
          value={newPayment.installmentId}
          onChange={(e) => {
            const selectedId = e.target.value;
            const row = emiRows.find((r) => r.id === selectedId);
            setNewPayment((prev) => ({
              ...prev,
              installmentId: selectedId,
              amount: row ? row.remainingAmount.toString() : prev.amount,
            }));
          }}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">Select EMI…</option>
          {emiRows
            .filter((r) => r.status !== "paid" && r.remainingAmount > 0)
            .map((row, idx) => (
              <option key={row.id ?? idx} value={row.id ?? ""}>
                EMI {row.installmentNumber ?? idx + 1} — ₹
                {Number(row.remainingAmount).toLocaleString()} remaining — {row.status}
              </option>
            ))}
        </select>
        {emiRows.every((r) => r.status === "paid") && emiRows.length > 0 && (
          <p className="text-[11px] text-muted-foreground">All EMIs are fully paid.</p>
        )}
      </div>
    )}

    {(() => {
      const selectedRow = emiRows.find((r) => r.id === newPayment.installmentId);
      return selectedRow ? (
        <div className="rounded-lg bg-secondary/30 px-3 py-2 text-xs space-y-0.5">
          <p>EMI Amount: ₹{Number(selectedRow.amount).toLocaleString()}</p>
          <p>Already Paid: ₹{selectedRow.paidAmount.toLocaleString()}</p>
          <p>Remaining: ₹{selectedRow.remainingAmount.toLocaleString()}</p>
          <p>Due Date: {formatDate(selectedRow.dueDate)}</p>
          <p className="capitalize">Status: {selectedRow.status}</p>
        </div>
      ) : null;
    })()}

    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Amount (₹) *</Label>
        <Input
          type="number"
          placeholder="e.g. 5000"
          value={newPayment.amount}
          max={
            emiRows.find((r) => r.id === newPayment.installmentId)?.remainingAmount ?? undefined
          }
          onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
          className="h-9"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Payment Method</Label>
        <select
          value={newPayment.paymentMethod}
          onChange={(e) =>
            setNewPayment({ ...newPayment, paymentMethod: e.target.value as any })
          }
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Transaction ID (optional)</Label>
        <Input
          placeholder="TXN123..."
          value={newPayment.transactionId}
          onChange={(e) =>
            setNewPayment({ ...newPayment, transactionId: e.target.value })
          }
          className="h-9"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Payment Date</Label>
        <DatePicker
          value={newPayment.paidAt}
          onChange={(val) => setNewPayment({ ...newPayment, paidAt: val })}
          disableFuture
          placeholder="Pick payment date"
          triggerClassName="w-full h-9"
        />
      </div>
    </div>

    {details.fee && newPayment.amount && Number(newPayment.amount) > 0 && (
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 space-y-0.5">
        <p>
          After this: Paid ₹
          {(details.fee.totalPaid + Number(newPayment.amount)).toLocaleString()} ·
          Remaining ₹
          {Math.max(
            0,
            details.fee.remainingAmount - Number(newPayment.amount)
          ).toLocaleString()}
        </p>
        {details.fee.paymentMode === "full" &&
          details.fee.nextDueDate &&
          details.fee.remainingAmount - Number(newPayment.amount) > 0 && (
            <p>
              Due date will auto-advance to{" "}
              <strong>
                {formatDate(
                  (() => {
                    const d = new Date(details.fee!.nextDueDate! as string);
                    d.setMonth(d.getMonth() + 1);
                    return d.toISOString();
                  })()
                )}
              </strong>{" "}
              if current due date has passed.
            </p>
          )}
        {details.fee.paymentMode === "emi" && (
          <p>This payment will be applied only to the selected EMI.</p>
        )}
      </div>
    )}

    <Button
      size="sm"
      onClick={handleAddPayment}
      disabled={addingPayment}
      className="w-full text-white"
    >
      <IndianRupee size={14} className="mr-1" />
      {addingPayment ? "Recording..." : "Record Payment"}
    </Button>
  </div>
)}  

        {/* Payment History Table */}
        {!details.fee ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Set up a fee plan first to start tracking payments.
          </p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No payments recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Amount</th>
                  <th className="px-3 py-2 text-left font-medium">Method</th>
                  <th className="px-3 py-2 text-left font-medium">Transaction ID</th>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  {isSuperAdmin && <th className="px-3 py-2 text-left font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/20"
                  >
                    <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">
                      #{p.paymentNumber}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-foreground">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.paymentMethod}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                      {p.transactionId || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{formatDate(p.paidAt)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.paymentStatus === "success"
                            ? "bg-green-500/10 text-green-600"
                            : p.paymentStatus === "pending"
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                      {(p as any).isRegistrationPayment && (
                        <span className="ml-1 inline-block px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-600">
                          Registration
                        </span>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => handleDeletePayment(p._id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-border">
                <tr className="bg-muted/30">
                  <td className="px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                    Total
                  </td>
                  <td className="px-3 py-2.5 font-bold text-foreground">
                    ₹
                    {payments
                      .filter((p) => p.paymentStatus === "success")
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </td>
                  <td colSpan={isSuperAdmin ? 5 : 4} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Assign Fee Collection Counsellor Modal ──────────────────────── */}
      {showAssignFeeCollector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">Assign Fee Collection Counsellor</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Independent of the assigned lead/course counsellor.
                </p>
              </div>
              <button
                onClick={() => setShowAssignFeeCollector(false)}
                className="rounded-lg p-1.5 hover:bg-secondary/60 text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <Label className="text-xs">Counsellor</Label>
                {feeCounsellorsLoading ? (
                  <p className="text-xs text-muted-foreground">Loading counsellors…</p>
                ) : (
                  <select
                    value={selectedFeeCollectorId}
                    onChange={(e) => setSelectedFeeCollectorId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    <option value="">Unassign</option>
                    {feeCounsellors.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.fullName} ({c.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Reason (optional)</Label>
                <Input
                  value={feeCollectorReason}
                  onChange={(e) => setFeeCollectorReason(e.target.value)}
                  placeholder="e.g. Reassigning to balance workload"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setShowAssignFeeCollector(false)}
                disabled={assigningFeeCollector}
              >
                Cancel
              </Button>
              <Button
                className="text-white"
                onClick={handleAssignFeeCollector}
                disabled={assigningFeeCollector}
              >
                {assigningFeeCollector ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Documents Review ── */}
      <div className="mt-5 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <FileCheck2 size={16} className="text-[#0037FF]" /> Documents
        </h3>

        {docsLoading ? (
          <p className="text-sm text-muted-foreground">Loading documents...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOC_SLOTS.map((slot) => {
              const doc = documents.find((d) => d.id === slot.key);
              const status = doc?.status ?? "empty";
              const isBusy = reviewingType === slot.key;

              const statusStyle: Record<string, string> = {
                empty: "bg-secondary text-muted-foreground",
                under_review: "bg-yellow-500/10 text-yellow-600",
                verified: "bg-green-500 text-white",
                action_required: "bg-red-500/10 text-red-600",
              };

              return (
                <div key={slot.key} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{slot.label}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium text-white ${statusStyle[status]}`}>
                      {status === "empty" ? "Not Uploaded" : status.replace("_", " ")}
                    </span>
                  </div>

                  {doc?.note && (
                    <p className="text-xs text-red-600 flex items-start gap-1">
                      <AlertOctagon size={12} className="mt-0.5 shrink-0" /> {doc.note}
                    </p>
                  )}

                  {doc?.fileUrl && (
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#0037FF] hover:underline"
                      >
                        View file
                      </a>
                      {status !== "verified" && (
                        <button
                          onClick={() => handleVerify(slot.key)}
                          disabled={isBusy}
                          className="text-xs text-white bg-green-600 px-2.5 py-1 rounded "
                        >
                          {isBusy ? "..." : "Verify"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActionNoteFor(slot.key);
                          setActionNoteText(doc.note || "");
                        }}
                        disabled={isBusy}
                        className="text-xs text-red-600 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded disabled:opacity-50"
                      >
                        Request Action
                      </button>
                    </div>
                  )}

                  {actionNoteFor === slot.key && (
                    <div className="pt-1 space-y-1.5">
                      <Input
                        placeholder="Reason (e.g. blurry image, wrong document)"
                        value={actionNoteText}
                        onChange={(e) => setActionNoteText(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleRequestAction}
                          disabled={isBusy}
                          className="text-xs text-white bg-[#0037FF] px-2.5 py-1 rounded disabled:opacity-50"
                        >
                          {isBusy ? "Sending..." : "Send"}
                        </button>
                        <button
                          onClick={() => {
                            setActionNoteFor(null);
                            setActionNoteText("");
                          }}
                          className="text-xs text-muted-foreground px-2.5 py-1 rounded border border-border"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}