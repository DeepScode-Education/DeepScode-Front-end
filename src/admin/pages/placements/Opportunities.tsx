
// import { useCallback, useEffect, useState } from "react";
// import { Plus, Briefcase, MapPin, Loader2, Trash2, Pencil, Eye, EyeOff, Badge } from "lucide-react";
// import AdminLayout from "../../components/AdminLayout";
// import { Button } from "@/components/ui/button";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useToast } from "@/hooks/use-toast";
// import CreateJobWizard from "./create-job/CreateJobWizard";
// // ⚠️ Adjust to wherever opportunitiesApi actually lives in your client.ts
// import { opportunitiesApi, opportunityApplicationApi } from "@/integrations/client";
// import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
// import { DialogHeader } from "@/components/ui/dialog";

// interface Opportunity {
//   _id: string;
//   jobTitle: string;
//   companyEntity?: string;
//   employmentType?: string;
//   primaryLocation?: string;
//   status: "draft" | "published";
//   createdAt?: string;
//   applicationCount?: number; 
// }

// const unwrap = (res: any) => (res?.data !== undefined && res?.success === undefined ? res.data : res);

// const Opportunities = () => {
//   const { toast } = useToast();
//   const [view, setView] = useState<"list" | "create" | "edit">("list");
//   const [editingId, setEditingId] = useState<string | null>(null);

//   const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);
//   const [deleting, setDeleting] = useState(false);
//   const [togglingId, setTogglingId] = useState<string | null>(null);

//   // ── add near other useState calls ──
// const [viewApplicantsFor, setViewApplicantsFor] = useState<Opportunity | null>(null);
// const [applicants, setApplicants] = useState<any[]>([]);
// const [loadingApplicants, setLoadingApplicants] = useState(false);

// useEffect(() => {
//   if (!viewApplicantsFor) return;
//   setLoadingApplicants(true);
//   opportunityApplicationApi
//     .getForOpportunity(viewApplicantsFor._id)
//     .then((res: any) => {
//       const data = res?.data !== undefined && res?.success === undefined ? res.data : res;
//       setApplicants(data?.data || []);
//     })
//     .catch(() => setApplicants([]))
//     .finally(() => setLoadingApplicants(false));
// }, [viewApplicantsFor]);

//   const fetchOpportunities = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = unwrap(await opportunitiesApi.getAll({ limit: 100 }));
//       if (!res?.success) throw new Error(res?.message || "Failed to load opportunities");
//       setOpportunities(res.data || []);
//     } catch (err: any) {
//       setError(err?.message || "Failed to load opportunities");
//       setOpportunities([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchOpportunities();
//   }, [fetchOpportunities]);

//   const handleSaved = () => {
//     setView("list");
//     setEditingId(null);
//     fetchOpportunities();
//   };

//   const handleEdit = (id: string) => {
//     setEditingId(id);
//     setView("edit");
//   };

