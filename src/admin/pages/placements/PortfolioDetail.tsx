
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   ArrowLeft,
//   Pencil,
//   Github,
//   ExternalLink,
//   Figma,
//   Video,
//   FolderOpen,
//   Star,
//   CheckCircle2,
//   XCircle,
//   Rocket,
//   Undo2,
//   Trash2,
//   Loader2,
// } from "lucide-react";
// import AdminLayout from "../../components/AdminLayout"; 
// import { Button } from "@/components/ui/button";
// import { Portfolio, adminPortfolioApi } from "@/integrations/client";

// const LINKS: { key: keyof Portfolio; label: string; icon: typeof Github }[] = [
//   { key: "githubUrl", label: "GitHub", icon: Github },
//   { key: "liveUrl", label: "Live Site", icon: ExternalLink },
//   { key: "figmaUrl", label: "Figma", icon: Figma },
//   { key: "behanceUrl", label: "Behance", icon: ExternalLink },
//   { key: "videoUrl", label: "Video", icon: Video },
//   { key: "driveUrl", label: "Drive", icon: ExternalLink },
// ];

// type ModalKind = "reject" | null;

// const AdminPortfolioDetail = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);

//   const [modal, setModal] = useState<ModalKind>(null);
//   const [remark, setRemark] = useState("");

//   const load = async () => {
//     if (!id) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await adminPortfolioApi.getById(id);
//       setPortfolio(res.data);
//     } catch (err: any) {
//       setError(err?.message || "Could not load this project.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const runAction = async (
//     key: string,
//     fn: () => Promise<{ success: boolean; message?: string; data: Portfolio }>,
//   ) => {
//     setActionLoading(key);
//     try {
//       const res = await fn();
//       setPortfolio(res.data);
//     } catch (err: any) {
//       alert(err?.message || "Action failed. Please try again.");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleApprove = () => {
//     if (!id) return;
//     runAction("approve", () => adminPortfolioApi.approve(id));
//   };

//   const handlePublish = () => {
//     if (!id) return;
//     runAction("publish", () => adminPortfolioApi.publish(id));
//   };

//   const handleUnpublish = () => {
//     if (!id) return;
//     runAction("unpublish", () => adminPortfolioApi.unpublish(id));
//   };

//   const handleFeature = () => {
//     if (!id) return;
//     runAction("feature", () => adminPortfolioApi.toggleFeatured(id));
//   };

//   const handleDelete = async () => {
//     if (!id) return;
//     if (!window.confirm("Permanently delete this project? This can't be undone.")) return;
//     setActionLoading("delete");
//     try {
//       await adminPortfolioApi.remove(id);
//       navigate("/admin/portfolio");
//     } catch (err: any) {
//       alert(err?.message || "Could not delete this project.");
//       setActionLoading(null);
//     }
//   };

//   const handleEdit = () => {
//     if (!id) return;
//     navigate(`/admin/portfolio/${id}/edit`);
//   };

//   const openModal = (kind: ModalKind) => {
//     setRemark("");
//     setModal(kind);
//   };

//   const submitModal = async () => {
//     if (!id || !modal) return;
//     if (!remark.trim()) {
//       alert("Please add a note explaining why.");
//       return;
//     }
//     setActionLoading(modal);
//     try {
//       const res = await adminPortfolioApi.reject(id, remark.trim());
//       setPortfolio(res.data);
//       setModal(null);
//     } catch (err: any) {
//       alert(err?.message || "Action failed. Please try again.");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   if (loading) {
//     return (
//       <AdminLayout title="Portfolio Review">
//         <div className="flex h-64 items-center justify-center">
//           <Loader2 className="animate-spin text-[#0037FF]" size={28} />
//         </div>
//       </AdminLayout>
//     );
//   }

//   if (error || !portfolio) {
//     return (
//       <AdminLayout title="Portfolio Review">
//         <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
//           {error || "Project not found."}
//         </div>
//       </AdminLayout>
//     );
//   }

