// // src/pages/student/pages/PortfolioForm.tsx
// //
// // Create + Edit Portfolio form (same component handles both — checks
// // the :id route param). Route it as:
// //   /student/portfolio/new       -> create
// //   /student/portfolio/:id/edit  -> edit
// //
// // Image uploads go straight to Cloudinary (see src/lib/cloudinaryUpload.ts),
// // then we send { url, publicId } to our own API — no file upload route
// // needed on the backend, matching how Testimonials/CTA-PDF media works.

// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { ArrowLeft, Loader2, Plus, Trash2, UploadCloud, X } from "lucide-react";
// import StudentLayout from "../components/StudentLayout"; // adjust path if needed
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { PortfolioImage, StudentPortfolioPayload, portfolioApi } from "@/integrations/client";
// import { uploadManyToCloudinary, uploadToCloudinary } from "@/lib/portfolioUpload";

// const LINK_FIELDS: { key: keyof LinkState; label: string; placeholder: string }[] = [
//   { key: "githubUrl", label: "GitHub", placeholder: "https://github.com/you/project" },
//   { key: "liveUrl", label: "Live URL", placeholder: "https://your-project.com" },
//   { key: "figmaUrl", label: "Figma", placeholder: "https://figma.com/file/..." },
//   { key: "behanceUrl", label: "Behance", placeholder: "https://behance.net/gallery/..." },
//   { key: "videoUrl", label: "Video", placeholder: "https://youtube.com/watch?v=..." },
//   { key: "driveUrl", label: "Google Drive", placeholder: "https://drive.google.com/..." },
// ];

// interface LinkState {
//   githubUrl: string;
//   liveUrl: string;
//   figmaUrl: string;
//   behanceUrl: string;
//   videoUrl: string;
//   driveUrl: string;
// }

// // const LINK_FIELDS: { key: keyof LinkState; label: string; placeholder: string }[] = [
// //   { key: "githubUrl", label: "GitHub", placeholder: "https://github.com/you/project" },
// //   { key: "liveUrl", label: "Live URL", placeholder: "https://your-project.com" },
// // ];

// // interface LinkState {
// //   githubUrl: string;
// //   liveUrl: string;
// // }

// const MIN_DESC = 50;

// const PortfolioForm = () => {
//   const { id } = useParams<{ id: string }>();
//   const isEdit = Boolean(id);
//   const navigate = useNavigate();

//   const [loadingExisting, setLoadingExisting] = useState(isEdit);
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [formError, setFormError] = useState<string | null>(null);

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [technologies, setTechnologies] = useState<string[]>([]);
//   const [techInput, setTechInput] = useState("");
//   const [tags, setTags] = useState<string[]>([]);
//   const [tagInput, setTagInput] = useState("");
//   const [links, setLinks] = useState<LinkState>({
//     githubUrl: "",
//     liveUrl: "",
//     figmaUrl: "",
//     behanceUrl: "",
//     videoUrl: "",
//     driveUrl: "",
//   });

//   const [thumbnail, setThumbnail] = useState<PortfolioImage | null>(null);
//   const [thumbUploading, setThumbUploading] = useState(false);
//   const [thumbProgress, setThumbProgress] = useState(0);

//   const [gallery, setGallery] = useState<PortfolioImage[]>([]);
//   const [galleryUploading, setGalleryUploading] = useState(false);
//   const [galleryProgress, setGalleryProgress] = useState(0);

//   const thumbInputRef = useRef<HTMLInputElement>(null);
//   const galleryInputRef = useRef<HTMLInputElement>(null);

