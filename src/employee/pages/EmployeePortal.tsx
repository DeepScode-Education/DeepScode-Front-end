import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import AdminLayout from "@/admin/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { staffApi } from "@/services/staff.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, FileText, Save, UserRound } from "lucide-react";

export default function EmployeePortal() {
  const { user, loading: authLoading } = useAuth();
  const { can, loading: permLoading } = usePermissions();
  const [params,setParams]=useSearchParams();
  const [profile,setProfile]=useState<any>(null);
  const [leaves,setLeaves]=useState<any[]>([]);
  const [attendance,setAttendance]=useState<any>(null);
  const [docs,setDocs]=useState<any[]>([]);
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);
  const [leave,setLeave]=useState({leaveType:"casual",fromDate:"",toDate:"",reason:""});

  const view=params.get("view")==="account"?"account":"account";
  const load=async()=>{
    setError("");
    try {
      if(can("profile.view")){const r=await staffApi.myProfile();setProfile(r.data.profile||{})}
      if(can("leave.view")){const r=await staffApi.myLeaves();setLeaves(r.data||[])}
      if(can("attendance.view")){const d=new Date();const r=await staffApi.myAttendance(d.getMonth()+1,d.getFullYear());setAttendance(r.data)}
      if(can("documents.view")){const r=await staffApi.myDocuments();setDocs(r.data.documents||[])}
    } catch(e:any){setError(e?.message||"Unable to load account")}
  };
  useEffect(()=>{if(!permLoading&&user)load()},[permLoading,user]);

  if(authLoading)return <div className="min-h-screen grid place-items-center">Loading…</div>;
  if(!user)return <Navigate to="/login" replace/>;
  if(permLoading)return <div className="min-h-screen grid place-items-center">Loading workspace…</div>;

  const initials=user.fullName?.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()||"ST";
  const saveProfile=async()=>{
    setSaving(true);setError("");
    try{await staffApi.updateMyProfile(profile||{});await load()}catch(e:any){setError(e?.message||"Unable to save profile")}finally{setSaving(false)}
  };
  const applyLeave=async()=>{
    try{await staffApi.createLeave(leave);setLeave({leaveType:"casual",fromDate:"",toDate:"",reason:""});await load()}catch(e:any){setError(e?.message||"Unable to apply leave")}
  };

  return <AdminLayout title="My Account" subtitle="Manage your staff profile and personal workplace information.">
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"/>
        <CardContent className="-mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
          <Avatar className="h-16 w-16 border-4 border-background shadow-sm"><AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initials}</AvatarFallback></Avatar>
          <div className="flex-1"><h2 className="text-xl font-semibold">{user.fullName}</h2><p className="text-sm text-muted-foreground">{user.email}</p><Badge variant="secondary" className="mt-2 capitalize">{String(user.role ?? "").replace(/_/g," ")}</Badge></div>
        </CardContent>
      </Card>

      {error&&<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      <Tabs defaultValue={view} onValueChange={v=>setParams(v==="account"?{view:"account"}:{view:v})}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="account"><UserRound className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
          {can("attendance.view")&&<TabsTrigger value="attendance"><CalendarDays className="mr-2 h-4 w-4"/>Attendance</TabsTrigger>}
          {can("leave.view")&&<TabsTrigger value="leave">Leave</TabsTrigger>}
          {can("documents.view")&&<TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>}
        </TabsList>

        <TabsContent value="account" className="mt-5">
          <Card><CardHeader><CardTitle>Personal & employment details</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Employee ID","employeeId"],["Designation","designation"],["Department","department"],["Alternate phone","alternatePhone"],
            ].map(([label,key])=><label key={key} className="text-sm"><span className="mb-1.5 block text-muted-foreground">{label}</span><Input value={profile?.[key]||""} onChange={e=>setProfile({...profile,[key]:e.target.value})}/></label>)}
            <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Date of joining</span><Input type="date" value={(profile?.dateOfJoining||"").slice(0,10)} onChange={e=>setProfile({...profile,dateOfJoining:e.target.value})}/></label>
            <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">Date of birth</span><Input type="date" value={(profile?.dateOfBirth||"").slice(0,10)} onChange={e=>setProfile({...profile,dateOfBirth:e.target.value})}/></label>
            <label className="text-sm sm:col-span-2 lg:col-span-3"><span className="mb-1.5 block text-muted-foreground">Notes</span><textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" value={profile?.notes||""} onChange={e=>setProfile({...profile,notes:e.target.value})}/></label>
            {can("profile.edit")&&<div className="sm:col-span-2 lg:col-span-3"><Button onClick={saveProfile} disabled={saving}><Save className="mr-2 h-4 w-4"/>{saving?"Saving…":"Save changes"}</Button></div>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-5"><Card><CardHeader><CardTitle>This month's attendance</CardTitle></CardHeader><CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Object.entries(attendance?.summary||{}).map(([k,v])=><div key={k} className="rounded-xl border p-4"><p className="text-xs capitalize text-muted-foreground">{String(k).replace(/_/g," ")}</p><p className="mt-1 text-xl font-semibold">{String(v)}</p></div>)}</div>
          <div className="mt-5 overflow-auto rounded-xl border"><table className="w-full text-sm"><thead className="bg-muted/50"><tr className="text-left"><th className="p-3">Date</th><th>Status</th><th>Check in</th><th>Check out</th><th>Minutes</th></tr></thead><tbody>{(attendance?.records||[]).map((r:any)=><tr className="border-t" key={r._id}><td className="p-3">{new Date(r.date).toLocaleDateString("en-IN")}</td><td className="capitalize">{r.status}</td><td>{r.checkIn?new Date(r.checkIn).toLocaleTimeString("en-IN"):"—"}</td><td>{r.checkOut?new Date(r.checkOut).toLocaleTimeString("en-IN"):"—"}</td><td>{r.workingMinutes||0}</td></tr>)}</tbody></table></div>
        </CardContent></Card></TabsContent>

        <TabsContent value="leave" className="mt-5"><Card><CardHeader><CardTitle>My leave</CardTitle></CardHeader><CardContent>
          {can("leave.create")&&<div className="mb-6 grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={leave.leaveType} onChange={e=>setLeave({...leave,leaveType:e.target.value})}>{["casual","sick","earned","unpaid","other"].map(x=><option key={x}>{x}</option>)}</select>
            <Input type="date" value={leave.fromDate} onChange={e=>setLeave({...leave,fromDate:e.target.value})}/><Input type="date" value={leave.toDate} onChange={e=>setLeave({...leave,toDate:e.target.value})}/><Input placeholder="Reason" value={leave.reason} onChange={e=>setLeave({...leave,reason:e.target.value})}/>
            <Button className="sm:col-span-2 lg:col-span-4" onClick={applyLeave}>Apply for leave</Button>
          </div>}
          <div className="space-y-2">{leaves.map(l=><div key={l._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="font-medium capitalize">{l.leaveType} leave</p><p className="text-sm text-muted-foreground">{new Date(l.fromDate).toLocaleDateString("en-IN")} – {new Date(l.toDate).toLocaleDateString("en-IN")} · {l.days} day(s)</p></div><Badge variant={l.status==="approved"?"default":l.status==="rejected"?"destructive":"secondary"} className="capitalize">{l.status}</Badge></div>)}</div>
        </CardContent></Card></TabsContent>

        <TabsContent value="documents" className="mt-5"><Card><CardHeader><CardTitle>My documents</CardTitle></CardHeader><CardContent className="space-y-2">
          {docs.length?docs.map(d=><a key={d._id} href={d.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/40"><span><span className="block font-medium">{d.title}</span><span className="text-xs capitalize text-muted-foreground">{d.documentType}</span></span><FileText className="h-4 w-4 text-muted-foreground"/></a>):<p className="py-8 text-center text-sm text-muted-foreground">No documents available.</p>}
        </CardContent></Card></TabsContent>
      </Tabs>
    </div>
  </AdminLayout>;
}
