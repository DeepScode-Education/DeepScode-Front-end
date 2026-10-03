const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export type StaffRole = "super_admin" | "admin" | "coordinator" | "counsellor" | "mentor" | "accountant" | "hr" | "receptionist";
export interface PermissionGroup { key: string; label: string; description?: string; permissions: string[]; }
export interface PermissionCatalog { allPermissions: string[]; groups: PermissionGroup[]; roleDefaults: Record<string, string[]>; }
export type AttendanceStatus = "present" | "absent" | "leave" | "half_day" | "holiday";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface StaffMember { _id:string; fullName:string; email:string; phone?:string; role:StaffRole; branch?:any; isActive:boolean; status?:string; profileCompleted?:boolean; createdAt:string; lastLoginAt?:string|null; }
export interface StaffProfile { employeeId?:string; designation?:string; department?:string; dateOfJoining?:string|null; dateOfBirth?:string|null; gender?:string; alternatePhone?:string; address?:Record<string,string>; emergencyContact?:Record<string,string>; bankDetails?:Record<string,string>; notes?:string; }
export interface AttendanceRecord { _id:string; staff:string; date:string; status:AttendanceStatus; checkIn?:string|null; checkOut?:string|null; workingMinutes?:number; note?:string; markedBy?:any; }
export interface LeaveRecord { _id:string; staff:any; leaveType:string; fromDate:string; toDate:string; days:number; reason:string; status:LeaveStatus; reviewedBy?:any; reviewedAt?:string|null; reviewNote?:string; }
export interface StaffDocument { _id:string; staff:string; documentType:string; title:string; fileUrl:string; publicId?:string; fileName?:string; mimeType?:string; uploadedBy?:any; note?:string; createdAt:string; }
export interface PayrollRecord { _id:string; staff:any; basicSalary:number; allowances:number; deductions:number; netSalary:number; payrollMonth:string; paymentStatus:"pending"|"paid"|"failed"; paymentDate?:string|null; notes?:string; createdBy?:any; createdAt:string; }

async function request<T>(path:string, options:RequestInit={}) : Promise<T> {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) headers.set("Content-Type","application/json");
  if (token) headers.set("Authorization",`Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`,{...options,headers,cache:"no-store"});
  const body = await res.json().catch(()=>({message:res.statusText}));
  if (!res.ok || body.success === false) throw new Error(body.message || "Request failed");
  return body as T;
}

const qs = (params:Record<string,unknown>) => { const p=new URLSearchParams(); Object.entries(params).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=="")p.set(k,String(v));}); const s=p.toString(); return s?`?${s}`:""; };