//   const p = portfolio;
//   // const studentName = typeof p.student === "object" ? p.student.fullName : "—";
//   // const studentEmail = typeof p.student === "object" ? p.student.email : "";

//   const student = typeof p.student === "object" && p.student ? p.student : null;
//   const studentName = p.externalStudent
//     ? p.studentName || "—"
//     : student?.fullName || "—";
//   const studentEmail = p.externalStudent
//     ? p.studentEmail || ""
//     : student?.email || "";

//   return (
//     <AdminLayout
//       title="Portfolio Review"
//       subtitle={p.title}
//       actions={
//         <div className="flex gap-2">
//           <Button variant="outline" className="gap-2" onClick={handleEdit}>
//             <Pencil size={16} />
//             Edit Details
//           </Button>
//           <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/portfolio")}>
//             <ArrowLeft size={16} />
//             Back to List
//           </Button>
//         </div>
//       }
//     >
//       <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//         {/* Left: details */}
//         <div className="space-y-6 lg:col-span-2">
//           <div className="overflow-hidden rounded-xl border border-border">
//             <div className="aspect-video w-full bg-secondary">
//               {p.thumbnail?.url ? (
//                 <img src={p.thumbnail.url} alt={p.title} className="h-full w-full object-cover" />
//               ) : (
//                 <div className="flex h-full items-center justify-center text-muted-foreground">
//                   <FolderOpen size={32} />
//                 </div>
//               )}
//             </div>
//             <div className="p-5">
//               <div className="flex items-start justify-between gap-3">
//                 <div>
//                   <h2 className="text-lg font-semibold text-foreground">{p.title}</h2>
//                   <p className="text-xs text-muted-foreground">
//                     {p.courseTitle} · {p.category}
//                   </p>
//                 </div>
//                 {p.featured && (
//                   <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
//                     <Star size={12} fill="currentColor" />
//                     Featured
//                   </span>
//                 )}
//               </div>
//               <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
//                 {p.description}
//               </p>

//               <div className="mt-4 flex flex-wrap gap-1.5">
//                 {p.technologies.map((t) => (
//                   <span key={t} className="rounded-full bg-[#0037FF]/10 px-2.5 py-1 text-xs text-[#0037FF]">
//                     {t}
//                   </span>
//                 ))}
//               </div>

//               {p.tags.length > 0 && (
//                 <div className="mt-2 flex flex-wrap gap-1.5">
//                   {p.tags.map((t) => (
//                     <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
//                       #{t}
//                     </span>
//                   ))}
//                 </div>
//               )}

//               <div className="mt-4 flex flex-wrap gap-3">
//                 {LINKS.map(({ key, label, icon: Icon }) => {
//                   const url = p[key] as string;
//                   if (!url) return null;
//                   return (
//                     <a
//                       key={key}
//                       href={url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
//                     >
//                       <Icon size={13} />
//                       {label}
//                     </a>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {p.gallery.length > 0 && (
//             <div className="rounded-xl border border-border p-5">
//               <h3 className="mb-3 text-sm font-semibold text-foreground">Gallery</h3>
//               <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//                 {p.gallery.map((img) => (
//                   <a
//                     key={img.publicId}
//                     href={img.url}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="aspect-square overflow-hidden rounded-lg border border-border"
//                   >
//                     <img src={img.url} alt="" className="h-full w-full object-cover" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           )}

//           {p.adminRemarks && (
//             <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
//               <span className="font-semibold">Latest admin note: </span>
//               {p.adminRemarks}
//             </div>
//           )}
//         </div>

//         {/* Right: student info + status + actions */}
//         <div className="space-y-6">
//           <div className="rounded-xl border border-border p-5">
//             <h3 className="mb-3 text-sm font-semibold text-foreground">Student</h3>
//             <p className="text-sm text-foreground">{studentName}</p>
//             <p className="text-xs text-muted-foreground">{studentEmail}</p>
//           </div>

