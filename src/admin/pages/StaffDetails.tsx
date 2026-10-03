// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import AdminLayout from "../components/AdminLayout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Progress } from "@/components/ui/progress";
// import {
//   ArrowLeft,
//   CalendarDays,
//   Check,
//   CircleDot,
//   FileText,
//   KeyRound,
//   Loader2,
//   Lock,
//   Save,
//   ShieldCheck,
//   Trash2,
//   UserRound,
//   X,
// } from "lucide-react";
// import {
//   staffApi,
//   AttendanceRecord,
//   LeaveRecord,
//   StaffDocument,
//   StaffProfile,
//   PayrollRecord,
//   PermissionCatalog,
// } from "@/services/staff.service";
// import { usePermissions } from "@/hooks/usePermissions";

// const money = (n: number) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(n || 0);
// const label = (x: string) =>
//   String(x ?? "")
//     .replace(/_/g, " ")
//     .replace(/\./g, " • ");
// const initials = (x: string) =>
//   x
//     .split(" ")
//     .map((y) => y[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

// export default function StaffDetails() {
//   const { id = "" } = useParams();
//   const nav = useNavigate();
//   const { can, role } = usePermissions();
//   const canManagePermissions =
//     role === "super_admin" && can("employees.permissions");

//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [tab, setTab] = useState("overview");
//   const [profile, setProfile] = useState<StaffProfile>({});
//   const [attendance, setAttendance] = useState<any>(null);
//   const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
//   const [docs, setDocs] = useState<StaffDocument[]>([]);
//   const [activity, setActivity] = useState<any[]>([]);
//   const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
//   const [catalog, setCatalog] = useState<PermissionCatalog | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [month, setMonth] = useState(new Date().getMonth() + 1);
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [leaveNote, setLeaveNote] = useState("");
//   const [doc, setDoc] = useState({
//     documentType: "other",
//     title: "",
//     fileUrl: "",
//     fileName: "",
//     mimeType: "",
//     note: "",
//   });
//   const [pay, setPay] = useState({
//     basicSalary: "",
//     allowances: "0",
//     deductions: "0",
//     payrollMonth: new Date().toISOString().slice(0, 7),
//     paymentStatus: "pending",
//     paymentDate: "",
//     notes: "",
//   });
//   const [newPassword, setNewPassword] = useState("");

//   const load = async () => {
//     if (!id) return;
//     setLoading(true);
//     setError("");
//     try {
//       const r = await staffApi.details(id);
//       setData(r.data);
//       setProfile(r.data.profile || {});
//       setLeaves(r.data.leaves || []);
//       setDocs(r.data.documents || []);
//       setActivity(r.data.activity || []);
//       if (canManagePermissions)
//         staffApi
//           .permissionCatalog()
//           .then((x) => setCatalog(x.data))
//           .catch(() => {});
//     } catch (e: any) {
//       setError(e?.message || "Unable to load staff details");
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     load();
//   }, [id, canManagePermissions]);

//   useEffect(() => {
//     if (!id) return;
//     staffApi
//       .attendance(id, month, year)
//       .then((r) => setAttendance(r.data))
//       .catch(() => setAttendance(null));
//   }, [id, month, year]);

//   useEffect(() => {
//     if (!id || tab !== "payroll" || !can("payroll.view")) return;
//     staffApi
//       .payroll({ staffId: id, limit: 100 })
//       .then((r) => setPayroll(r.data.records || []))
//       .catch(() => setPayroll([]));
//   }, [id, tab]);

//   useEffect(() => {
//     if (!id || tab !== "activity") return;
//     staffApi
//       .activity(id, { limit: 100 })
//       .then((r) => setActivity(r.data.activity || []))
//       .catch(() => {});
//   }, [id, tab]);

//   const staff = data?.staff;
//   const summary = attendance?.summary || {};
//   const profileCompletion = useMemo(() => {
//     const keys = [
//       "employeeId",
//       "designation",
//       "department",
//       "dateOfJoining",
//       "dateOfBirth",
//       "gender",
//       "alternatePhone",
//       "notes",
//     ];
//     return Math.round(
//       (keys.filter((k) => Boolean((profile as any)?.[k])).length /
//         keys.length) *
//         100,
//     );
//   }, [profile]);

//   const saveProfile = async () => {
//     setSaving(true);
//     setError("");
//     try {
//       await staffApi.updateProfile(id, profile);
//       await load();
//     } catch (e: any) {
//       setError(e?.message || "Unable to save profile");
//     } finally {
//       setSaving(false);
//     }
//   };
//   const review = async (l: LeaveRecord, status: "approved" | "rejected") => {
//     try {
//       await staffApi.reviewLeave(l._id, status, leaveNote);
//       setLeaveNote("");
//       await load();
//     } catch (e: any) {
//       setError(e?.message || "Unable to review leave");
//     }
//   };
//   const addDoc = async () => {
//     try {
//       await staffApi.addDocument(id, doc);
//       setDoc({
//         ...doc,
//         title: "",
//         fileUrl: "",
//         fileName: "",
//         mimeType: "",
//         note: "",
//       });
//       await load();
//     } catch (e: any) {
//       setError(e?.message || "Unable to add document");
//     }
//   };
//   const removeDoc = async (docId: string) => {
//     try {
//       await staffApi.deleteDocument(docId);
//       await load();
//     } catch (e: any) {
//       setError(e?.message || "Unable to delete document");
//     }
//   };
//   const savePayroll = async () => {
//     try {
//       await staffApi.createPayroll({
//         staff: id,
//         basicSalary: Number(pay.basicSalary),
//         allowances: Number(pay.allowances),
//         deductions: Number(pay.deductions),
//         payrollMonth: pay.payrollMonth,
//         paymentStatus: pay.paymentStatus,
//         paymentDate: pay.paymentDate || null,
//         notes: pay.notes,
//       });
//       setPay({ ...pay, basicSalary: "" });
//       setTab("payroll");
//     } catch (e: any) {
//       setError(e?.message || "Unable to create payroll");
//     }
//   };
//   const resetPassword = async () => {
//     if (newPassword.length < 8) return;
//     try {
//       await staffApi.resetPassword(id, newPassword);
//       setNewPassword("");
//     } catch (e: any) {
//       setError(e?.message || "Unable to reset password");
//     }
//   };

//   if (loading)
//     return (
//       <AdminLayout title="Employee details">
//         <Card>
//           <CardContent className="py-20 text-center text-sm text-muted-foreground">
//             Loading employee…
//           </CardContent>
//         </Card>
//       </AdminLayout>
//     );
//   if (!staff)
//     return (
//       <AdminLayout title="Employee details">
//         <Card>
//           <CardContent className="py-20 text-center text-destructive">
//             {error || "Employee not found"}
//           </CardContent>
//         </Card>
//       </AdminLayout>
//     );

