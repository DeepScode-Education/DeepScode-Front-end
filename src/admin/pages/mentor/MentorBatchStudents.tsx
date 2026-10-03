// import {
//   useEffect,
//   useState,
//   useCallback,
//   useMemo,
// } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import MentorLayout from "../../components/MentorLayout";
// import { Button } from "@/components/ui/button";
// import {
//   mentorDashboardApi,
//   liveClassApi,
//   type MentorBatchStudentRow,
//   type LiveClassRecord,
//   type LiveBatchDays,
//   type LiveBatchTime,
// } from "@/integrations/client";
// import { useLiveClass } from "@/contexts/LiveClassContext";
// import {
//   ArrowLeft,
//   Users,
//   Radio,
//   PhoneOff,
//   ClipboardCheck,
//   X,
//   Save,
// } from "lucide-react";
// import {
//   batchAttendanceApi,
//   type BatchAttendanceStudent,
// } from "@/integrations/client";
// import { useAuth } from "@/contexts/AuthContext";

// const BATCH_TIME_LABELS: Record<string, string> = {
//   "10:00-12:00": "10:00 AM - 12:00 PM",
//   "12:00-2:00": "12:00 PM - 02:00 PM",
//   "2:30-4:30": "02:30 PM - 04:30 PM",
//   "4:30-6:30": "04:30 PM - 06:30 PM",
// };

// interface BatchInfo {
//   course: string;
//   courseId: string | null;
//   days: string | null;
//   time: string | null;
// }

// const MentorBatchStudents = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const liveClass = useLiveClass();
//   const isThisBatchLive =
//     liveClass.session?.liveClassId != null &&
//     liveClass.session.role === "mentor";

//   const [students, setStudents] = useState<MentorBatchStudentRow[]>([]);
//   const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [existingLive, setExistingLive] = useState<LiveClassRecord | null>(null);
//   const [starting, setStarting] = useState(false);
//   const [ending, setEnding] = useState(false);

//   const [attendanceOpen, setAttendanceOpen] = useState(false);
//   const [attendanceDate, setAttendanceDate] = useState(
//     new Date().toISOString().slice(0, 10)
//   );
//   const [attendanceStudents, setAttendanceStudents] = useState<BatchAttendanceStudent[]>([]);
//   const [attendanceLoading, setAttendanceLoading] = useState(false);
//   const [attendanceSaving, setAttendanceSaving] = useState(false);
//   const [attendanceError, setAttendanceError] = useState<string | null>(null);

//   const fetchAttendance = useCallback(async () => {
//     if (!id) return;
//     try {
//       setAttendanceLoading(true);
//       setAttendanceError(null);
//       const liveClassId = liveClass.session?.liveClassId ?? existingLive?._id;
//       const res = await batchAttendanceApi.getForDate(id, attendanceDate, liveClassId);
//       if (res.success) setAttendanceStudents(res.data.students);
//     } catch (err) {
//       console.error(err);
//       setAttendanceError(err instanceof Error ? err.message : "Couldn't load attendance.");
//       setAttendanceStudents([]);
//     } finally {
//       setAttendanceLoading(false);
//     }
//   }, [id, attendanceDate, liveClass.session, existingLive]);

//   useEffect(() => {
//     if (attendanceOpen) fetchAttendance();
//   }, [attendanceOpen, fetchAttendance]);

//   const toggleStatus = (studentId: string, status: "present" | "absent") => {
//     setAttendanceStudents((prev) =>
//       prev.map((s) =>
//         s.studentId === studentId
//           ? { ...s, status, mode: s.joinedOnline ? "online" : "offline" }
//           : s
//       )
//     );
//   };

//   const handleSaveAttendance = async () => {
//     if (!id) return;
//     const records = attendanceStudents
//       .filter((s) => s.status !== null)
//       .map((s) => ({
//         studentId: s.studentId,
//         status: s.status as "present" | "absent" | "leave",
//         mode: s.mode || "offline",
//       }));
//     if (records.length === 0) {
//       alert("Mark at least one student before saving.");
//       return;
//     }
//     try {
//       setAttendanceSaving(true);
//       const liveClassId = liveClass.session?.liveClassId ?? existingLive?._id;
//       const res = await batchAttendanceApi.save(id, records, attendanceDate, liveClassId);
//       alert(res.message);
//       setAttendanceOpen(false);
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "Could not save attendance.");
//     } finally {
//       setAttendanceSaving(false);
//     }
//   };