//           <div className="rounded-xl border border-border p-5">
//             <h3 className="mb-3 text-sm font-semibold text-foreground">Status</h3>
//             <p className="text-sm capitalize text-foreground">{p.status.replace("_", " ")}</p>
//             {p.approvedAt && (
//               <p className="mt-1 text-xs text-muted-foreground">
//                 Approved {new Date(p.approvedAt).toLocaleDateString()}
//               </p>
//             )}
//             {p.publishedAt && (
//               <p className="text-xs text-muted-foreground">
//                 Published {new Date(p.publishedAt).toLocaleDateString()}
//               </p>
//             )}
//             <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
//               <span>{p.views} views</span>
//               <span>{p.likes} likes</span>
//             </div>
//           </div>

//           <div className="rounded-xl border border-border p-5">
//             <h3 className="mb-3 text-sm font-semibold text-foreground">Actions</h3>
//             <div className="flex flex-col gap-2">
//               <Button
//                 variant="outline"
//                 onClick={handleEdit}
//                 className="justify-start gap-2"
//               >
//                 <Pencil size={15} />
//                 Edit Details
//               </Button>

//               {p.status === "pending" && (
//                 <>
//                   <Button
//                     disabled={!!actionLoading}
//                     onClick={handleApprove}
//                     className="justify-start gap-2 bg-emerald-600 hover:bg-emerald-700"
//                   >
//                     {actionLoading === "approve" ? (
//                       <Loader2 className="animate-spin" size={15} />
//                     ) : (
//                       <CheckCircle2 size={15} />
//                     )}
//                     Approve
//                   </Button>
//                   <Button
//                     disabled={!!actionLoading}
//                     onClick={() => openModal("reject")}
//                     variant="outline"
//                     className="justify-start gap-2 text-red-600"
//                   >
//                     <XCircle size={15} />
//                     Reject
//                   </Button>
//                 </>
//               )}

//               {p.status === "approved" && (
//                 <Button
//                   disabled={!!actionLoading}
//                   onClick={handlePublish}
//                   className="justify-start gap-2 bg-[#0037FF] hover:bg-[#0037FF]/90"
//                 >
//                   {actionLoading === "publish" ? (
//                     <Loader2 className="animate-spin" size={15} />
//                   ) : (
//                     <Rocket size={15} />
//                   )}
//                   Publish
//                 </Button>
//               )}

//               {p.status === "published" && (
//                 <Button
//                   disabled={!!actionLoading}
//                   onClick={handleUnpublish}
//                   variant="outline"
//                   className="justify-start gap-2"
//                 >
//                   {actionLoading === "unpublish" ? (
//                     <Loader2 className="animate-spin" size={15} />
//                   ) : (
//                     <Undo2 size={15} />
//                   )}
//                   Unpublish
//                 </Button>
//               )}

//               {(p.status === "approved" || p.status === "published") && (
//                 <Button
//                   disabled={!!actionLoading}
//                   onClick={handleFeature}
//                   variant="outline"
//                   className="justify-start gap-2"
//                 >
//                   {actionLoading === "feature" ? (
//                     <Loader2 className="animate-spin" size={15} />
//                   ) : (
//                     <Star size={15} className={p.featured ? "fill-amber-500 text-amber-500" : ""} />
//                   )}
//                   {p.featured ? "Remove from Featured" : "Mark as Featured"}
//                 </Button>
//               )}

//               <Button
//                 disabled={!!actionLoading}
//                 onClick={handleDelete}
//                 variant="outline"
//                 className="justify-start gap-2 text-red-600 hover:bg-red-50"
//               >
//                 {actionLoading === "delete" ? (
//                   <Loader2 className="animate-spin" size={15} />
//                 ) : (
//                   <Trash2 size={15} />
//                 )}
//                 Delete Project
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Reject modal */}
//       {modal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//           <div className="w-full max-w-md rounded-xl bg-background p-5 shadow-xl">
//             <h3 className="text-sm font-semibold text-foreground">Reject Project</h3>
//             <p className="mt-1 text-xs text-muted-foreground">
//               This note is shown to the student — be specific about why it was rejected.
//             </p>
//             <textarea
//               autoFocus
//               value={remark}
//               onChange={(e) => setRemark(e.target.value)}
//               rows={4}
//               placeholder="e.g. Project links are broken and the description is incomplete."
//               className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#0037FF]"
//             />
//             <div className="mt-4 flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setModal(null)} disabled={!!actionLoading}>
//                 Cancel
//               </Button>
//               <Button
//                 onClick={submitModal}
//                 disabled={!!actionLoading}
//                 className="gap-2 bg-red-600 hover:bg-red-700"
//               >
//                 {actionLoading === modal && <Loader2 className="animate-spin" size={14} />}
//                 Reject
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AdminLayout>
//   );
// };