//   const tabs = [
//     ["overview", "Overview"],
//     ["profile", "Profile"],
//     ["attendance", "Attendance"],
//     ["leave", "Leave"],
//     ["documents", "Documents"],
//     ...(canManagePermissions ? [["permissions", "Permissions"]] : []),
//     ["activity", "Activity"],
//     ...(can("payroll.view") ? [["payroll", "Payroll"]] : []),
//   ];

//   return (
//     <AdminLayout
//       title={staff.fullName}
//       subtitle={`${label(staff.role)} · ${staff.email}`}
//       actions={
//         <Button variant="outline" onClick={() => nav("/admin/staff")}>
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back to Employees
//         </Button>
//       }
//     >
//       <div className="space-y-5">
//         {error && (
//           <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
//             <span>{error}</span>
//             <button onClick={() => setError("")}>
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         )}

//         <Card className="overflow-hidden">
//           <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
//           <CardContent className="-mt-9 p-6">
//             <div className="flex flex-col gap-5 md:flex-row md:items-end">
//               <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
//                 <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
//                   {initials(staff.fullName)}
//                 </AvatarFallback>
//               </Avatar>
//               <div className="min-w-0 flex-1">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <h2 className="text-2xl font-semibold tracking-tight">
//                     {staff.fullName}
//                   </h2>
//                   <Badge variant={staff.isActive ? "default" : "outline"}>
//                     {staff.isActive ? "Active" : "Inactive"}
//                   </Badge>
//                 </div>
//                 <p className="mt-1 text-sm text-muted-foreground">
//                   {staff.email}
//                   {staff.phone ? ` · ${staff.phone}` : ""}
//                 </p>
//                 <div className="mt-2 flex flex-wrap gap-2">
//                   <Badge variant="secondary" className="capitalize">
//                     {label(staff.role)}
//                   </Badge>
//                   {staff.branch?.name && (
//                     <Badge variant="outline">{staff.branch.name}</Badge>
//                   )}
//                 </div>
//               </div>
//               {can("employees.edit") && (
//                 <div className="w-full max-w-xs rounded-xl border bg-muted/20 p-3 md:w-56">
//                   <div className="flex justify-between text-xs">
//                     <span>Profile completion</span>
//                     <span className="font-medium">{profileCompletion}%</span>
//                   </div>
//                   <Progress value={profileCompletion} className="mt-2 h-1.5" />
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         <Tabs value={tab} onValueChange={setTab}>
//           <div className="overflow-x-auto rounded-xl border bg-card p-1">
//             <TabsList className="h-auto w-max min-w-full justify-start bg-transparent">
//               {tabs.map(([value, text]) => (
//                 <TabsTrigger
//                   key={value}
//                   value={value}
//                   className="rounded-lg px-4 py-2"
//                 >
//                   {text}
//                 </TabsTrigger>
//               ))}
//             </TabsList>
//           </div>

//           <TabsContent value="overview" className="mt-5 space-y-5">
//             <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//               <Info title="Role" value={label(staff.role)} icon={ShieldCheck} />
//               <Info
//                 title="Status"
//                 value={staff.isActive ? "Active" : "Inactive"}
//                 icon={CircleDot}
//               />
//               <Info
//                 title="Joined"
//                 value={
//                   staff.createdAt
//                     ? new Date(staff.createdAt).toLocaleDateString("en-IN")
//                     : "—"
//                 }
//                 icon={CalendarDays}
//               />
//               <Info
//                 title="Last login"
//                 value={
//                   staff.lastLoginAt
//                     ? new Date(staff.lastLoginAt).toLocaleString("en-IN")
//                     : "Never"
//                 }
//                 icon={UserRound}
//               />
//             </div>
//             <div className="grid gap-5 lg:grid-cols-2">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-base">
//                     Employment snapshot
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid gap-4 sm:grid-cols-2">
//                   <KV label="Employee ID" value={profile.employeeId} />
//                   <KV label="Designation" value={profile.designation} />
//                   <KV label="Department" value={profile.department} />
//                   <KV
//                     label="Date of joining"
//                     value={
//                       profile.dateOfJoining
//                         ? new Date(profile.dateOfJoining).toLocaleDateString(
//                             "en-IN",
//                           )
//                         : undefined
//                     }
//                   />
//                 </CardContent>
//               </Card>
//               {can("employees.edit") && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-base">Security</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex gap-3">
//                       <Input
//                         type="password"
//                         placeholder="New password (8+ chars)"
//                         value={newPassword}
//                         onChange={(e) => setNewPassword(e.target.value)}
//                       />
//                       <Button
//                         variant="outline"
//                         onClick={resetPassword}
//                         disabled={newPassword.length < 8}
//                       >
//                         <KeyRound className="mr-2 h-4 w-4" />
//                         Reset
//                       </Button>
//                     </div>
//                     <p className="mt-2 text-xs text-muted-foreground">
//                       Use this only when the employee needs a password reset.
//                     </p>
//                   </CardContent>
//                 </Card>
//               )}
//             </div>
//           </TabsContent>