//   const fetchStudents = useCallback(async () => {
//     if (!id) return;
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await mentorDashboardApi.getBatchStudents(id);
//       if (res.success) {
//         setBatchInfo(res.data.batch as BatchInfo);
//         setStudents(res.data.students);
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Couldn't load this batch right now.");
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchStudents();
//   }, [fetchStudents]);

//   useEffect(() => {
//     if (!batchInfo) return;
//     liveClassApi
//       .getCurrent()
//       .then((res) => {
//         const current = res.data;
//         if (
//           current &&
//           current.status === "live" &&
//           current.batch.days === batchInfo.days &&
//           current.batch.time === batchInfo.time
//         ) {
//           setExistingLive(current);
//         } else {
//           setExistingLive(null);
//         }
//       })
//       .catch(() => setExistingLive(null));
//   }, [batchInfo]);

//   const enterMeeting = async (liveClassId: string) => {
//     try {
//       const res = await liveClassApi.joinClass(liveClassId);
//       liveClass.startSession({
//         joinInfo: res.data,
//         liveClassId,
//         role: "mentor",
//         userName: user?.fullName || "Mentor",
//         title: existingLive?.title ?? batchInfo?.course,
//       });
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "Could not join the meeting.");
//     }
//   };

//   const handleStart = async () => {
//     if (!batchInfo?.courseId || !batchInfo.days || !batchInfo.time) {
//       alert("Batch schedule is incomplete — cannot start a live class for an unscheduled batch.");
//       return;
//     }
//     try {
//       setStarting(true);
//       const res = await liveClassApi.startClass({
//         courseId: batchInfo.courseId,
//         days: batchInfo.days as LiveBatchDays,
//         time: batchInfo.time as LiveBatchTime,
//         title: `${batchInfo.course} — Live Class`,
//       });
//       setExistingLive(res.data);
//       await enterMeeting(res.data._id);
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "Could not start the class.");
//     } finally {
//       setStarting(false);
//     }
//   };

//   const handleRejoin = () => {
//     if (liveClass.session?.liveClassId === existingLive?._id) return;
//     if (existingLive) enterMeeting(existingLive._id);
//   };

//   const handleEnd = async () => {
//     const liveClassId = liveClass.session?.liveClassId ?? existingLive?._id;
//     if (!liveClassId) return;
//     if (!confirm("End this live class for all students?")) return;
//     try {
//       setEnding(true);
//       await liveClassApi.endClass(liveClassId);
//       await liveClass.endSession();
//       setExistingLive(null);
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "Could not end the class.");
//     } finally {
//       setEnding(false);
//     }
//   };

//   const presentCount = useMemo(
//     () => attendanceStudents.filter((s) => s.status === "present").length,
//     [attendanceStudents]
//   );
//   const absentCount = useMemo(
//     () => attendanceStudents.filter((s) => s.status === "absent").length,
//     [attendanceStudents]
//   );

//   return (
//     <MentorLayout
//       title={batchInfo?.course ?? "Batch"}
//       subtitle={
//         batchInfo
//           ? `${batchInfo.days ?? "Unscheduled"} · ${
//               batchInfo.time
//                 ? BATCH_TIME_LABELS[batchInfo.time] ?? batchInfo.time
//                 : "No time set"
//             }`
//           : "Loading batch details…"
//       }
//       actions={
//         // ─── Action Buttons ───────────────────────────────────────────────────
//         // flex-wrap: buttons wrap to next line on mobile instead of overflowing
//         <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

//           {/* END CLASS — only when live */}
//           {isThisBatchLive && (
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={handleEnd}
//               disabled={ending}
//               className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
//             >
//               <PhoneOff size={13} className="mr-1 shrink-0 sm:mr-1.5" />
//               {ending ? "Ending…" : "End Class"}
//             </Button>
//           )}