//   const requestDelete = (o: Opportunity) => setDeleteTarget(o);

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleting(true);
//     try {
//       const res = unwrap(await opportunitiesApi.remove(deleteTarget._id));
//       if (!res?.success) throw new Error(res?.message || "Failed to delete opportunity");
//       toast({ title: "Opportunity deleted", description: `${deleteTarget.jobTitle} has been removed.` });
//       setDeleteTarget(null);
//       fetchOpportunities();
//     } catch (err: any) {
//       toast({ title: "Failed to delete", description: err?.message || "Please try again.", variant: "destructive" });
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const toggleStatus = async (o: Opportunity) => {
//     const nextStatus = o.status === "published" ? "draft" : "published";
//     setTogglingId(o._id);
//     try {
//       const res = unwrap(await opportunitiesApi.updateStatus(o._id, nextStatus));
//       if (!res?.success) throw new Error(res?.message || "Failed to update status");
//       toast({
//         title: nextStatus === "published" ? "Opportunity published" : "Moved to draft",
//         description: o.jobTitle,
//       });
//       fetchOpportunities();
//     } catch (err: any) {
//       toast({ title: "Failed to update status", description: err?.message || "Please try again.", variant: "destructive" });
//     } finally {
//       setTogglingId(null);
//     }
//   };

//   if (view === "create") {
//     return <CreateJobWizard onExit={() => setView("list")} onSaved={handleSaved} />;
//   }
//   if (view === "edit" && editingId) {
//     return (
//       <CreateJobWizard
//         opportunityId={editingId}
//         onExit={() => {
//           setView("list");
//           setEditingId(null);
//         }}
//         onSaved={handleSaved}
//       />
//     );
//   }

//   return (
//     <AdminLayout
//       title="Opportunities"
//       subtitle="Open roles and internships from hiring partners."
//       actions={
//         <Button size="sm" className="text-white" onClick={() => setView("create")}>
//           <Plus size={14} /> Post Role
//         </Button>
//       }
//     >
//       {loading ? (
//         <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading opportunities...
//         </div>
//       ) : error ? (
//         <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-center">
//           <p className="text-sm text-destructive">{error}</p>
//           <Button size="sm" variant="outline" onClick={fetchOpportunities}>
//             Retry
//           </Button>
//         </div>
//       ) : opportunities.length === 0 ? (
//         <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card text-center text-muted-foreground">
//           <Briefcase size={24} />
//           <p className="text-sm">No opportunities posted yet.</p>
//           <Button size="sm" onClick={() => setView("create")}>
//             <Plus size={14} /> Post your first role
//           </Button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
//           {opportunities.map((o) => (
//             <div key={o._id} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h3 className="text-sm font-semibold">{o.jobTitle}</h3>
//                   <p className="text-xs text-muted-foreground">{o.companyEntity || "—"}</p>
//                 </div>
//                 <span
//                   className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
//                     o.status === "published" ? "bg-[#0037FF]/10 text-[#0037FF]" : "bg-secondary text-muted-foreground"
//                   }`}
//                 >
//                   {o.status === "published" ? o.employmentType || "Published" : "Draft"}
//                 </span>
//               </div>
//               <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
//                 <span className="flex items-center gap-1">
//                   <MapPin size={11} />
//                   {o.primaryLocation || "—"}
//                 </span>
//               </div>
//               <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
//                 <span className="text-[11px] text-muted-foreground">
//                   {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}
//                 </span>
//                 <button
//       onClick={() => setViewApplicantsFor(o)}
//       className="rounded-full bg-[#0037FF]/10 px-2 py-0.5 text-[11px] font-medium text-[#0037FF] hover:bg-[#0037FF]/20"
//     >
//       {o.applicationCount ?? 0} Applicant{(o.applicationCount ?? 0) === 1 ? "" : "s"}
//     </button>
//                 <div className="flex items-center gap-1">
//                   <Button variant="ghost" size="icon" onClick={() => handleEdit(o._id)} title="Edit">
//                     <Pencil size={14} />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => toggleStatus(o)}
//                     disabled={togglingId === o._id}
//                     title={o.status === "published" ? "Move to draft" : "Publish"}
//                   >
//                     {togglingId === o._id ? (
//                       <Loader2 size={14} className="animate-spin" />
//                     ) : o.status === "published" ? (
//                       <EyeOff size={14} />
//                     ) : (
//                       <Eye size={14} />
//                     )}
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => requestDelete(o)}
//                     title="Delete"
//                     className="text-destructive hover:text-destructive"
//                   >
//                     <Trash2 size={14} />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete opportunity?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will remove <strong>{deleteTarget?.jobTitle}</strong>. This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={(e) => {
//                 e.preventDefault();
//                 confirmDelete();
//               }}
//               disabled={deleting}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
// <Dialog open={!!viewApplicantsFor} onOpenChange={(open) => !open && setViewApplicantsFor(null)}>
//   <DialogContent className="max-w-2xl">
//     <DialogHeader>
//       <DialogTitle>Applicants — {viewApplicantsFor?.jobTitle}</DialogTitle>
//       <DialogDescription>{applicants.length} application(s) received</DialogDescription>
//     </DialogHeader>

//     <div className="max-h-96 space-y-3 overflow-y-auto">
//       {loadingApplicants ? (
//         <div className="flex items-center justify-center py-8 text-muted-foreground">
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
//         </div>
//       ) : applicants.length === 0 ? (
//         <p className="py-8 text-center text-sm text-muted-foreground">No applications yet.</p>
//       ) : (
//         applicants.map((a) => (
//           <div key={a._id} className="rounded-lg border border-border p-3">
//             <div className="flex items-center justify-between">
//               <p className="text-sm font-medium">{a.fullName}</p>
//               <Badge fontVariant="secondary" className="capitalize">{a.status.replace("_", " ")}</Badge>
//             </div>
//             <p className="text-xs text-muted-foreground">{a.email} {a.phone ? `· ${a.phone}` : ""}</p>
//             {a.coverLetter && <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{a.coverLetter}</p>}
//             {a.resume?.url && (
//               <a href={a.resume.url} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-xs text-[#0037FF] underline">
//                 View Resume
//               </a>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   </DialogContent>
// </Dialog>
      