//           <TabsContent value="profile" className="mt-5">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Employee profile</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                   <Field
//                     label="Employee ID"
//                     value={profile.employeeId}
//                     set={(v) => setProfile({ ...profile, employeeId: v })}
//                   />
//                   <Field
//                     label="Designation"
//                     value={profile.designation}
//                     set={(v) => setProfile({ ...profile, designation: v })}
//                   />
//                   <Field
//                     label="Department"
//                     value={profile.department}
//                     set={(v) => setProfile({ ...profile, department: v })}
//                   />
//                   <Field
//                     label="Alternate phone"
//                     value={profile.alternatePhone}
//                     set={(v) => setProfile({ ...profile, alternatePhone: v })}
//                   />
//                   <Field
//                     label="Gender"
//                     value={profile.gender}
//                     set={(v) => setProfile({ ...profile, gender: v })}
//                   />
//                   <Field
//                     label="Date of joining"
//                     type="date"
//                     value={(profile.dateOfJoining || "").slice(0, 10)}
//                     set={(v) => setProfile({ ...profile, dateOfJoining: v })}
//                   />
//                   <Field
//                     label="Date of birth"
//                     type="date"
//                     value={(profile.dateOfBirth || "").slice(0, 10)}
//                     set={(v) => setProfile({ ...profile, dateOfBirth: v })}
//                   />
//                 </div>
//                 <Field
//                   label="Notes"
//                   textarea
//                   value={profile.notes}
//                   set={(v) => setProfile({ ...profile, notes: v })}
//                 />
//                 {can("employees.edit") && (
//                   <Button onClick={saveProfile} disabled={saving}>
//                     <Save className="mr-2 h-4 w-4" />
//                     {saving ? "Saving…" : "Save profile"}
//                   </Button>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="attendance" className="mt-5">
//             <Card>
//               <CardHeader>
//                 <div className="flex flex-wrap items-center justify-between gap-3">
//                   <CardTitle>Attendance</CardTitle>
//                   <div className="flex gap-2">
//                     <select
//                       className="h-9 rounded-md border bg-background px-3 text-sm"
//                       value={month}
//                       onChange={(e) => setMonth(Number(e.target.value))}
//                     >
//                       {Array.from({ length: 12 }, (_, i) => (
//                         <option key={i + 1} value={i + 1}>
//                           {new Date(2000, i, 1).toLocaleString("en-IN", {
//                             month: "short",
//                           })}
//                         </option>
//                       ))}
//                     </select>
//                     <Input
//                       className="w-24"
//                       value={year}
//                       onChange={(e) => setYear(Number(e.target.value))}
//                     />
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
//                   {Object.entries(summary).map(([k, v]) => (
//                     <Info
//                       key={k}
//                       title={String(k).replace(/_/g, " ")}
//                       value={String(v)}
//                       compact
//                     />
//                   ))}
//                 </div>
//                 <div className="mt-5 overflow-auto rounded-xl border">
//                   <table className="w-full text-sm">
//                     <thead className="bg-muted/40">
//                       <tr className="text-left">
//                         <th className="p-3">Date</th>
//                         <th>Status</th>
//                         <th>Check in</th>
//                         <th>Check out</th>
//                         <th>Minutes</th>
//                         <th>Note</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {(attendance?.records || []).map(
//                         (r: AttendanceRecord) => (
//                           <tr className="border-t" key={r._id}>
//                             <td className="p-3">
//                               {new Date(r.date).toLocaleDateString("en-IN")}
//                             </td>
//                             <td className="capitalize">{r.status}</td>
//                             <td>
//                               {r.checkIn
//                                 ? new Date(r.checkIn).toLocaleTimeString(
//                                     "en-IN",
//                                   )
//                                 : "—"}
//                             </td>
//                             <td>
//                               {r.checkOut
//                                 ? new Date(r.checkOut).toLocaleTimeString(
//                                     "en-IN",
//                                   )
//                                 : "—"}
//                             </td>
//                             <td>{r.workingMinutes || 0}</td>
//                             <td>{r.note || "—"}</td>
//                           </tr>
//                         ),
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="leave" className="mt-5">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Leave requests</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <Textarea
//                   placeholder="Review note (optional)"
//                   value={leaveNote}
//                   onChange={(e) => setLeaveNote(e.target.value)}
//                 />
//                 <div className="overflow-auto rounded-xl border">
//                   <table className="w-full text-sm">
//                     <thead className="bg-muted/40">
//                       <tr className="text-left">
//                         <th className="p-3">Dates</th>
//                         <th>Type</th>
//                         <th>Days</th>
//                         <th>Status</th>
//                         <th>Reason</th>
//                         <th>Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {leaves.map((l) => (
//                         <tr className="border-t" key={l._id}>
//                           <td className="p-3 whitespace-nowrap">
//                             {new Date(l.fromDate).toLocaleDateString("en-IN")} –{" "}
//                             {new Date(l.toDate).toLocaleDateString("en-IN")}
//                           </td>
//                           <td className="capitalize">{l.leaveType}</td>
//                           <td>{l.days}</td>
//                           <td>
//                             <Badge
//                               variant={
//                                 l.status === "approved"
//                                   ? "default"
//                                   : l.status === "rejected"
//                                     ? "destructive"
//                                     : "secondary"
//                               }
//                               className="capitalize"
//                             >
//                               {l.status}
//                             </Badge>
//                           </td>
//                           <td className="max-w-xs">{l.reason}</td>
//                           <td>
//                             {l.status === "pending" && can("leave.approve") && (
//                               <div className="flex gap-1">
//                                 <Button
//                                   size="sm"
//                                   onClick={() => review(l, "approved")}
//                                 >
//                                   <Check className="mr-1 h-3.5 w-3.5" />
//                                   Approve
//                                 </Button>
//                                 {can("leave.reject") && (
//                                   <Button
//                                     size="sm"
//                                     variant="outline"
//                                     onClick={() => review(l, "rejected")}
//                                   >
//                                     <X className="mr-1 h-3.5 w-3.5" />
//                                     Reject
//                                   </Button>
//                                 )}
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="documents" className="mt-5">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Employee documents</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-5">
//                 {can("documents.upload") && (
//                   <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-3">
//                     <select
//                       className="h-10 rounded-md border bg-background px-3 text-sm"
//                       value={doc.documentType}
//                       onChange={(e) =>
//                         setDoc({ ...doc, documentType: e.target.value })
//                       }
//                     >
//                       {[
//                         "aadhaar",
//                         "pan",
//                         "resume",
//                         "offer_letter",
//                         "joining_letter",
//                         "experience_letter",
//                         "salary_slip",
//                         "bank_proof",
//                         "other",
//                       ].map((x) => (
//                         <option key={x}>{x}</option>
//                       ))}
//                     </select>
//                     <Input
//                       placeholder="Document title"
//                       value={doc.title}
//                       onChange={(e) =>
//                         setDoc({ ...doc, title: e.target.value })
//                       }
//                     />
//                     <Input
//                       placeholder="File URL"
//                       value={doc.fileUrl}
//                       onChange={(e) =>
//                         setDoc({ ...doc, fileUrl: e.target.value })
//                       }
//                     />
//                     <Button
//                       className="md:col-span-3"
//                       onClick={addDoc}
//                       disabled={!doc.title || !doc.fileUrl}
//                     >
//                       Add document
//                     </Button>
//                   </div>
//                 )}
//                 <div className="grid gap-2">
//                   {docs.map((d) => (
//                     <div
//                       key={d._id}
//                       className="flex items-center justify-between gap-3 rounded-xl border p-4"
//                     >
//                       <a
//                         href={d.fileUrl}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="flex min-w-0 items-center gap-3"
//                       >
//                         <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
//                           <FileText className="h-4 w-4" />
//                         </div>
//                         <span className="min-w-0">
//                           <span className="block truncate font-medium">
//                             {d.title}
//                           </span>
//                           <span className="text-xs capitalize text-muted-foreground">
//                             {d.documentType} ·{" "}
//                             {new Date(d.createdAt).toLocaleDateString("en-IN")}
//                           </span>
//                         </span>
//                       </a>
//                       {can("documents.delete") && (
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="text-destructive"
//                           onClick={() => removeDoc(d._id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {canManagePermissions && (
//             <TabsContent value="permissions" className="mt-5">
//               <PermissionPanel
//                 id={id}
//                 initial={data.permissions}
//                 catalog={catalog}
//               />
//             </TabsContent>
//           )}