//           {/* REJOIN — backend says live but context not set */}
//           {!isThisBatchLive && existingLive && (
//             <Button
//               size="sm"
//               onClick={handleRejoin}
//               className="h-8 bg-red-600 px-2.5 text-xs text-white hover:bg-red-600/90 sm:h-9 sm:px-3 sm:text-sm"
//             >
//               <Radio size={13} className="mr-1 shrink-0 animate-pulse sm:mr-1.5" />
//               Rejoin Live
//             </Button>
//           )}

//           {/* START — no live class yet */}
//           {!isThisBatchLive && !existingLive && (
//             <Button
//               size="sm"
//               onClick={handleStart}
//               disabled={starting || !batchInfo?.courseId}
//               className="h-8 bg-[#0037FF] px-2.5 text-xs text-white hover:bg-[#0037FF]/90 sm:h-9 sm:px-3 sm:text-sm"
//             >
//               <Radio size={13} className="mr-1 shrink-0 sm:mr-1.5" />
//               {starting ? "Starting…" : "Start Live Class"}
//             </Button>
//           )}

//           {/* ATTENDANCE */}
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setAttendanceOpen(true)}
//             className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
//           >
//             <ClipboardCheck size={13} className="mr-1 shrink-0 sm:mr-1.5" />
//             {/* Full label on sm+, icon-only on xs */}
//             <span className="hidden xs:inline">Attendance</span>
//           </Button>

//           {/* BACK */}
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => navigate("/mentor/batches")}
//             className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
//           >
//             <ArrowLeft size={13} className="mr-1 shrink-0 sm:mr-1.5" />
//             <span className="hidden xs:inline">Back</span>
//           </Button>
//         </div>
//       }
//     >
//       {/* ── Live banner ─────────────────────────────────────────────────── */}
//       {isThisBatchLive && (
//         <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700 sm:items-center sm:text-sm">
//           <span className="mt-0.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500 sm:mt-0" />
//           <span>
//             Live class is active.{" "}
//             <span className="hidden sm:inline">
//               The session continues even if you navigate to other pages.
//             </span>
//           </span>
//         </div>
//       )}

//       {error && (
//         <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive sm:text-sm">
//           {error}
//         </div>
//       )}

//       {/* ── Student list ─────────────────────────────────────────────────── */}
//       <div className="rounded-xl border border-border bg-card">
//         {loading ? (
//           <div className="p-8 text-center text-sm text-muted-foreground">
//             Loading students…
//           </div>
//         ) : students.length === 0 ? (
//           <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
//             <Users size={28} className="text-muted-foreground/50" />
//             No students found in this batch.
//           </div>
//         ) : (
//           <>
//             {/* ── Desktop table (sm and up) ─────────────────────────── */}
//             <div className="hidden overflow-x-auto sm:block">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
//                     <th className="p-3 font-semibold">Student Name</th>
//                     <th className="p-3 font-semibold">Student ID</th>
//                     <th className="p-3 font-semibold">Progress</th>
//                     <th className="p-3 font-semibold">Assignment Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-border">
//                   {students.map((s) => (
//                     <tr key={s.email} className="hover:bg-muted/30">
//                       <td className="p-3">
//                         <div className="font-medium">{s.name}</div>
//                         <div className="text-xs text-muted-foreground">{s.email}</div>
//                       </td>
//                       <td className="p-3 font-mono text-xs text-muted-foreground">
//                         {s.studentId ?? "—"}
//                       </td>
//                       <td className="p-3">
//                         <div className="flex items-center gap-2">
//                           <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
//                             <div
//                               className="h-full rounded-full bg-[#0037FF]"
//                               style={{ width: `${Math.min(s.progress, 100)}%` }}
//                             />
//                           </div>
//                           <span className="text-xs font-semibold">{s.progress}%</span>
//                         </div>
//                       </td>
//                       <td className="p-3 text-muted-foreground">{s.assignmentStatus}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* ── Mobile cards (below sm) ───────────────────────────── */}
//             <div className="divide-y divide-border sm:hidden">
//               {students.map((s) => (
//                 <div key={s.email} className="p-3 space-y-2.5">
//                   {/* Row 1: name + student ID badge */}
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-semibold">{s.name}</p>
//                       <p className="truncate text-xs text-muted-foreground">{s.email}</p>
//                     </div>
//                     <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
//                       #{s.studentId ?? "—"}
//                     </span>
//                   </div>