//   // Load existing portfolio when editing.
//   // (The backend doesn't expose a "get one" student route, so we pull
//   // from the list endpoint and find it — cheap since a student only
//   // has a handful of projects.)
//   useEffect(() => {
//     if (!isEdit || !id) return;
//     (async () => {
//       try {
//         const res = await portfolioApi.getMine();
//         const existing = res.data.find((p) => p._id === id);
//         if (!existing) {
//           setFormError("Project not found.");
//           return;
//         }
//         setTitle(existing.title);
//         setDescription(existing.description);
//         setTechnologies(existing.technologies || []);
//         setTags(existing.tags || []);
//         setLinks({
//           githubUrl: existing.githubUrl || "",
//           liveUrl: existing.liveUrl || "",
//           figmaUrl: existing.figmaUrl || "",
//           behanceUrl: existing.behanceUrl || "",
//           videoUrl: existing.videoUrl || "",
//           driveUrl: existing.driveUrl || "",
//         });
//         setThumbnail(existing.thumbnail || null);
//         setGallery(existing.gallery || []);
//       } catch (err: any) {
//         setFormError(err?.message || "Could not load this project.");
//       } finally {
//         setLoadingExisting(false);
//       }
//     })();
//   }, [isEdit, id]);

//   const addTech = () => {
//     const v = techInput.trim();
//     if (v && !technologies.includes(v)) setTechnologies((prev) => [...prev, v]);
//     setTechInput("");
//   };
//   const addTag = () => {
//     const v = tagInput.trim();
//     if (v && !tags.includes(v)) setTags((prev) => [...prev, v]);
//     setTagInput("");
//   };

//   const handleThumbnailSelect = async (file: File | undefined) => {
//     if (!file) return;
//     setThumbUploading(true);
//     setThumbProgress(0);
//     try {
//       const result = await uploadToCloudinary(file, setThumbProgress);
//       setThumbnail(result);
//     } catch (err: any) {
//       alert(err?.message || "Thumbnail upload failed.");
//     } finally {
//       setThumbUploading(false);
//     }
//   };

//   const handleGallerySelect = async (files: FileList | null) => {
//     if (!files || files.length === 0) return;
//     setGalleryUploading(true);
//     setGalleryProgress(0);
//     try {
//       const results = await uploadManyToCloudinary(Array.from(files), setGalleryProgress);
//       setGallery((prev) => [...prev, ...results]);
//     } catch (err: any) {
//       alert(err?.message || "Gallery upload failed.");
//     } finally {
//       setGalleryUploading(false);
//     }
//   };

//   // const validate = () => {
//   //   const next: Record<string, string> = {};
//   //   if (title.trim().length < 5 || title.trim().length > 100) {
//   //     next.title = "Title must be between 5 and 100 characters.";
//   //   }
//   //   if (description.trim().length < MIN_DESC) {
//   //     next.description = `Description must be at least ${MIN_DESC} characters (${description.trim().length}/${MIN_DESC}).`;
//   //   }
//   //   if (technologies.length === 0) {
//   //     next.technologies = "Add at least one technology.";
//   //   }
//   //   const hasLink = Object.values(links).some((v) => v.trim() !== "");
//   //   if (!hasLink) {
//   //     next.links = "Add at least one project link (GitHub, Live URL, Figma, etc).";
//   //   }
//   //   if (!thumbnail) {
//   //     next.thumbnail = "A thumbnail image is required.";
//   //   }
//   //   setErrors(next);
//   //   return Object.keys(next).length === 0;
//   // };

// const validate = () => {
//   const next: Record<string, string> = {};
//   if (title.trim().length < 5 || title.trim().length > 100) {
//     next.title = "Title must be between 5 and 100 characters.";
//   }
//   if (description.trim().length < MIN_DESC) {
//     next.description = `Description must be at least ${MIN_DESC} characters (${description.trim().length}/${MIN_DESC}).`;
//   }
//   const hasLink = links.githubUrl.trim() !== "" || links.liveUrl.trim() !== "";
//   if (!hasLink) {
//     next.links = "Add at least a GitHub or Live URL.";
//   }
//   if (!thumbnail) {
//     next.thumbnail = "A thumbnail image is required.";
//   }
//   setErrors(next);
//   return Object.keys(next).length === 0;
// };

//   const handleSave = async (submitAfter: boolean) => {
//     setFormError(null);
//     if (!validate()) return;

//     setSaving(true);
//     try {
//       // const payload = {
//       //   title: title.trim(),
//       //   description: description.trim(),
//       //   technologies,
//       //   tags,
//       //   thumbnail,
//       //   gallery,
//       //   ...links,
//       // };