//           <TabsContent value="activity" className="mt-5">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Activity history</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {activity.length ? (
//                   <div className="space-y-3">
//                     {activity.map((a, i) => (
//                       <div key={a._id || i} className="relative border-l pl-5">
//                         <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />
//                         <p className="font-medium">{a.action || "Activity"}</p>
//                         <p className="text-xs text-muted-foreground">
//                           {a.createdAt
//                             ? new Date(a.createdAt).toLocaleString("en-IN")
//                             : ""}
//                         </p>
//                         <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-3 text-xs">
//                           {a.metadata
//                             ? JSON.stringify(a.metadata, null, 2)
//                             : a.description || ""}
//                         </pre>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="py-10 text-center text-sm text-muted-foreground">
//                     No activity found.
//                   </p>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {can("payroll.view") && (
//             <TabsContent value="payroll" className="mt-5 space-y-5">
//               {can("payroll.manage") && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Create payroll record</CardTitle>
//                   </CardHeader>
//                   <CardContent className="grid gap-3 md:grid-cols-4">
//                     <Input
//                       type="number"
//                       placeholder="Basic salary"
//                       value={pay.basicSalary}
//                       onChange={(e) =>
//                         setPay({ ...pay, basicSalary: e.target.value })
//                       }
//                     />
//                     <Input
//                       type="number"
//                       placeholder="Allowances"
//                       value={pay.allowances}
//                       onChange={(e) =>
//                         setPay({ ...pay, allowances: e.target.value })
//                       }
//                     />
//                     <Input
//                       type="number"
//                       placeholder="Deductions"
//                       value={pay.deductions}
//                       onChange={(e) =>
//                         setPay({ ...pay, deductions: e.target.value })
//                       }
//                     />
//                     <Input
//                       type="month"
//                       value={pay.payrollMonth}
//                       onChange={(e) =>
//                         setPay({ ...pay, payrollMonth: e.target.value })
//                       }
//                     />
//                     <Button
//                       className="md:col-span-4"
//                       onClick={savePayroll}
//                       disabled={!pay.basicSalary}
//                     >
//                       Create payroll
//                     </Button>
//                   </CardContent>
//                 </Card>
//               )}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Payroll history</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="overflow-auto rounded-xl border">
//                     <table className="w-full text-sm">
//                       <thead className="bg-muted/40">
//                         <tr className="text-left">
//                           <th className="p-3">Month</th>
//                           <th>Basic</th>
//                           <th>Net</th>
//                           <th>Status</th>
//                           <th>Payment date</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {payroll.map((p) => (
//                           <tr className="border-t" key={p._id}>
//                             <td className="p-3">{p.payrollMonth}</td>
//                             <td>{money(p.basicSalary)}</td>
//                             <td>{money(p.netSalary)}</td>
//                             <td>
//                               <Badge
//                                 variant={
//                                   p.paymentStatus === "paid"
//                                     ? "default"
//                                     : p.paymentStatus === "failed"
//                                       ? "destructive"
//                                       : "secondary"
//                                 }
//                               >
//                                 {p.paymentStatus}
//                               </Badge>
//                             </td>
//                             <td>
//                               {p.paymentDate
//                                 ? new Date(p.paymentDate).toLocaleDateString(
//                                     "en-IN",
//                                   )
//                                 : "—"}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           )}
//         </Tabs>
//       </div>
//     </AdminLayout>
//   );
// }

// function Info({
//   title,
//   value,
//   icon: Icon,
//   compact = false,
// }: {
//   title: string;
//   value: string;
//   icon?: any;
//   compact?: boolean;
// }) {
//   return (
//     <div className={`rounded-xl border ${compact ? "p-3" : "p-4"}`}>
//       {Icon && <Icon className="mb-2 h-4 w-4 text-muted-foreground" />}
//       <p className="text-xs capitalize text-muted-foreground">{title}</p>
//       <p className="mt-1 font-semibold capitalize">{value}</p>
//     </div>
//   );
// }
// function KV({ label, value }: { label: string; value?: string | null }) {
//   return (
//     <div>
//       <p className="text-xs text-muted-foreground">{label}</p>
//       <p className="mt-1 text-sm font-medium">{value || "—"}</p>
//     </div>
//   );
// }
// function Field({
//   label,
//   value,
//   set,
//   type = "text",
//   textarea = false,
// }: {
//   label: string;
//   value?: string | null;
//   set: (v: string) => void;
//   type?: string;
//   textarea?: boolean;
// }) {
//   return (
//     <label className="text-sm">
//       <span className="mb-1.5 block text-muted-foreground">{label}</span>
//       {textarea ? (
//         <Textarea value={value || ""} onChange={(e) => set(e.target.value)} />
//       ) : (
//         <Input
//           type={type}
//           value={value || ""}
//           onChange={(e) => set(e.target.value)}
//         />
//       )}
//     </label>
//   );
// }

// function PermissionPanel({
//   id,
//   initial,
//   catalog,
// }: {
//   id: string;
//   initial: any;
//   catalog: PermissionCatalog | null;
// }) {
//   const [overrides, setOverrides] = useState<Record<string, boolean>>({});
//   const [effective, setEffective] = useState(new Set<string>());
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);

//   // Permissions may come back from the API as plain strings ("employees.edit")
//   // or as objects ("{ permission: 'employees.edit', label: 'Edit employees' }").
//   // Normalize both shapes to a stable string id / display label so keys,
//   // overrides, and effective-permission lookups never break, regardless of
//   // which shape the backend sends.
//   const permId = (p: any): string =>
//     typeof p === "string" ? p : p?.permission ?? String(p);
//   const permLabel = (p: any): string =>
//     typeof p === "string" ? label(p) : p?.label ?? label(p?.permission ?? "");

//   useEffect(() => {
//     if (!initial) return;
//     setEffective(new Set((initial.effectivePermissions || []).map(permId)));
//     setOverrides(
//       Object.fromEntries(
//         (initial.overrides || []).map((x: any) => [
//           permId(x.permission ?? x),
//           x.allowed,
//         ]),
//       ),
//     );
//   }, [initial]);

//   const groups = catalog?.groups || [];
//   const all = catalog?.allPermissions || initial?.allPermissions || [];
//   const fallbackGroups = groups.length
//     ? groups
//     : [
//         {
//           key: "all",
//           label: "Permissions",
//           description: "Available permissions",
//           permissions: all,
//         },
//       ];