export const staffApi = {
  list: (params:Record<string,unknown>={}) => request<{success:boolean;data:StaffMember[];total:number;page:number;totalPages:number}>(`/api/staff${qs(params)}`),
  get: (id:string) => request<{success:boolean;data:StaffMember}>(`/api/staff/${id}`),
  details: (id:string) => request<{success:boolean;data:{staff:StaffMember;profile:StaffProfile|null;attendance:{summary:any;records:AttendanceRecord[]};leaves:LeaveRecord[];documents:StaffDocument[];permissions:{roleDefaults:string[];overrides:{permission:string;allowed:boolean}[];effectivePermissions:string[]};activity:any[]}}>(`/api/staff/${id}/details`),
  activity: (id:string, params:Record<string,unknown>={}) => request<{success:boolean;data:{staff:StaffMember;activity:any[];page:number;limit:number;total:number;totalPages:number}}>(`/api/staff/${id}/activity${qs(params)}`),
  create: (payload:Partial<StaffMember>&{password:string}) => request<{success:boolean;data:StaffMember}>(`/api/staff`,{method:"POST",body:JSON.stringify(payload)}),
  update: (id:string,payload:Record<string,unknown>) => request<{success:boolean;data:StaffMember}>(`/api/staff/${id}`,{method:"PUT",body:JSON.stringify(payload)}),
  activate: (id:string) => request(`/api/staff/${id}/activate`,{method:"PATCH"}),
  deactivate: (id:string) => request(`/api/staff/${id}/deactivate`,{method:"PATCH"}),
  resetPassword: (id:string,newPassword:string) => request(`/api/staff/${id}/reset-password`,{method:"PATCH",body:JSON.stringify({newPassword})}),
  remove: (id:string) => request(`/api/staff/${id}`,{method:"DELETE"}),
  profile: (id:string) => request<{success:boolean;data:{user:StaffMember;profile:StaffProfile|null}}>(`/api/staff-profile/${id}`),
  updateProfile: (id:string,payload:StaffProfile) => request(`/api/staff-profile/${id}`,{method:"PUT",body:JSON.stringify(payload)}),
  myProfile: () => request<{success:boolean;data:{user:StaffMember;profile:StaffProfile|null}}>(`/api/staff-profile/me`),
  updateMyProfile: (payload:StaffProfile) => request(`/api/staff-profile/me`,{method:"PUT",body:JSON.stringify(payload)}),
  attendance: (id:string,month:number,year:number) => request<{success:boolean;data:{summary:any;records:AttendanceRecord[];month:number;year:number;staff:StaffMember}}>(`/api/staff-attendance/${id}${qs({month,year})}`),
  myAttendance: (month:number,year:number) => request<{success:boolean;data:{summary:any;records:AttendanceRecord[]}}>(`/api/staff-attendance/me${qs({month,year})}`),
  markAttendance: (id:string,payload:Record<string,unknown>) => request(`/api/staff-attendance/${id}`,{method:"PUT",body:JSON.stringify(payload)}),
  leaves: (params:Record<string,unknown>={}) => request<{success:boolean;data:LeaveRecord[]}>(`/api/staff-leaves${qs(params)}`),
  myLeaves: () => request<{success:boolean;data:LeaveRecord[]}>(`/api/staff-leaves/me`),
  createLeave: (payload:Record<string,unknown>) => request<{success:boolean;data:LeaveRecord}>(`/api/staff-leaves`,{method:"POST",body:JSON.stringify(payload)}),
  reviewLeave: (id:string,status:"approved"|"rejected",reviewNote="") => request(`/api/staff-leaves/${id}/review`,{method:"PATCH",body:JSON.stringify({status,reviewNote})}),
  cancelLeave: (id:string) => request(`/api/staff-leaves/${id}/cancel`,{method:"PATCH"}),
  documents: (id:string) => request<{success:boolean;data:{staff:StaffMember;documents:StaffDocument[]}}>(`/api/staff-documents/${id}`),
  myDocuments: () => request<{success:boolean;data:{staff:StaffMember;documents:StaffDocument[]}}>(`/api/staff-documents/me`),
  addDocument: (id:string,payload:Record<string,unknown>) => request(`/api/staff-documents/${id}`,{method:"POST",body:JSON.stringify(payload)}),
  deleteDocument: (id:string) => request(`/api/staff-documents/document/${id}`,{method:"DELETE"}),
  permissionCatalog: () => request<{success:boolean;data:PermissionCatalog}>(`/api/permissions/catalog`),
  permissions: (id:string) => request<{success:boolean;data:{staff:StaffMember;allPermissions:string[];roleDefaults:string[];overrides:{permission:string;allowed:boolean}[];effectivePermissions:string[]}}>(`/api/permissions/staff/${id}`),
  updatePermissions: (id:string,overrides:{permission:string;allowed:boolean}[]) => request<{success:boolean;data:{effectivePermissions:string[];overrides:{permission:string;allowed:boolean}[]}}>(`/api/permissions/staff/${id}`,{method:"PUT",body:JSON.stringify({overrides})}),
  myPermissions: () => request<{success:boolean;data:{role:StaffRole;permissions:string[]}}>(`/api/permissions/me`),
  payroll: (params:Record<string,unknown>={}) => request<{success:boolean;data:{records:PayrollRecord[];page:number;limit:number;total:number;totalPages:number}}>(`/api/payroll${qs(params)}`),
  payrollById: (id:string) => request<{success:boolean;data:PayrollRecord}>(`/api/payroll/${id}`),
  createPayroll: (payload:Record<string,unknown>) => request<{success:boolean;data:PayrollRecord}>(`/api/payroll`,{method:"POST",body:JSON.stringify(payload)}),
  updatePayroll: (id:string,payload:Record<string,unknown>) => request<{success:boolean;data:PayrollRecord}>(`/api/payroll/${id}`,{method:"PUT",body:JSON.stringify(payload)}),
};