//     </AdminLayout>
//   );
// };

// export default Opportunities;



import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Briefcase, MapPin, Loader2, Trash2, Pencil, Eye, EyeOff, Users } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import CreateJobWizard from "./create-job/CreateJobWizard";
import { opportunitiesApi } from "@/integrations/client";

interface Opportunity {
  _id: string;
  jobTitle: string;
  companyEntity?: string;
  employmentType?: string;
  primaryLocation?: string;
  status: "draft" | "published";
  createdAt?: string;
  applicationCount?: number;
}

const unwrap = (res: any) => (res?.data !== undefined && res?.success === undefined ? res.data : res);

const Opportunities = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = unwrap(await opportunitiesApi.getAll({ limit: 100 }));
      if (!res?.success) throw new Error(res?.message || "Failed to load opportunities");
      setOpportunities(res.data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load opportunities");
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleSaved = () => {
    setView("list");
    setEditingId(null);
    fetchOpportunities();
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView("edit");
  };

  const requestDelete = (o: Opportunity) => setDeleteTarget(o);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = unwrap(await opportunitiesApi.remove(deleteTarget._id));
      if (!res?.success) throw new Error(res?.message || "Failed to delete opportunity");
      toast({ title: "Opportunity deleted", description: `${deleteTarget.jobTitle} has been removed.` });
      setDeleteTarget(null);
      fetchOpportunities();
    } catch (err: any) {
      toast({ title: "Failed to delete", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (o: Opportunity) => {
    const nextStatus = o.status === "published" ? "draft" : "published";
    setTogglingId(o._id);
    try {
      const res = unwrap(await opportunitiesApi.updateStatus(o._id, nextStatus));
      if (!res?.success) throw new Error(res?.message || "Failed to update status");
      toast({
        title: nextStatus === "published" ? "Opportunity published" : "Moved to draft",
        description: o.jobTitle,
      });
      fetchOpportunities();
    } catch (err: any) {
      toast({ title: "Failed to update status", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  if (view === "create") {
    return <CreateJobWizard onExit={() => setView("list")} onSaved={handleSaved} />;
  }
  if (view === "edit" && editingId) {
    return (
      <CreateJobWizard
        opportunityId={editingId}
        onExit={() => {
          setView("list");
          setEditingId(null);
        }}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <AdminLayout
      title="Opportunities"
      subtitle="Open roles and internships from hiring partners."
      actions={
        <Button size="sm" className="text-white" onClick={() => setView("create")}>
          <Plus size={14} /> Post Role
        </Button>
      }
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading opportunities...
        </div>
      ) : error ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchOpportunities}>
            Retry
          </Button>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card text-center text-muted-foreground">
          <Briefcase size={24} />
          <p className="text-sm">No opportunities posted yet.</p>
          <Button size="sm" onClick={() => setView("create")}>
            <Plus size={14} /> Post your first role
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {opportunities.map((o) => (
            <div key={o._id} className="rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{o.jobTitle}</h3>
                  <p className="text-xs text-muted-foreground">{o.companyEntity || "—"}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    o.status === "published" ? "bg-[#0037FF]/10 text-[#0037FF]" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {o.status === "published" ? o.employmentType || "Published" : "Draft"}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {o.primaryLocation || "—"}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[11px] text-muted-foreground">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}
                </span>
                {/* <button
                  onClick={() => navigate(`/admin/opportunities/${o._id}/applicants`)}
                  className="rounded-full bg-[#0037FF]/10 px-2 py-0.5 text-[11px] font-medium text-[#0037FF] hover:bg-[#0037FF]/20"
                >
                  {o.applicationCount ?? 0} Applicant{(o.applicationCount ?? 0) === 1 ? "" : "s"}
                </button> */}
                <button
  onClick={() => navigate(`/admin/opportunities/${o._id}/applicants`)}
  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
    (o.applicationCount ?? 0) > 0
      ? "border-[#0037FF]/20 bg-[#0037FF]/5 text-[#0037FF] hover:border-[#0037FF]/40 hover:bg-[#0037FF]/10"
      : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"
  }`}
>
  <Users size={12} />
  {o.applicationCount ?? 0} Applicant{(o.applicationCount ?? 0) === 1 ? "" : "s"}
</button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(o._id)} title="Edit">
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleStatus(o)}
                    disabled={togglingId === o._id}
                    title={o.status === "published" ? "Move to draft" : "Publish"}
                  >
                    {togglingId === o._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : o.status === "published" ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => requestDelete(o)}
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete opportunity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{deleteTarget?.jobTitle}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Opportunities;