//   const state = (pid: string): "allowed" | "denied" | "inherited" => {
//     if (Object.prototype.hasOwnProperty.call(overrides, pid))
//       return overrides[pid] ? "allowed" : "denied";
//     return "inherited";
//   };
//   const cycle = (pid: string) => {
//     const current = state(pid);
//     if (current === "inherited")
//       setOverrides({ ...overrides, [pid]: true });
//     else if (current === "allowed")
//       setOverrides({ ...overrides, [pid]: false });
//     else {
//       const next = { ...overrides };
//       delete next[pid];
//       setOverrides(next);
//     }
//     setSaved(false);
//   };
//   const isEffective = (pid: string) => {
//     const s = state(pid);
//     return (
//       s === "allowed" ||
//       (s === "inherited" &&
//         (initial?.roleDefaults || []).map(permId).includes(pid))
//     );
//   };
//   const save = async () => {
//     setSaving(true);
//     setSaved(false);
//     try {
//       const payload = Object.entries(overrides).map(
//         ([permission, allowed]) => ({ permission, allowed }),
//       );
//       const r = await staffApi.updatePermissions(id, payload);
//       setEffective(new Set((r.data.effectivePermissions || []).map(permId)));
//       setSaved(true);
//     } catch (e: any) {
//       alert(e?.message || "Unable to save permissions");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <CardTitle>Access & permissions</CardTitle>
//             <p className="mt-1 text-sm text-muted-foreground">
//               Click a permission to cycle between inherited, allowed and denied.
//             </p>
//           </div>
//           <Button onClick={save} disabled={saving}>
//             {saving ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : (
//               <Save className="mr-2 h-4 w-4" />
//             )}
//             {saving ? "Saving…" : "Save permissions"}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {fallbackGroups.map((group) => (
//           <div key={group.key} className="overflow-hidden rounded-2xl border">
//             <div className="border-b bg-muted/30 px-4 py-3">
//               <p className="font-medium">{group.label}</p>
//               {group.description && (
//                 <p className="text-xs text-muted-foreground">
//                   {group.description}
//                 </p>
//               )}
//             </div>
//             <div className="divide-y">
//               {group.permissions.map((p: any) => {
//                 const pid = permId(p);
//                 const s = state(pid);
//                 const active = isEffective(pid);
//                 return (
//                   <button
//                     type="button"
//                     key={pid}
//                     onClick={() => cycle(pid)}
//                     className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/30"
//                   >
//                     <div className="min-w-0">
//                       <p className="text-sm font-medium">{permLabel(p)}</p>
//                       <p className="mt-0.5 text-xs text-muted-foreground">
//                         {pid}
//                       </p>
//                     </div>
//                     <span
//                       className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${s === "allowed" ? "bg-emerald-100 text-emerald-700" : s === "denied" ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"}`}
//                     >
//                       {s === "allowed"
//                         ? "Allowed"
//                         : s === "denied"
//                           ? "Denied"
//                           : "Inherited"}
//                       {active && s === "inherited" ? " · Active" : ""}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//         {saved && (
//           <p className="text-sm text-emerald-600">
//             Permissions saved successfully.
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   );
// }











import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, CalendarDays, Check, CircleDot, FileText, KeyRound, Loader2,
  Lock, Save, ShieldCheck, Trash2, UserRound, X,
} from "lucide-react";
import { staffApi, AttendanceRecord, LeaveRecord, StaffDocument, StaffProfile, PayrollRecord, PermissionCatalog } from "@/services/staff.service";
import { usePermissions } from "@/hooks/usePermissions";

const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n||0);
const label=(x:string)=>String(x ?? "").replace(/_/g," ").replace(/\./g," • ");
const initials=(x:string)=>x.split(" ").map(y=>y[0]).join("").slice(0,2).toUpperCase();

