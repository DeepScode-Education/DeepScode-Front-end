import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { staffApi, StaffMember, StaffRole } from "@/services/staff.service";
import { usePermissions } from "@/hooks/usePermissions";
import { Search, UserPlus, Eye, Pencil, Power, Trash2, KeyRound, X, UsersRound } from "lucide-react";

const roles:StaffRole[]=["admin","coordinator","counsellor","mentor","accountant","hr","receptionist"];

const roleLabel=(role:string)=>String(role ?? "").replace(/_/g," ");
const initials=(name:string)=>name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();

export default function StaffManagement(){
  const {can,role:currentRole}=usePermissions();
  const [rows,setRows]=useState<StaffMember[]>([]);
  const [search,setSearch]=useState("");
  const [role,setRole]=useState("");
  const [status,setStatus]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [showCreate,setShowCreate]=useState(false);
  const [editing,setEditing]=useState<StaffMember|null>(null);
  const [resetting,setResetting]=useState<StaffMember|null>(null);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({fullName:"",email:"",password:"",role:"mentor",phone:"",branch:""});
  const [newPassword,setNewPassword]=useState("");

  const load=async()=>{
    setLoading(true);setError("");
    try{const r=await staffApi.list({search,role,isActive:status===""?undefined:status==="active"});setRows(r.data||[])}
    catch(e:any){setError(e?.message||"Unable to load staff")}finally{setLoading(false)}
  };
  useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[search,role,status]);

  const stats=useMemo(()=>({total:rows.length,active:rows.filter(x=>x.isActive).length,inactive:rows.filter(x=>!x.isActive).length}),[rows]);

  const create=async()=>{
    setSaving(true);setError("");
    try{await staffApi.create(form as any);setShowCreate(false);setForm({fullName:"",email:"",password:"",role:"mentor",phone:"",branch:""});load()}
    catch(e:any){setError(e?.message||"Unable to create staff")}finally{setSaving(false)}
  };
  const update=async()=>{
    if(!editing)return;setSaving(true);setError("");
    try{await staffApi.update(editing._id,{fullName:editing.fullName,email:editing.email,phone:editing.phone,role:editing.role,branch:editing.branch?._id||editing.branch});setEditing(null);load()}
    catch(e:any){setError(e?.message||"Unable to update staff")}finally{setSaving(false)}
  };
  const toggle=async(s:StaffMember)=>{try{s.isActive?await staffApi.deactivate(s._id):await staffApi.activate(s._id);load()}catch(e:any){setError(e?.message||"Unable to update status")}};
  const remove=async(s:StaffMember)=>{if(!confirm(`Delete ${s.fullName}? This permanently removes the account.`))return;try{await staffApi.remove(s._id);load()}catch(e:any){setError(e?.message||"Unable to delete staff")}};
  const resetPassword=async()=>{if(!resetting||newPassword.length<8)return;setSaving(true);try{await staffApi.resetPassword(resetting._id,newPassword);setResetting(null);setNewPassword("")}catch(e:any){setError(e?.message||"Unable to reset password")}finally{setSaving(false)}};

  return <AdminLayout title="Employees" subtitle="Manage staff accounts, roles, access and employee records." actions={can("employees.create")&&<Button onClick={()=>setShowCreate(true)}><UserPlus className="mr-2 h-4 w-4"/>Add employee</Button>}>
    <div className="space-y-5">
      {error&&<div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"><span>{error}</span><button onClick={()=>setError("")}><X className="h-4 w-4"/></button></div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat title="Total staff" value={stats.total} icon={UsersRound}/>
        <Stat title="Active" value={stats.active} icon={Power}/>
        <Stat title="Inactive" value={stats.inactive} icon={Power}/>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder="Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={role} onChange={e=>setRole(e.target.value)}><option value="">All roles</option>{roles.map(r=><option key={r} value={r}>{roleLabel(r)}</option>)}</select>
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </div>
        </CardContent>
      </Card>

      {loading?<Card><CardContent className="py-16 text-center text-sm text-muted-foreground">Loading employees…</CardContent></Card>:
      rows.length===0?<Card><CardContent className="flex flex-col items-center py-16 text-center"><UsersRound className="mb-3 h-10 w-10 text-muted-foreground/40"/><h3 className="font-medium">No employees found</h3><p className="mt-1 text-sm text-muted-foreground">Try changing your filters or create a new employee.</p></CardContent></Card>:
      <div className="grid gap-3">
        {rows.map(s=><Card key={s._id} className="transition-shadow hover:shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="h-11 w-11"><AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initials(s.fullName)}</AvatarFallback></Avatar>
                <div className="min-w-0"><div className="truncate font-semibold">{s.fullName}</div><div className="truncate text-sm text-muted-foreground">{s.email}</div><div className="mt-1 text-xs text-muted-foreground">{s.branch?.name||s.branch?.code||"No branch assigned"}</div></div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">{roleLabel(s.role)}</Badge>
                <Badge variant={s.isActive?"default":"outline"}>{s.isActive?"Active":"Inactive"}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Button asChild size="sm" variant="outline"><Link to={`/admin/staff/${s._id}`}><Eye className="mr-1.5 h-3.5 w-3.5"/>View</Link></Button>
                {can("employees.edit")&&<Button size="sm" variant="outline" onClick={()=>setEditing({...s})}><Pencil className="mr-1.5 h-3.5 w-3.5"/>Edit</Button>}
                {can("employees.edit")&&<Button size="sm" variant="outline" onClick={()=>toggle(s)}><Power className="mr-1.5 h-3.5 w-3.5"/>{s.isActive?"Disable":"Enable"}</Button>}
                {can("employees.edit")&&<Button size="sm" variant="ghost" onClick={()=>setResetting(s)}><KeyRound className="h-4 w-4"/></Button>}
                {can("employees.delete")&&currentRole==="super_admin"&&<Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={()=>remove(s)}><Trash2 className="h-4 w-4"/></Button>}
              </div>
            </div>
          </CardContent>
        </Card>)}
      </div>}
    </div>

    {(showCreate||editing||resetting)&&<Modal title={showCreate?"Create employee":resetting?"Reset password":"Edit employee"} onClose={()=>{setShowCreate(false);setEditing(null);setResetting(null);setNewPassword("")}}>
      {showCreate&&<div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><Input value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})}/></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
        <Field label="Password"><Input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></Field>
        <Field label="Phone"><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
        <Field label="Role"><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>{roles.map(r=><option key={r}>{r}</option>)}</select></Field>
        <Field label="Branch ID (optional)"><Input value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}/></Field>
        <div className="flex justify-end gap-2 sm:col-span-2"><Button variant="outline" onClick={()=>setShowCreate(false)}>Cancel</Button><Button onClick={create} disabled={saving||!form.fullName||!form.email||form.password.length<8}>{saving?"Creating…":"Create employee"}</Button></div>
      </div>}
      {editing&&<div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><Input value={editing.fullName} onChange={e=>setEditing({...editing,fullName:e.target.value})}/></Field>
        <Field label="Email"><Input value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})}/></Field>
        <Field label="Phone"><Input value={editing.phone||""} onChange={e=>setEditing({...editing,phone:e.target.value})}/></Field>
        <Field label="Role"><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={editing.role} onChange={e=>setEditing({...editing,role:e.target.value as StaffRole})}>{roles.map(r=><option key={r}>{r}</option>)}</select></Field>
        <div className="flex justify-end gap-2 sm:col-span-2"><Button variant="outline" onClick={()=>setEditing(null)}>Cancel</Button><Button onClick={update} disabled={saving}>{saving?"Saving…":"Save changes"}</Button></div>
      </div>}
      {resetting&&<div className="space-y-4"><div><p className="font-medium">{resetting.fullName}</p><p className="text-sm text-muted-foreground">{resetting.email}</p></div><Field label="New password"><Input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Minimum 8 characters"/></Field><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setResetting(null)}>Cancel</Button><Button onClick={resetPassword} disabled={saving||newPassword.length<8}>{saving?"Updating…":"Reset password"}</Button></div></div>}
    </Modal>}
  </AdminLayout>
}

function Stat({title,value,icon:Icon}:{title:string;value:number;icon:any}){return <Card><CardContent className="flex items-center gap-3 p-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5"/></div><div><p className="text-xs text-muted-foreground">{title}</p><p className="text-xl font-semibold">{value}</p></div></CardContent></Card>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="text-sm"><span className="mb-1.5 block text-muted-foreground">{label}</span>{children}</label>}
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){return <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border bg-card p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4"/></Button></div>{children}</div></div>}