//                   {/* Row 2: progress bar */}
//                   <div className="flex items-center gap-2">
//                     <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
//                       <div
//                         className="h-full rounded-full bg-[#0037FF]"
//                         style={{ width: `${Math.min(s.progress, 100)}%` }}
//                       />
//                     </div>
//                     <span className="shrink-0 text-xs font-semibold">{s.progress}%</span>
//                   </div>

//                   {/* Row 3: assignment status */}
//                   {s.assignmentStatus && (
//                     <p className="text-xs text-muted-foreground">
//                       Assignment: {s.assignmentStatus}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {/* ── Attendance modal ──────────────────────────────────────────────── */}
//       {attendanceOpen && (
//         // Bottom-sheet on mobile, centered modal on sm+
//         <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
//           <div className="flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-card shadow-2xl sm:max-w-lg sm:rounded-xl">

//             {/* Header */}
//             <div className="flex items-center justify-between border-b border-border px-4 py-3">
//               <div>
//                 <h3 className="text-sm font-semibold">Mark Attendance</h3>
//                 <p className="text-xs text-muted-foreground">{batchInfo?.course}</p>
//               </div>
//               <button
//                 onClick={() => setAttendanceOpen(false)}
//                 className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             {attendanceError && (
//               <div className="mx-4 mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
//                 {attendanceError}
//               </div>
//             )}

//             {/* Date picker + counters */}
//             <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
//               <input
//                 type="date"
//                 value={attendanceDate}
//                 onChange={(e) => setAttendanceDate(e.target.value)}
//                 className="rounded-lg border border-border px-2 py-1.5 text-xs"
//               />
//               <div className="flex items-center gap-3 text-xs font-semibold">
//                 <span className="text-emerald-600">{presentCount} Present</span>
//                 <span className="text-red-600">{absentCount} Absent</span>
//               </div>
//             </div>

//             {/* Student rows */}
//             <div className="flex-1 overflow-y-auto">
//               {attendanceLoading ? (
//                 <div className="p-8 text-center text-sm text-muted-foreground">
//                   Loading students…
//                 </div>
//               ) : attendanceStudents.length === 0 ? (
//                 <div className="p-8 text-center text-sm text-muted-foreground">
//                   No students in this batch.
//                 </div>
//               ) : (
//                 <div className="divide-y divide-border">
//                   {attendanceStudents.map((s) => (
//                     <div
//                       key={s.studentId}
//                       className="flex items-center justify-between px-4 py-3"
//                     >
//                       <div className="min-w-0 mr-3">
//                         <p className="truncate text-sm font-medium">{s.fullName}</p>
//                         <p className="truncate text-xs text-muted-foreground">
//                           {s.studentIdCode ?? s.email}
//                         </p>
//                       </div>
//                       {/* P / A toggle buttons — bigger tap targets on mobile */}
//                       <div className="flex shrink-0 items-center gap-2">
//                         <button
//                           onClick={() => toggleStatus(s.studentId, "present")}
//                           aria-pressed={s.status === "present"}
//                           className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors sm:h-8 sm:w-8 ${
//                             s.status === "present"
//                               ? "border-emerald-600 bg-emerald-600 text-white"
//                               : "border-border text-muted-foreground hover:bg-secondary"
//                           }`}
//                         >
//                           P
//                         </button>
//                         <button
//                           onClick={() => toggleStatus(s.studentId, "absent")}
//                           aria-pressed={s.status === "absent"}
//                           className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors sm:h-8 sm:w-8 ${
//                             s.status === "absent"
//                               ? "border-red-600 bg-red-600 text-white"
//                               : "border-border text-muted-foreground hover:bg-secondary"
//                           }`}
//                         >
//                           A
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setAttendanceOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 size="sm"
//                 className="text-white"
//                 onClick={handleSaveAttendance}
//                 disabled={attendanceSaving}
//               >
//                 <Save size={14} className="mr-1.5" />
//                 {attendanceSaving ? "Saving…" : "Save Attendance"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </MentorLayout>
//   );
// };