export default function StaffDetails(){
  const {id=""}=useParams();
  const nav=useNavigate();
  const {can,role}=usePermissions();
  const canManagePermissions=role==="super_admin" && can("employees.permissions");

  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [tab,setTab]=useState("overview");
  const [profile,setProfile]=useState<StaffProfile>({});
  const [attendance,setAttendance]=useState<any>(null);
  const [leaves,setLeaves]=useState<LeaveRecord[]>([]);
  const [docs,setDocs]=useState<StaffDocument[]>([]);
  const [activity,setActivity]=useState<any[]>([]);
  const [payroll,setPayroll]=useState<PayrollRecord[]>([]);
  const [catalog,setCatalog]=useState<PermissionCatalog|null>(null);
  const [saving,setSaving]=useState(false);
  const [month,setMonth]=useState(new Date().getMonth()+1);
  const [year,setYear]=useState(new Date().getFullYear());
  const [leaveNote,setLeaveNote]=useState("");
  const [doc,setDoc]=useState({documentType:"other",title:"",fileUrl:"",fileName:"",mimeType:"",note:""});
  const [pay,setPay]=useState({basicSalary:"",allowances:"0",deductions:"0",payrollMonth:new Date().toISOString().slice(0,7),paymentStatus:"pending",paymentDate:"",notes:""});
  const [newPassword,setNewPassword]=useState("");

  const load=async()=>{
    if(!id)return;
    setLoading(true);setError("");
    try{
      const r=await staffApi.details(id);
      setData(r.data);setProfile(r.data.profile||{});setLeaves(r.data.leaves||[]);setDocs(r.data.documents||[]);setActivity(r.data.activity||[]);
      if(canManagePermissions)staffApi.permissionCatalog().then(x=>setCatalog(x.data)).catch(()=>{});
    }catch(e:any){setError(e?.message||"Unable to load staff details")}finally{setLoading(false)}
  };
  useEffect(()=>{load()},[id,canManagePermissions]);

  useEffect(()=>{
    if(!id)return;
    staffApi.attendance(id,month,year).then(r=>setAttendance(r.data)).catch(()=>setAttendance(null));
  },[id,month,year]);

  useEffect(()=>{
    if(!id||tab!=="payroll"||!can("payroll.view"))return;
    staffApi.payroll({staffId:id,limit:100}).then(r=>setPayroll(r.data.records||[])).catch(()=>setPayroll([]));
  },[id,tab]);

  useEffect(()=>{
    if(!id||tab!=="activity")return;
    staffApi.activity(id,{limit:100}).then(r=>setActivity(r.data.activity||[])).catch(()=>{});
  },[id,tab]);

  const staff=data?.staff;
  const summary=attendance?.summary||{};
  const profileCompletion=useMemo(()=>{
    const keys=["employeeId","designation","department","dateOfJoining","dateOfBirth","gender","alternatePhone","notes"];
    return Math.round(keys.filter(k=>Boolean((profile as any)?.[k])).length/keys.length*100);
  },[profile]);

  const saveProfile=async()=>{
    setSaving(true);setError("");
    try{await staffApi.updateProfile(id,profile);await load()}catch(e:any){setError(e?.message||"Unable to save profile")}finally{setSaving(false)}
  };
  const review=async(l:LeaveRecord,status:"approved"|"rejected")=>{
    try{await staffApi.reviewLeave(l._id,status,leaveNote);setLeaveNote("");await load()}catch(e:any){setError(e?.message||"Unable to review leave")}
  };
  const addDoc=async()=>{
    try{await staffApi.addDocument(id,doc);setDoc({...doc,title:"",fileUrl:"",fileName:"",mimeType:"",note:""});await load()}catch(e:any){setError(e?.message||"Unable to add document")}
  };
  const removeDoc=async(docId:string)=>{try{await staffApi.deleteDocument(docId);await load()}catch(e:any){setError(e?.message||"Unable to delete document")}};
  const savePayroll=async()=>{
    try{await staffApi.createPayroll({staff:id,basicSalary:Number(pay.basicSalary),allowances:Number(pay.allowances),deductions:Number(pay.deductions),payrollMonth:pay.payrollMonth,paymentStatus:pay.paymentStatus,paymentDate:pay.paymentDate||null,notes:pay.notes});setPay({...pay,basicSalary:""});setTab("payroll")}catch(e:any){setError(e?.message||"Unable to create payroll")}
  };
  const resetPassword=async()=>{
    if(newPassword.length<8)return;
    try{await staffApi.resetPassword(id,newPassword);setNewPassword("")}catch(e:any){setError(e?.message||"Unable to reset password")}
  };

  if(loading)return <AdminLayout title="Employee details"><Card><CardContent className="py-20 text-center text-sm text-muted-foreground">Loading employee…</CardContent></Card></AdminLayout>;
  if(!staff)return <AdminLayout title="Employee details"><Card><CardContent className="py-20 text-center text-destructive">{error||"Employee not found"}</CardContent></Card></AdminLayout>;

  const tabs=[
    ["overview","Overview"],["profile","Profile"],["attendance","Attendance"],["leave","Leave"],["documents","Documents"],
    ...(canManagePermissions?[["permissions","Permissions"]]:[]),["activity","Activity"],...(can("payroll.view")?[["payroll","Payroll"]]:[])
  ];

  return (
    <AdminLayout title={staff.fullName} subtitle={`${label(staff.role)} · ${staff.email}`} actions={<Button variant="outline" onClick={()=>nav("/admin/staff")}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Employees</Button>}>
      <div className="space-y-5">
        {error&&<div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"><span>{error}</span><button onClick={()=>setError("")}><X className="h-4 w-4"/></button></div>}

        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"/>
          <CardContent className="-mt-9 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end">
              <Avatar className="h-20 w-20 border-4 border-background shadow-sm"><AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">{initials(staff.fullName)}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold tracking-tight">{staff.fullName}</h2><Badge variant={staff.isActive?"default":"outline"}>{staff.isActive?"Active":"Inactive"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{staff.email}{staff.phone?` · ${staff.phone}`:""}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="secondary" className="capitalize">{label(staff.role)}</Badge>{staff.branch?.name&&<Badge variant="outline">{staff.branch.name}</Badge>}</div></div>
              {can("employees.edit")&&<div className="w-full max-w-xs rounded-xl border bg-muted/20 p-3 md:w-56"><div className="flex justify-between text-xs"><span>Profile completion</span><span className="font-medium">{profileCompletion}%</span></div><Progress value={profileCompletion} className="mt-2 h-1.5"/></div>}
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto rounded-xl border bg-card p-1"><TabsList className="h-auto w-max min-w-full justify-start bg-transparent">
            {tabs.map(([value,text])=><TabsTrigger key={value} value={value} className="rounded-lg px-4 py-2">{text}</TabsTrigger>)}
          </TabsList></div>

          <TabsContent value="overview" className="mt-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Info title="Role" value={label(staff.role)} icon={ShieldCheck}/>
              <Info title="Status" value={staff.isActive?"Active":"Inactive"} icon={CircleDot}/>
              <Info title="Joined" value={staff.createdAt?new Date(staff.createdAt).toLocaleDateString("en-IN"):"—"} icon={CalendarDays}/>
              <Info title="Last login" value={staff.lastLoginAt?new Date(staff.lastLoginAt).toLocaleString("en-IN"):"Never"} icon={UserRound}/>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Employment snapshot</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><KV label="Employee ID" value={profile.employeeId}/><KV label="Designation" value={profile.designation}/><KV label="Department" value={profile.department}/><KV label="Date of joining" value={profile.dateOfJoining?new Date(profile.dateOfJoining).toLocaleDateString("en-IN"):undefined}/></CardContent></Card>
              {can("employees.edit")&&<Card><CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader><CardContent><div className="flex gap-3"><Input type="password" placeholder="New password (8+ chars)" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><Button variant="outline" onClick={resetPassword} disabled={newPassword.length<8}><KeyRound className="mr-2 h-4 w-4"/>Reset</Button></div><p className="mt-2 text-xs text-muted-foreground">Use this only when the employee needs a password reset.</p></CardContent></Card>}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-5"><Card><CardHeader><CardTitle>Employee profile</CardTitle></CardHeader><CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Employee ID" value={profile.employeeId} set={v=>setProfile({...profile,employeeId:v})}/>
              <Field label="Designation" value={profile.designation} set={v=>setProfile({...profile,designation:v})}/>
              <Field label="Department" value={profile.department} set={v=>setProfile({...profile,department:v})}/>
              <Field label="Alternate phone" value={profile.alternatePhone} set={v=>setProfile({...profile,alternatePhone:v})}/>
              <Field label="Gender" value={profile.gender} set={v=>setProfile({...profile,gender:v})}/>
              <Field label="Date of joining" type="date" value={(profile.dateOfJoining||"").slice(0,10)} set={v=>setProfile({...profile,dateOfJoining:v})}/>
              <Field label="Date of birth" type="date" value={(profile.dateOfBirth||"").slice(0,10)} set={v=>setProfile({...profile,dateOfBirth:v})}/>
            </div>
            <Field label="Notes" textarea value={profile.notes} set={v=>setProfile({...profile,notes:v})}/>
            {can("employees.edit")&&<Button onClick={saveProfile} disabled={saving}><Save className="mr-2 h-4 w-4"/>{saving?"Saving…":"Save profile"}</Button>}
          </CardContent></Card></TabsContent>

          <TabsContent value="attendance" className="mt-5"><Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Attendance</CardTitle><div className="flex gap-2"><select className="h-9 rounded-md border bg-background px-3 text-sm" value={month} onChange={e=>setMonth(Number(e.target.value))}>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{new Date(2000,i,1).toLocaleString("en-IN",{month:"short"})}</option>)}</select><Input className="w-24" value={year} onChange={e=>setYear(Number(e.target.value))}/></div></div></CardHeader><CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{Object.entries(summary).map(([k,v])=><Info key={k} title={String(k).replace(/_/g," ")} value={String(v)} compact/>)}</div>
            <div className="mt-5 overflow-auto rounded-xl border"><table className="w-full text-sm"><thead className="bg-muted/40"><tr className="text-left"><th className="p-3">Date</th><th>Status</th><th>Check in</th><th>Check out</th><th>Minutes</th><th>Note</th></tr></thead><tbody>{(attendance?.records||[]).map((r:AttendanceRecord)=><tr className="border-t" key={r._id}><td className="p-3">{new Date(r.date).toLocaleDateString("en-IN")}</td><td className="capitalize">{r.status}</td><td>{r.checkIn?new Date(r.checkIn).toLocaleTimeString("en-IN"):"—"}</td><td>{r.checkOut?new Date(r.checkOut).toLocaleTimeString("en-IN"):"—"}</td><td>{r.workingMinutes||0}</td><td>{r.note||"—"}</td></tr>)}</tbody></table></div>
          </CardContent></Card></TabsContent>

          <TabsContent value="leave" className="mt-5"><Card><CardHeader><CardTitle>Leave requests</CardTitle></CardHeader><CardContent className="space-y-4">
            <Textarea placeholder="Review note (optional)" value={leaveNote} onChange={e=>setLeaveNote(e.target.value)}/>
            <div className="overflow-auto rounded-xl border"><table className="w-full text-sm"><thead className="bg-muted/40"><tr className="text-left"><th className="p-3">Dates</th><th>Type</th><th>Days</th><th>Status</th><th>Reason</th><th>Action</th></tr></thead><tbody>{leaves.map(l=><tr className="border-t" key={l._id}><td className="p-3 whitespace-nowrap">{new Date(l.fromDate).toLocaleDateString("en-IN")} – {new Date(l.toDate).toLocaleDateString("en-IN")}</td><td className="capitalize">{l.leaveType}</td><td>{l.days}</td><td><Badge variant={l.status==="approved"?"default":l.status==="rejected"?"destructive":"secondary"} className="capitalize">{l.status}</Badge></td><td className="max-w-xs">{l.reason}</td><td>{l.status==="pending"&&can("leave.approve")&&<div className="flex gap-1"><Button size="sm" onClick={()=>review(l,"approved")}><Check className="mr-1 h-3.5 w-3.5"/>Approve</Button>{can("leave.reject")&&<Button size="sm" variant="outline" onClick={()=>review(l,"rejected")}><X className="mr-1 h-3.5 w-3.5"/>Reject</Button>}</div>}</td></tr>)}</tbody></table></div>
          </CardContent></Card></TabsContent>

          <TabsContent value="documents" className="mt-5"><Card><CardHeader><CardTitle>Employee documents</CardTitle></CardHeader><CardContent className="space-y-5">
            {can("documents.upload")&&<div className="grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-3"><select className="h-10 rounded-md border bg-background px-3 text-sm" value={doc.documentType} onChange={e=>setDoc({...doc,documentType:e.target.value})}>{["aadhaar","pan","resume","offer_letter","joining_letter","experience_letter","salary_slip","bank_proof","other"].map(x=><option key={x}>{x}</option>)}</select><Input placeholder="Document title" value={doc.title} onChange={e=>setDoc({...doc,title:e.target.value})}/><Input placeholder="File URL" value={doc.fileUrl} onChange={e=>setDoc({...doc,fileUrl:e.target.value})}/><Button className="md:col-span-3" onClick={addDoc} disabled={!doc.title||!doc.fileUrl}>Add document</Button></div>}
            <div className="grid gap-2">{docs.map(d=><div key={d._id} className="flex items-center justify-between gap-3 rounded-xl border p-4"><a href={d.fileUrl} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4"/></div><span className="min-w-0"><span className="block truncate font-medium">{d.title}</span><span className="text-xs capitalize text-muted-foreground">{d.documentType} · {new Date(d.createdAt).toLocaleDateString("en-IN")}</span></span></a>{can("documents.delete")&&<Button variant="ghost" size="icon" className="text-destructive" onClick={()=>removeDoc(d._id)}><Trash2 className="h-4 w-4"/></Button>}</div>)}</div>
          </CardContent></Card></TabsContent>

          {canManagePermissions&&<TabsContent value="permissions" className="mt-5"><PermissionPanel id={id} initial={data.permissions} catalog={catalog}/></TabsContent>}

          <TabsContent value="activity" className="mt-5"><Card><CardHeader><CardTitle>Activity history</CardTitle></CardHeader><CardContent>{activity.length?<div className="space-y-3">{activity.map((a,i)=><div key={a._id||i} className="relative border-l pl-5"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary"/><p className="font-medium">{a.action||"Activity"}</p><p className="text-xs text-muted-foreground">{a.createdAt?new Date(a.createdAt).toLocaleString("en-IN"):""}</p><pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-muted/40 p-3 text-xs">{a.metadata?JSON.stringify(a.metadata,null,2):a.description||""}</pre></div>)}</div>:<p className="py-10 text-center text-sm text-muted-foreground">No activity found.</p>}</CardContent></Card></TabsContent>

          {can("payroll.view")&&<TabsContent value="payroll" className="mt-5 space-y-5">
            {can("payroll.manage")&&<Card><CardHeader><CardTitle>Create payroll record</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-4"><Input type="number" placeholder="Basic salary" value={pay.basicSalary} onChange={e=>setPay({...pay,basicSalary:e.target.value})}/><Input type="number" placeholder="Allowances" value={pay.allowances} onChange={e=>setPay({...pay,allowances:e.target.value})}/><Input type="number" placeholder="Deductions" value={pay.deductions} onChange={e=>setPay({...pay,deductions:e.target.value})}/><Input type="month" value={pay.payrollMonth} onChange={e=>setPay({...pay,payrollMonth:e.target.value})}/><Button className="md:col-span-4" onClick={savePayroll} disabled={!pay.basicSalary}>Create payroll</Button></CardContent></Card>}
            <Card><CardHeader><CardTitle>Payroll history</CardTitle></CardHeader><CardContent><div className="overflow-auto rounded-xl border"><table className="w-full text-sm"><thead className="bg-muted/40"><tr className="text-left"><th className="p-3">Month</th><th>Basic</th><th>Net</th><th>Status</th><th>Payment date</th></tr></thead><tbody>{payroll.map(p=><tr className="border-t" key={p._id}><td className="p-3">{p.payrollMonth}</td><td>{money(p.basicSalary)}</td><td>{money(p.netSalary)}</td><td><Badge variant={p.paymentStatus==="paid"?"default":p.paymentStatus==="failed"?"destructive":"secondary"}>{p.paymentStatus}</Badge></td><td>{p.paymentDate?new Date(p.paymentDate).toLocaleDateString("en-IN"):"—"}</td></tr>)}</tbody></table></div></CardContent></Card>
          </TabsContent>}
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function Info({title,value,icon:Icon,compact=false}:{title:string;value:string;icon?:any;compact?:boolean}){return <div className={`rounded-xl border ${compact?"p-3":"p-4"}`}>{Icon&&<Icon className="mb-2 h-4 w-4 text-muted-foreground"/>}<p className="text-xs capitalize text-muted-foreground">{title}</p><p className="mt-1 font-semibold capitalize">{value}</p></div>}
function KV({label,value}:{label:string;value?:string|null}){return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value||"—"}</p></div>}
function Field({label,value,set,type="text",textarea=false}:{label:string;value?:string|null;set:(v:string)=>void;type?:string;textarea?:boolean}){return <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">{label}</span>{textarea?<Textarea value={value||""} onChange={e=>set(e.target.value)}/>:<Input type={type} value={value||""} onChange={e=>set(e.target.value)}/>}</label>}

const LOCAL_PERMISSION_GROUPS = [
  {key:"dashboard",label:"Dashboard",description:"Main staff workspace",permissions:[{permission:"dashboard.view",label:"Dashboard"}]},
  {key:"students",label:"Students",description:"Student management",permissions:[
    {permission:"students.view",label:"View Students"},{permission:"students.create",label:"Create Students"},{permission:"students.edit",label:"Edit Students"},{permission:"students.delete",label:"Delete Students"}
  ]},
  {key:"leads",label:"Leads",description:"CRM lead management",permissions:[
    {permission:"leads.view",label:"View Leads"},{permission:"leads.create",label:"Create Leads"},{permission:"leads.edit",label:"Edit Leads"},{permission:"leads.delete",label:"Delete Leads"},{permission:"leads.assign",label:"Assign Leads"}
  ]},
  {key:"admissions",label:"Admissions",description:"Admission workflow",permissions:[
    {permission:"admissions.view",label:"View Admissions"},{permission:"admissions.create",label:"Create Admissions"},{permission:"admissions.edit",label:"Edit Admissions"}
  ]},
  {key:"fees",label:"Fees",description:"Fee management",permissions:[
    {permission:"fees.view",label:"View Fees"},{permission:"fees.create",label:"Create Fees"},{permission:"fees.edit",label:"Edit Fees"},{permission:"fees.delete",label:"Delete Fees"}
  ]},
  {key:"payments",label:"Payments",description:"Payment and invoice access",permissions:[
    {permission:"payments.view",label:"View Payments"},{permission:"payments.create",label:"Create Payments"},{permission:"payments.edit",label:"Edit Payments"}
  ]},
  {key:"courses",label:"Courses",description:"Course management",permissions:[
    {permission:"courses.view",label:"View Courses"},{permission:"courses.create",label:"Create Courses"},{permission:"courses.edit",label:"Edit Courses"},{permission:"courses.delete",label:"Delete Courses"}
  ]},
  {key:"batches",label:"Batches",description:"Batch management",permissions:[
    {permission:"batches.view",label:"View Batches"},{permission:"batches.create",label:"Create Batches"},{permission:"batches.edit",label:"Edit Batches"},{permission:"batches.delete",label:"Delete Batches"}
  ]},
  {key:"live_classes",label:"Live Classes",description:"Live classroom access",permissions:[
    {permission:"live_classes.view",label:"View Live Classes"},{permission:"live_classes.manage",label:"Manage Live Classes"}
  ]},
  {key:"attendance",label:"Attendance",description:"Staff and attendance access",permissions:[
    {permission:"attendance.view",label:"View Attendance"},{permission:"attendance.manage",label:"Manage Attendance"}
  ]},
  {key:"employees",label:"Employees",description:"Staff management and permissions",permissions:[
    {permission:"employees.view",label:"View Employees"},{permission:"employees.create",label:"Create Employees"},{permission:"employees.edit",label:"Edit Employees"},{permission:"employees.delete",label:"Delete Employees"},{permission:"employees.permissions",label:"Manage Permissions"}
  ]},
  {key:"leave",label:"Leave",description:"Staff leave management",permissions:[
    {permission:"leave.view",label:"View Leave"},{permission:"leave.create",label:"Create Leave"},{permission:"leave.approve",label:"Approve Leave"},{permission:"leave.reject",label:"Reject Leave"}
  ]},
  {key:"documents",label:"Documents",description:"Staff documents",permissions:[
    {permission:"documents.view",label:"View Documents"},{permission:"documents.upload",label:"Upload Documents"},{permission:"documents.delete",label:"Delete Documents"}
  ]},
  {key:"reports",label:"Reports",description:"Analytics and reports",permissions:[{permission:"reports.view",label:"View Reports"}]},
  {key:"payroll",label:"Payroll",description:"Payroll access",permissions:[{permission:"payroll.view",label:"View Payroll"},{permission:"payroll.manage",label:"Manage Payroll"}]},
];

function PermissionPanel({id,initial,catalog}:{id:string;initial:any;catalog:PermissionCatalog|null}){
  const [overrides,setOverrides]=useState<Record<string,boolean>>({});
  const [effective,setEffective]=useState(new Set<string>());
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    if(!initial)return;
    setEffective(new Set(initial.effectivePermissions||[]));
    setOverrides(Object.fromEntries((initial.overrides||[]).map((x:any)=>[x.permission,x.allowed])));
  },[initial]);

  const groups=catalog?.groups||[];
  const all=catalog?.allPermissions||initial?.allPermissions||[];
  const fallbackGroups=groups.length?groups:LOCAL_PERMISSION_GROUPS.filter(group=>group.permissions.some((item:any)=>all.includes(item.permission)));

  const normalizePermission=(item:any)=>{
    if(typeof item==="string"){
      return {permission:item,label:label(item)};
    }
    const permission=String(item?.permission??"");
    return {
      permission,
      label:String(item?.label??label(permission)),
    };
  };

  const state=(permission:string):"allowed"|"denied"|"inherited"=>{
    if(Object.prototype.hasOwnProperty.call(overrides,permission))return overrides[permission]?"allowed":"denied";
    return "inherited";
  };

  const cycle=(permission:string)=>{
    const current=state(permission);
    if(current==="inherited")setOverrides({...overrides,[permission]:true});
    else if(current==="allowed")setOverrides({...overrides,[permission]:false});
    else {const next={...overrides};delete next[permission];setOverrides(next)}
    setSaved(false);
  };

  const isEffective=(permission:string)=>effective.has(permission);

  const save=async()=>{
    setSaving(true);setSaved(false);
    try{
      const payload=Object.entries(overrides).map(([permission,allowed])=>({permission,allowed}));
      const r=await staffApi.updatePermissions(id,payload);
      setEffective(new Set(r.data.effectivePermissions||[]));
      setSaved(true);
    }catch(e:any){alert(e?.message||"Unable to save permissions")}
    finally{setSaving(false)}
  };

  return <Card>
    <CardHeader>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Access & permissions</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Manage access using the same module names used in the staff sidebar.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>}
          {saving?"Saving…":"Save permissions"}
        </Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {fallbackGroups.map((group:any)=><div key={String(group.key)} className="overflow-hidden rounded-2xl border">
        <div className="border-b bg-muted/30 px-4 py-3">
          <p className="font-medium">{String(group.label)}</p>
          {group.description&&<p className="text-xs text-muted-foreground">{String(group.description)}</p>}
        </div>
        <div className="divide-y">
          {(Array.isArray(group.permissions)?group.permissions:[]).map((permissionItem:any,index:number)=>{
            const item=normalizePermission(permissionItem);
            if(!item.permission)return null;
            const s=state(item.permission);
            const active=isEffective(item.permission);
            return <button type="button" key={`${item.permission}-${index}`} onClick={()=>cycle(item.permission)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/30">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s==="inherited"?"Role default":s==="allowed"?"Custom access granted":"Custom access denied"}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${active?"bg-emerald-100 text-emerald-700":s==="denied"?"bg-red-100 text-red-700":"bg-muted text-muted-foreground"}`}>
                {active?"Allowed":s==="denied"?"Denied":"Not allowed"}
              </span>
            </button>
          })}
        </div>
      </div>)}
      {saved&&<p className="text-sm text-emerald-600">Permissions saved successfully.</p>}
    </CardContent>
  </Card>
}