//       const payload: StudentPortfolioPayload = {
//   title: title.trim(),
//   description: description.trim(),
//   thumbnail,
//   gallery,
//   ...links,
// };

//       const res = isEdit && id ? await portfolioApi.update(id, payload) : await portfolioApi.create(payload);
//       const saved = res.data;

//       if (submitAfter) {
//         await portfolioApi.submit(saved._id);
//       }

//       navigate("/student/portfolio");
//     } catch (err: any) {
//       setFormError(err?.message || "Could not save this project.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loadingExisting) {
//     return (
//       <StudentLayout title={isEdit ? "Edit Project" : "New Project"}>
//         <div className="flex h-48 items-center justify-center">
//           <Loader2 className="animate-spin text-[#0037FF]" size={28} />
//         </div>
//       </StudentLayout>
//     );
//   }

//   return (
//     <StudentLayout
//       title={isEdit ? "Edit Project" : "New Project"}
//       subtitle="Fill in the details below. You can save as draft and submit for review later."
//       actions={
//         <Button
//           variant="outline"
//           className="gap-2"
//           onClick={() => navigate("/student/portfolio")}
//         >
//           <ArrowLeft size={16} />
//           Back to Portfolio
//         </Button>
//       }
//     >
//       <div className="mx-auto max-w-3xl space-y-6">
//         {formError && (
//           <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//             {formError}
//           </div>
//         )}

//         {/* Title */}
//         <div>
//           <label className="mb-1.5 block text-sm font-medium text-foreground">
//             Project Title
//           </label>
//           <Input
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="e.g. E-commerce Dashboard Redesign"
//           />
//           {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
//         </div>

//         {/* Description */}
//         <div>
//           <label className="mb-1.5 block text-sm font-medium text-foreground">
//             Description
//           </label>
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             rows={5}
//             placeholder="What problem does this project solve? What was your role?"
//             className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#0037FF]"
//           />
//           <div className="mt-1 flex items-center justify-between">
//             {errors.description ? (
//               <p className="text-xs text-red-600">{errors.description}</p>
//             ) : (
//               <span />
//             )}
//             <span className="text-xs text-muted-foreground">
//               {description.trim().length}/{MIN_DESC} min
//             </span>
//           </div>
//         </div>

//         {/* Thumbnail */}
//         <div>
//           <label className="mb-1.5 block text-sm font-medium text-foreground">
//             Thumbnail Image
//           </label>
//           <div className="flex items-center gap-4">
//             <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-secondary/50">
//               {thumbnail?.url ? (
//                 <img src={thumbnail.url} alt="thumbnail" className="h-full w-full object-cover" />
//               ) : thumbUploading ? (
//                 <Loader2 className="animate-spin text-muted-foreground" size={20} />
//               ) : (
//                 <UploadCloud className="text-muted-foreground" size={20} />
//               )}
//             </div>
//             <div className="flex flex-col gap-2">
//               <input
//                 ref={thumbInputRef}
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={(e) => handleThumbnailSelect(e.target.files?.[0])}
//               />
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={() => thumbInputRef.current?.click()}
//                 disabled={thumbUploading}
//               >
//                 {thumbUploading ? `Uploading ${thumbProgress}%` : thumbnail ? "Replace" : "Upload"}
//               </Button>
//               {thumbnail && (
//                 <button
//                   type="button"
//                   onClick={() => setThumbnail(null)}
//                   className="text-left text-xs text-red-600 hover:underline"
//                 >
//                   Remove
//                 </button>
//               )}
//             </div>
//           </div>
//           {errors.thumbnail && <p className="mt-1 text-xs text-red-600">{errors.thumbnail}</p>}
//         </div>