// export default AdminPortfolioDetail;



import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Github,
  ExternalLink,
  Figma,
  Video,
  FolderOpen,
  Star,
  CheckCircle2,
  XCircle,
  Rocket,
  Undo2,
  Trash2,
  Loader2,
  Upload,
  X,
  Save,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout"; 
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Portfolio, PortfolioImage, adminPortfolioApi } from "@/integrations/client";

const LINKS: { key: keyof Portfolio; label: string; icon: typeof Github }[] = [
  { key: "githubUrl", label: "GitHub", icon: Github },
  { key: "liveUrl", label: "Live Site", icon: ExternalLink },
  { key: "figmaUrl", label: "Figma", icon: Figma },
  { key: "behanceUrl", label: "Behance", icon: ExternalLink },
  { key: "videoUrl", label: "Video", icon: Video },
  { key: "driveUrl", label: "Drive", icon: ExternalLink },
];

type ModalKind = "reject" | null;

const AdminPortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalKind>(null);
  const [remark, setRemark] = useState("");

  // ── Student Photo & Review — inline editable section ──
  const [editingReview, setEditingReview] = useState(false);
  const [studentPhotoDraft, setStudentPhotoDraft] = useState<PortfolioImage | null>(null);
  const [studentReviewDraft, setStudentReviewDraft] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminPortfolioApi.getById(id);
      setPortfolio(res.data);
      setStudentPhotoDraft(res.data.studentPhoto || null);
      setStudentReviewDraft(res.data.studentReview || "");
    } catch (err: any) {
      setError(err?.message || "Could not load this project.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runAction = async (
    key: string,
    fn: () => Promise<{ success: boolean; message?: string; data: Portfolio }>,
  ) => {
    setActionLoading(key);
    try {
      const res = await fn();
      setPortfolio(res.data);
    } catch (err: any) {
      alert(err?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = () => {
    if (!id) return;
    runAction("approve", () => adminPortfolioApi.approve(id));
  };

  const handlePublish = () => {
    if (!id) return;
    runAction("publish", () => adminPortfolioApi.publish(id));
  };

  const handleUnpublish = () => {
    if (!id) return;
    runAction("unpublish", () => adminPortfolioApi.unpublish(id));
  };

  const handleFeature = () => {
    if (!id) return;
    runAction("feature", () => adminPortfolioApi.toggleFeatured(id));
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Permanently delete this project? This can't be undone.")) return;
    setActionLoading("delete");
    try {
      await adminPortfolioApi.remove(id);
      navigate("/admin/portfolio");
    } catch (err: any) {
      alert(err?.message || "Could not delete this project.");
      setActionLoading(null);
    }
  };

  const handleEdit = () => {
    if (!id) return;
    navigate(`/admin/portfolio/${id}/edit`);
  };

  const openModal = (kind: ModalKind) => {
    setRemark("");
    setModal(kind);
  };

  const submitModal = async () => {
    if (!id || !modal) return;
    if (!remark.trim()) {
      alert("Please add a note explaining why.");
      return;
    }
    setActionLoading(modal);
    try {
      const res = await adminPortfolioApi.reject(id, remark.trim());
      setPortfolio(res.data);
      setModal(null);
    } catch (err: any) {
      alert(err?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Student Photo & Review handlers ──
  const handleStartEditReview = () => {
    setStudentPhotoDraft(portfolio?.studentPhoto || null);
    setStudentReviewDraft(portfolio?.studentReview || "");
    setEditingReview(true);
  };

  const handleCancelEditReview = () => {
    setStudentPhotoDraft(portfolio?.studentPhoto || null);
    setStudentReviewDraft(portfolio?.studentReview || "");
    setEditingReview(false);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await adminPortfolioApi.uploadImage(file);
      setStudentPhotoDraft(res.data);
    } catch (err: any) {
      alert(err?.message || "Could not upload the photo.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemovePhotoDraft = () => setStudentPhotoDraft(null);

  const handleSaveReview = async () => {
    if (!id) return;
    setSavingReview(true);
    try {
      const res = await adminPortfolioApi.update(id, {
        studentPhoto: studentPhotoDraft,
        studentReview: studentReviewDraft.trim(),
      });
      setPortfolio(res.data);
      setEditingReview(false);
    } catch (err: any) {
      alert(err?.message || "Could not save changes.");
    } finally {
      setSavingReview(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Portfolio Review">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-[#0037FF]" size={28} />
        </div>
      </AdminLayout>
    );
  }

  if (error || !portfolio) {
    return (
      <AdminLayout title="Portfolio Review">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error || "Project not found."}
        </div>
      </AdminLayout>
    );
  }

  const p = portfolio;

  const student = typeof p.student === "object" && p.student ? p.student : null;
  const studentName = p.externalStudent
    ? p.studentName || "—"
    : student?.fullName || "—";
  const studentEmail = p.externalStudent
    ? p.studentEmail || ""
    : student?.email || "";

  return (
    <AdminLayout
      title="Portfolio Review"
      subtitle={p.title}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleEdit}>
            <Pencil size={16} />
            Edit Details
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/portfolio")}>
            <ArrowLeft size={16} />
            Back to List
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="aspect-video w-full bg-secondary">
              {p.thumbnail?.url ? (
                <img src={p.thumbnail.url} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <FolderOpen size={32} />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{p.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {p.courseTitle} · {p.category}
                  </p>
                </div>
                {p.featured && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                    <Star size={12} fill="currentColor" />
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                {p.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.technologies.map((t) => (
                  <span key={t} className="rounded-full bg-[#0037FF]/10 px-2.5 py-1 text-xs text-[#0037FF]">
                    {t}
                  </span>
                ))}
              </div>

              {p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                {LINKS.map(({ key, label, icon: Icon }) => {
                  const url = p[key] as string;
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
                    >
                      <Icon size={13} />
                      {label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {p.gallery.length > 0 && (
            <div className="rounded-xl border border-border p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Gallery</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {p.gallery.map((img) => (
                  <a
                    key={img.publicId}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square overflow-hidden rounded-lg border border-border"
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {p.adminRemarks && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
              <span className="font-semibold">Latest admin note: </span>
              {p.adminRemarks}
            </div>
          )}
        </div>

        {/* Right: student info + status + actions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Student</h3>
            <p className="text-sm text-foreground">{studentName}</p>
            <p className="text-xs text-muted-foreground">{studentEmail}</p>
          </div>

          {/* ── Student Photo & Review ── */}
          <div className="rounded-xl border border-border p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Student Photo & Review</h3>
              {!editingReview && (
                <button
                  type="button"
                  onClick={handleStartEditReview}
                  className="flex items-center gap-1 text-xs font-medium text-[#0037FF] hover:underline"
                >
                  <Pencil size={12} />
                  {p.studentPhoto || p.studentReview ? "Edit" : "Add"}
                </button>
              )}
            </div>

            {!editingReview ? (
              <>
                {p.studentPhoto?.url || p.studentReview ? (
                  <div className="flex items-start gap-3">
                    {p.studentPhoto?.url ? (
                      <img
                        src={p.studentPhoto.url}
                        alt={studentName}
                        className="h-12 w-12 shrink-0 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-xs text-muted-foreground">
                        No photo
                      </div>
                    )}
                    <p className="text-sm italic text-muted-foreground line-clamp-4">
                      {p.studentReview ? `"${p.studentReview}"` : "No review added yet."}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Not added yet. Shown on the public portfolio card's hover reveal panel.
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {studentPhotoDraft?.url ? (
                    <div className="relative">
                      <img
                        src={studentPhotoDraft.url}
                        alt="Student"
                        className="h-14 w-14 rounded-full object-cover border border-border"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhotoDraft}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-xs text-muted-foreground">
                      No photo
                    </div>
                  )}

                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary/60">
                      {uploadingPhoto ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                      {studentPhotoDraft ? "Replace" : "Upload"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoSelect}
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>

                <Textarea
                  value={studentReviewDraft}
                  onChange={(e) => setStudentReviewDraft(e.target.value)}
                  placeholder="e.g. deepScode Education helped me land my first design role…"
                  rows={4}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEditReview}
                    disabled={savingReview}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveReview}
                    disabled={savingReview || uploadingPhoto}
                    className="gap-1.5 bg-[#0037FF] hover:bg-[#0037FF]/90"
                  >
                    {savingReview ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Status</h3>
            <p className="text-sm capitalize text-foreground">{p.status.replace("_", " ")}</p>
            {p.approvedAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Approved {new Date(p.approvedAt).toLocaleDateString()}
              </p>
            )}
            {p.publishedAt && (
              <p className="text-xs text-muted-foreground">
                Published {new Date(p.publishedAt).toLocaleDateString()}
              </p>
            )}
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span>{p.views} views</span>
              <span>{p.likes} likes</span>
            </div>
          </div>

          <div className="rounded-xl border border-border p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Actions</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="justify-start gap-2"
              >
                <Pencil size={15} />
                Edit Details
              </Button>

              {p.status === "pending" && (
                <>
                  <Button
                    disabled={!!actionLoading}
                    onClick={handleApprove}
                    className="justify-start gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {actionLoading === "approve" ? (
                      <Loader2 className="animate-spin" size={15} />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    Approve
                  </Button>
                  <Button
                    disabled={!!actionLoading}
                    onClick={() => openModal("reject")}
                    variant="outline"
                    className="justify-start gap-2 text-red-600"
                  >
                    <XCircle size={15} />
                    Reject
                  </Button>
                </>
              )}

              {p.status === "approved" && (
                <Button
                  disabled={!!actionLoading}
                  onClick={handlePublish}
                  className="justify-start gap-2 bg-[#0037FF] hover:bg-[#0037FF]/90"
                >
                  {actionLoading === "publish" ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : (
                    <Rocket size={15} />
                  )}
                  Publish
                </Button>
              )}

              {p.status === "published" && (
                <Button
                  disabled={!!actionLoading}
                  onClick={handleUnpublish}
                  variant="outline"
                  className="justify-start gap-2"
                >
                  {actionLoading === "unpublish" ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : (
                    <Undo2 size={15} />
                  )}
                  Unpublish
                </Button>
              )}

              {(p.status === "approved" || p.status === "published") && (
                <Button
                  disabled={!!actionLoading}
                  onClick={handleFeature}
                  variant="outline"
                  className="justify-start gap-2"
                >
                  {actionLoading === "feature" ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : (
                    <Star size={15} className={p.featured ? "fill-amber-500 text-amber-500" : ""} />
                  )}
                  {p.featured ? "Remove from Featured" : "Mark as Featured"}
                </Button>
              )}

              <Button
                disabled={!!actionLoading}
                onClick={handleDelete}
                variant="outline"
                className="justify-start gap-2 text-red-600 hover:bg-red-50"
              >
                {actionLoading === "delete" ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <Trash2 size={15} />
                )}
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-foreground">Reject Project</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              This note is shown to the student — be specific about why it was rejected.
            </p>
            <textarea
              autoFocus
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={4}
              placeholder="e.g. Project links are broken and the description is incomplete."
              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#0037FF]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)} disabled={!!actionLoading}>
                Cancel
              </Button>
              <Button
                onClick={submitModal}
                disabled={!!actionLoading}
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                {actionLoading === modal && <Loader2 className="animate-spin" size={14} />}
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPortfolioDetail;