// export default MentorBatchStudents;



import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MentorLayout from "../../components/MentorLayout";
import { Button } from "@/components/ui/button";
import {
  mentorDashboardApi,
  liveClassApi,
  type MentorBatchStudentRow,
  type LiveClassRecord,
  type LiveBatchDays,
  type LiveBatchTime,
} from "@/integrations/client";
import { useLiveClass } from "@/contexts/LiveClassContext";
import { ArrowLeft, Users, Radio, PhoneOff, ClipboardCheck, X, Save, Video as VideoIcon, Maximize2 } from "lucide-react";
import { batchAttendanceApi, type BatchAttendanceStudent } from "@/integrations/client";
import { useAuth } from "@/contexts/AuthContext";
import { extractJoinClassData } from "@/features/live-class/api/liveClass.api";

const BATCH_TIME_LABELS: Record<string, string> = {
  "10:00-12:00": "10:00 AM - 12:00 PM",
  "12:00-2:00": "12:00 PM - 02:00 PM",
  "2:30-4:30": "02:30 PM - 04:30 PM",
  "4:30-6:30": "04:30 PM - 06:30 PM",
};

interface BatchInfo {
  course: string;
  courseId: string | null;
  days: string | null;
  time: string | null;
}

const MentorBatchStudents = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ YEH HI IMPORTANT HAI - isse Zoom Meeting SDK ka full UI trigger hota hai
  const liveClass = useLiveClass();
  const isThisBatchLive =
    liveClass.session?.liveClassId != null && liveClass.session.role === "mentor";

  const [students, setStudents] = useState<MentorBatchStudentRow[]>([]);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [existingLive, setExistingLive] = useState<LiveClassRecord | null>(null);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);

  // ── Attendance Logic (Zoom UI se bilkul alag hai) ──
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceStudents, setAttendanceStudents] = useState<BatchAttendanceStudent[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    if (!id) return;
    try {
      setAttendanceLoading(true);
      setAttendanceError(null);
      const liveClassId = liveClass.session?.liveClassId ?? existingLive?._id;
      const res = await batchAttendanceApi.getForDate(id, attendanceDate, liveClassId);
      if (res.success) setAttendanceStudents(res.data.students);
    } catch (err) {
      console.error(err);
      setAttendanceError(err instanceof Error ? err.message : "Couldn't load attendance.");
      setAttendanceStudents([]);
    } finally {
      setAttendanceLoading(false);
    }
  }, [id, attendanceDate, liveClass.session, existingLive]);

  useEffect(() => {
    if (attendanceOpen) fetchAttendance();
  }, [attendanceOpen, fetchAttendance]);

  const toggleStatus = (studentId: string, status: "present" | "absent") => {
    setAttendanceStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId ? { ...s, status, mode: s.joinedOnline ? "online" : "offline" } : s
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!id) return;
    const records = attendanceStudents
      .filter((s) => s.status !== null)
      .map((s) => ({
        studentId: s.studentId,
        status: s.status as "present" | "absent" | "leave",
        mode: s.mode || "offline",
      }));
    if (records.length === 0) {
      alert("Mark at least one student before saving.");
      return;
    }
    try {
      setAttendanceSaving(true);
      const liveClassId = liveClass.session?.liveClassId ?? existingLive?._id;
      const res = await batchAttendanceApi.save(id, records, attendanceDate, liveClassId);
      alert(res.message);
      setAttendanceOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not save attendance.");
    } finally {
      setAttendanceSaving(false);
    }
  };

  // ── Student Fetch ──
  const fetchStudents = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await mentorDashboardApi.getBatchStudents(id);
      if (res.success) {
        setBatchInfo(res.data.batch as BatchInfo);
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error(err);
      setError("Couldn't load this batch right now.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (!batchInfo) return;
    liveClassApi
      .getCurrent()
      .then((res) => {
        const current = res.data;
        if (
          current &&
          current.status === "live" &&
          current.batch.days === batchInfo.days &&
          current.batch.time === batchInfo.time
        ) {
          setExistingLive(current);
        } else {
          setExistingLive(null);
        }
      })
      .catch(() => setExistingLive(null));
  }, [batchInfo]);

  // ✅ ✅ CRITICAL: Zoom Start/Join Logic (Yehi sara kaam karta hai)
  const enterMeeting = async (liveClassId: string) => {
    try {
      const res = await liveClassApi.joinClass(liveClassId);
      const joinData = extractJoinClassData(res);
      // Is call se LiveClassContext mein session set hota hai aur Zoom SDK render hota hai
      liveClass.startSession({
        joinInfo: joinData,
        liveClassId,
        role: "mentor",
        userName: user?.fullName || "Mentor",
        title: existingLive?.title ?? batchInfo?.course,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not join the meeting.");
    }
  };

  const handleStart = async () => {
    if (!batchInfo?.courseId || !batchInfo.days || !batchInfo.time) {
      alert("Batch schedule is incomplete — cannot start a live class for an unscheduled batch.");
      return;
    }
    try {
      setStarting(true);
      const res = await liveClassApi.startClass({
        courseId: batchInfo.courseId,
        days: batchInfo.days as LiveBatchDays,
        time: batchInfo.time as LiveBatchTime,
        title: `${batchInfo.course} — Live Class`,
      });
      setExistingLive(res.data);
      await enterMeeting(res.data._id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not start the class.");
    } finally {
      setStarting(false);
    }
  };

  const handleRejoin = () => {
    if (liveClass.session?.liveClassId === existingLive?._id) return;
    if (existingLive) enterMeeting(existingLive._id);
  };

  // ✅ ✅ CRITICAL: End Logic (Agar Backend fail ho, toh bhi session clear ho)
  const handleEnd = async () => {
    const liveClassId = liveClass.session?.liveClassId ?? existingLive?._id;
    if (!liveClassId) return;
    if (!confirm("End this live class for all students?")) return;
    try {
      setEnding(true);
      // Backend se class end karo (Zoom API call)
      await liveClassApi.endClass(liveClassId);
    } catch (err) {
      // Agar API fail ho, toh bhi session clear karna zaroori hai
      console.error("End class API failed, clearing session anyway:", err);
    } finally {
      // ✅ FIX: Hamesha session clear hoga
      await liveClass.endSession();
      setExistingLive(null);
      setEnding(false);
    }
  };

  const presentCount = useMemo(
    () => attendanceStudents.filter((s) => s.status === "present").length,
    [attendanceStudents]
  );
  const absentCount = useMemo(
    () => attendanceStudents.filter((s) => s.status === "absent").length,
    [attendanceStudents]
  );

  return (
    <MentorLayout
      title={batchInfo?.course ?? "Batch"}
      subtitle={
        batchInfo
          ? `${batchInfo.days ?? "Unscheduled"} · ${
              batchInfo.time
                ? BATCH_TIME_LABELS[batchInfo.time] ?? batchInfo.time
                : "No time set"
            }`
          : "Loading batch details…"
      }
      actions={
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {isThisBatchLive && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEnd}
              disabled={ending}
              className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
            >
              <PhoneOff size={13} className="mr-1 shrink-0 sm:mr-1.5" />
              {ending ? "Ending…" : "End Class"}
            </Button>
          )}

          {!isThisBatchLive && existingLive && (
            <Button
              size="sm"
              onClick={handleRejoin}
              className="h-8 bg-red-600 px-2.5 text-xs text-white hover:bg-red-600/90 sm:h-9 sm:px-3 sm:text-sm"
            >
              <Radio size={13} className="mr-1 shrink-0 animate-pulse sm:mr-1.5" />
              Rejoin Live
            </Button>
          )}

          {!isThisBatchLive && !existingLive && (
            <Button
              size="sm"
              onClick={handleStart}
              disabled={starting || !batchInfo?.courseId}
              className="h-8 bg-[#0037FF] px-2.5 text-xs text-white hover:bg-[#0037FF]/90 sm:h-9 sm:px-3 sm:text-sm"
            >
              <Radio size={13} className="mr-1 shrink-0 sm:mr-1.5" />
              {starting ? "Starting…" : "Start Live Class"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAttendanceOpen(true)}
            className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            <ClipboardCheck size={13} className="mr-1 shrink-0 sm:mr-1.5" />
            <span className="hidden xs:inline">Attendance</span>
          </Button>

          <Button
  variant="outline"
  size="sm"
  onClick={() => navigate(`/mentor/batches/${id}/videos`)}
  className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
>
  <VideoIcon size={13} className="mr-1 shrink-0 sm:mr-1.5" />
  <span className="">Videos</span>
</Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/mentor/batches")}
            className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
          >
            <ArrowLeft size={13} className="mr-1 shrink-0 sm:mr-1.5" />
            <span className="hidden xs:inline">Back</span>
          </Button>
        </div>
      }
    >
      {/* ── Live banner ── */}
      {isThisBatchLive && (
        <div className="mb-4 flex items-start justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700 sm:items-center sm:text-sm">
          <span className="mt-0.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500 sm:mt-0" />
          <span>
            Live class is active.{" "}
            <span className="hidden sm:inline">
              The session continues even if you navigate to other pages.
            </span>
          </span>
          {liveClass.minimized && (
            <Button variant="outline" size="sm" onClick={liveClass.restoreClassroom}>
              <Maximize2 size={14} className="mr-1.5" />
              Return to Classroom
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive sm:text-sm">
          {error}
        </div>
      )}

      {/* ── Student list (Same as before) ── */}
      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading students…</div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
            <Users size={28} className="text-muted-foreground/50" />
            No students found in this batch.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
                    <th className="p-3 font-semibold">Student Name</th>
                    <th className="p-3 font-semibold">Student ID</th>
                    <th className="p-3 font-semibold">Progress</th>
                    <th className="p-3 font-semibold">Assignment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s) => (
                    <tr key={s.email} className="hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{s.studentId ?? "—"}</td>
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
                      <td className="p-3 text-muted-foreground">{s.assignmentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border sm:hidden">
              {students.map((s) => (
                <div key={s.email} className="p-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      #{s.studentId ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[#0037FF]"
                        style={{ width: `${Math.min(s.progress, 100)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-semibold">{s.progress}%</span>
                  </div>
                  {s.assignmentStatus && (
                    <p className="text-xs text-muted-foreground">Assignment: {s.assignmentStatus}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Attendance Modal (Same as before) ── */}
      {attendanceOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-card shadow-2xl sm:max-w-lg sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold">Mark Attendance</h3>
                <p className="text-xs text-muted-foreground">{batchInfo?.course}</p>
              </div>
              <button onClick={() => setAttendanceOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary">
                <X size={16} />
              </button>
            </div>

            {attendanceError && (
              <div className="mx-4 mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                {attendanceError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs"
              />
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-emerald-600">{presentCount} Present</span>
                <span className="text-red-600">{absentCount} Absent</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {attendanceLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading students…</div>
              ) : attendanceStudents.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No students in this batch.</div>
              ) : (
                <div className="divide-y divide-border">
                  {attendanceStudents.map((s) => (
                    <div key={s.studentId} className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0 mr-3">
                        <p className="truncate text-sm font-medium">{s.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.studentIdCode ?? s.email}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => toggleStatus(s.studentId, "present")}
                          aria-pressed={s.status === "present"}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors sm:h-8 sm:w-8 ${
                            s.status === "present"
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => toggleStatus(s.studentId, "absent")}
                          aria-pressed={s.status === "absent"}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors sm:h-8 sm:w-8 ${
                            s.status === "absent"
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          A
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
              <Button variant="outline" size="sm" onClick={() => setAttendanceOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="text-white" onClick={handleSaveAttendance} disabled={attendanceSaving}>
                <Save size={14} className="mr-1.5" />
                {attendanceSaving ? "Saving…" : "Save Attendance"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MentorLayout>
  );
};

export default MentorBatchStudents;