//         {/* Gallery */}
//         <div>
//           <label className="mb-1.5 block text-sm font-medium text-foreground">
//             Gallery (optional)
//           </label>
//           <div className="flex flex-wrap gap-3">
//             {gallery.map((img, i) => (
//               <div key={img.publicId} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
//                 <img src={img.url} alt="" className="h-full w-full object-cover" />
//                 <button
//                   type="button"
//                   onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
//                   className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
//                 >
//                   <X size={12} />
//                 </button>
//               </div>
//             ))}
//             <button
//               type="button"
//               onClick={() => galleryInputRef.current?.click()}
//               disabled={galleryUploading}
//               className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-secondary/50"
//             >
//               {galleryUploading ? (
//                 <>
//                   <Loader2 className="animate-spin" size={16} />
//                   <span className="text-[10px]">{galleryProgress}%</span>
//                 </>
//               ) : (
//                 <>
//                   <Plus size={16} />
//                   <span className="text-[10px]">Add</span>
//                 </>
//               )}
//             </button>
//             <input
//               ref={galleryInputRef}
//               type="file"
//               accept="image/*"
//               multiple
//               className="hidden"
//               onChange={(e) => handleGallerySelect(e.target.files)}
//             />
//           </div>
//         </div>

//         {/* Technologies */}
//         <div>
//           <label className="mb-1.5 block text-sm font-medium text-foreground">
//             Technologies
//           </label>
//           <div className="flex gap-2">
//             <Input
//               value={techInput}
//               onChange={(e) => setTechInput(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   addTech();
//                 }
//               }}
//               placeholder="e.g. React — press Enter to add"
//             />
//             <Button type="button" variant="outline" onClick={addTech}>
//               Add
//             </Button>
//           </div>
//           <div className="mt-2 flex flex-wrap gap-1.5">
//             {technologies.map((t) => (
//               <span
//                 key={t}
//                 className="flex items-center gap-1 rounded-full bg-[#0037FF]/10 px-2.5 py-1 text-xs text-[#0037FF]"
//               >
//                 {t}
//                 <button
//                   type="button"
//                   onClick={() => setTechnologies((prev) => prev.filter((x) => x !== t))}
//                 >
//                   <X size={11} />
//                 </button>
//               </span>
//             ))}
//           </div>
//           {errors.technologies && (
//             <p className="mt-1 text-xs text-red-600">{errors.technologies}</p>
//           )}
//         </div>

//         {/* Tags */}
//         <div>
//           <label className="mb-1.5 block text-sm font-medium text-foreground">
//             Tags (optional)
//           </label>
//           <div className="flex gap-2">
//             <Input
//               value={tagInput}
//               onChange={(e) => setTagInput(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   addTag();
//                 }
//               }}
//               placeholder="e.g. hackathon-winner — press Enter to add"
//             />
//             <Button type="button" variant="outline" onClick={addTag}>
//               Add
//             </Button>
//           </div>
//           <div className="mt-2 flex flex-wrap gap-1.5">
//             {tags.map((t) => (
//               <span
//                 key={t}
//                 className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
//               >
//                 {t}
//                 <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
//                   <X size={11} />
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Links */}
//         <div>
//           <label className="mb-1.5 block text-sm font-medium text-foreground">
//             Project Links
//           </label>
//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//             {LINK_FIELDS.map((field) => (
//               <Input
//                 key={field.key}
//                 value={links[field.key]}
//                 onChange={(e) => setLinks((prev) => ({ ...prev, [field.key]: e.target.value }))}
//                 placeholder={`${field.label} — ${field.placeholder}`}
//               />
//             ))}
//           </div>
//           {errors.links && <p className="mt-1 text-xs text-red-600">{errors.links}</p>}
//         </div>

//         {/* Actions */}
//         <div className="flex items-center gap-3 border-t border-border pt-5">
//           <Button
//             variant="outline"
//             disabled={saving}
//             onClick={() => handleSave(false)}
//             className="gap-2"
//           >
//             {saving && <Loader2 className="animate-spin" size={14} />}
//             Save as Draft
//           </Button>
//           <Button
//             disabled={saving}
//             onClick={() => handleSave(true)}
//             className="gap-2 text-white bg-[#0037FF] hover:bg-[#0037FF]/90"
//           >
//             {saving && <Loader2 className="animate-spin" size={14} />}
//             Save &amp; Submit for Review
//           </Button>
//         </div>
//       </div>
//     </StudentLayout>
//   );
// };

// export default PortfolioForm;



import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, UploadCloud, X } from "lucide-react";
import StudentLayout from "../components/StudentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PortfolioImage, StudentPortfolioPayload, portfolioApi } from "@/integrations/client";
import { uploadManyToCloudinary, uploadToCloudinary } from "@/lib/portfolioUpload";

const LINK_FIELDS: { key: keyof LinkState; label: string; placeholder: string }[] = [
  { key: "githubUrl", label: "GitHub", placeholder: "https://github.com/you/project" },
  { key: "liveUrl", label: "Live URL", placeholder: "https://your-project.com" },
];

interface LinkState {
  githubUrl: string;
  liveUrl: string;
}

const MIN_DESC = 50;

const PortfolioForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState<LinkState>({ githubUrl: "", liveUrl: "" });

  // Optional — student can suggest these, admin may fully override later.
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [thumbnail, setThumbnail] = useState<PortfolioImage | null>(null);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);

  const [gallery, setGallery] = useState<PortfolioImage[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState(0);

  const thumbInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const res = await portfolioApi.getMine();
        const existing = res.data.find((p) => p._id === id);
        if (!existing) {
          setFormError("Project not found.");
          return;
        }
        setTitle(existing.title);
        setDescription(existing.description);
        setLinks({
          githubUrl: existing.githubUrl || "",
          liveUrl: existing.liveUrl || "",
        });
        setTechnologies(existing.technologies || []);
        setTags(existing.tags || []);
        setThumbnail(existing.thumbnail || null);
        setGallery(existing.gallery || []);
      } catch (err: any) {
        setFormError(err?.message || "Could not load this project.");
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, [isEdit, id]);

  const addTech = () => {
    const v = techInput.trim();
    if (v && !technologies.includes(v)) setTechnologies((prev) => [...prev, v]);
    setTechInput("");
  };
  const addTag = () => {
    const v = tagInput.trim();
    if (v && !tags.includes(v)) setTags((prev) => [...prev, v]);
    setTagInput("");
  };

  const handleThumbnailSelect = async (file: File | undefined) => {
    if (!file) return;
    setThumbUploading(true);
    setThumbProgress(0);
    try {
      const result = await uploadToCloudinary(file, setThumbProgress);
      setThumbnail(result);
    } catch (err: any) {
      alert(err?.message || "Thumbnail upload failed.");
    } finally {
      setThumbUploading(false);
    }
  };

  const handleGallerySelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGalleryUploading(true);
    setGalleryProgress(0);
    try {
      const results = await uploadManyToCloudinary(Array.from(files), setGalleryProgress);
      setGallery((prev) => [...prev, ...results]);
    } catch (err: any) {
      alert(err?.message || "Gallery upload failed.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (title.trim().length < 5 || title.trim().length > 100) {
      next.title = "Title must be between 5 and 100 characters.";
    }
    if (description.trim().length < MIN_DESC) {
      next.description = `Description must be at least ${MIN_DESC} characters (${description.trim().length}/${MIN_DESC}).`;
    }
    const hasLink = links.githubUrl.trim() !== "" || links.liveUrl.trim() !== "";
    if (!hasLink) {
      next.links = "Add at least a GitHub or Live URL.";
    }
    if (!thumbnail) {
      next.thumbnail = "A thumbnail image is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (submitAfter: boolean) => {
    setFormError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      // Auto-commit any pending typed-but-not-added tech/tag before saving.
      const finalTechnologies = techInput.trim()
        ? [...technologies, techInput.trim()].filter((v, i, arr) => arr.indexOf(v) === i)
        : technologies;
      const finalTags = tagInput.trim()
        ? [...tags, tagInput.trim()].filter((v, i, arr) => arr.indexOf(v) === i)
        : tags;

      const payload: StudentPortfolioPayload = {
        title: title.trim(),
        description: description.trim(),
        thumbnail,
        gallery,
        technologies: finalTechnologies,
        tags: finalTags,
        ...links,
      };

      const res = isEdit && id ? await portfolioApi.update(id, payload) : await portfolioApi.create(payload);
      const saved = res.data;

      if (submitAfter) {
        await portfolioApi.submit(saved._id);
      }

      navigate("/student/portfolio");
    } catch (err: any) {
      setFormError(err?.message || "Could not save this project.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return (
      <StudentLayout title={isEdit ? "Edit Project" : "New Project"}>
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="animate-spin text-[#0037FF]" size={28} />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title={isEdit ? "Edit Project" : "New Project"}
      subtitle="Fill in the details below. You can save as draft and submit for review later."
      actions={
        <Button variant="outline" className="gap-2" onClick={() => navigate("/student/portfolio")}>
          <ArrowLeft size={16} />
          Back to Portfolio
        </Button>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Project Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. E-commerce Dashboard Redesign" />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="What problem does this project solve? What was your role?"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#0037FF]"
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.description ? <p className="text-xs text-red-600">{errors.description}</p> : <span />}
            <span className="text-xs text-muted-foreground">
              {description.trim().length}/{MIN_DESC} min
            </span>
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Thumbnail Image</label>
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-secondary/50">
              {thumbnail?.url ? (
                <img src={thumbnail.url} alt="thumbnail" className="h-full w-full object-cover" />
              ) : thumbUploading ? (
                <Loader2 className="animate-spin text-muted-foreground" size={20} />
              ) : (
                <UploadCloud className="text-muted-foreground" size={20} />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleThumbnailSelect(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => thumbInputRef.current?.click()}
                disabled={thumbUploading}
              >
                {thumbUploading ? `Uploading ${thumbProgress}%` : thumbnail ? "Replace" : "Upload"}
              </Button>
              {thumbnail && (
                <button type="button" onClick={() => setThumbnail(null)} className="text-left text-xs text-red-600 hover:underline">
                  Remove
                </button>
              )}
            </div>
          </div>
          {errors.thumbnail && <p className="mt-1 text-xs text-red-600">{errors.thumbnail}</p>}
        </div>

        {/* Gallery */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Gallery (optional)</label>
          <div className="flex flex-wrap gap-3">
            {gallery.map((img, i) => (
              <div key={img.publicId} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={galleryUploading}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-secondary/50"
            >
              {galleryUploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-[10px]">{galleryProgress}%</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span className="text-[10px]">Add</span>
                </>
              )}
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleGallerySelect(e.target.files)}
            />
          </div>
        </div>

        {/* Technologies — optional, admin can edit/override later */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Technologies <span className="font-normal text-muted-foreground">(optional — admin may adjust this)</span>
          </label>
          <div className="flex gap-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTech();
                }
              }}
              placeholder="e.g. React — press Enter to add"
            />
            <Button type="button" variant="outline" onClick={addTech}>
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {technologies.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-[#0037FF]/10 px-2.5 py-1 text-xs text-[#0037FF]">
                {t}
                <button type="button" onClick={() => setTechnologies((prev) => prev.filter((x) => x !== t))}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tags — optional, admin can edit/override later */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Tags <span className="font-normal text-muted-foreground">(optional — admin may adjust this)</span>
          </label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="e.g. hackathon-winner — press Enter to add"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                {t}
                <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Project Links</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LINK_FIELDS.map((field) => (
              <Input
                key={field.key}
                value={links[field.key]}
                onChange={(e) => setLinks((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={`${field.label} — ${field.placeholder}`}
              />
            ))}
          </div>
          {errors.links && <p className="mt-1 text-xs text-red-600">{errors.links}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-border pt-5">
          <Button variant="outline" disabled={saving} onClick={() => handleSave(false)} className="gap-2">
            {saving && <Loader2 className="animate-spin" size={14} />}
            Save as Draft
          </Button>
          <Button disabled={saving} onClick={() => handleSave(true)} className="gap-2 text-white bg-[#0037FF] hover:bg-[#0037FF]/90">
            {saving && <Loader2 className="animate-spin" size={14} />}
            Save &amp; Submit for Review
          </Button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default PortfolioForm;