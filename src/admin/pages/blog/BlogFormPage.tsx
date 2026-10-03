// import { useEffect, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";

// import AdminLayout from "../../components/AdminLayout";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";

// import { blogApi } from "@/services/blog.service";
// import { useCategories } from "@/hooks/useCategories";
// import type { Blog, BlogPayload } from "@/types/blog";

// const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, mirrors backend multer limit
// const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// interface FormState {
//   title: string;
//   shortDescription: string;
//   content: string;
//   category: string;
//   tags: string;
//   featured: boolean;
//   status: "Draft" | "Published";
//   readTime: string;
//   seoTitle: string;
//   metaDescription: string;
// }

// const INITIAL_STATE: FormState = {
//   title: "",
//   shortDescription: "",
//   content: "",
//   category: "",
//   tags: "",
//   featured: false,
//   status: "Draft",
//   readTime: "5",
//   seoTitle: "",
//   metaDescription: "",
// };

// type FormErrors = Partial<Record<keyof FormState, string>>;

// const BlogFormPage = () => {
//   const { id } = useParams<{ id: string }>();
//   const isEditMode = Boolean(id);

//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const { categories, loading: categoriesLoading } = useCategories();

//   const [form, setForm] = useState<FormState>(INITIAL_STATE);
//   const [errors, setErrors] = useState<FormErrors>({});

//   const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
//   const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
//   const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string>("");

//   const [loading, setLoading] = useState(isEditMode);
//   const [submitting, setSubmitting] = useState(false);
//   const [loadError, setLoadError] = useState<string | null>(null);

//   // ------------------------------------------------------------------------
//   // Load existing blog when editing
//   // ------------------------------------------------------------------------
//   useEffect(() => {
//     if (!isEditMode || !id) return;

//     let cancelled = false;

//     const loadBlog = async () => {
//       try {
//         setLoading(true);
//         setLoadError(null);

//         const res = await blogApi.getById(id);
//         const blog: Blog = res.data;

//         if (cancelled) return;

//         setForm({
//           title: blog.title,
//           shortDescription: blog.shortDescription,
//           content: blog.content,
//           category: blog.category,
//           tags: (blog.tags || []).join(", "),
//           featured: blog.featured,
//           status: blog.status,
//           readTime: String(blog.readTime ?? 5),
//           seoTitle: blog.seoTitle || "",
//           metaDescription: blog.metaDescription || "",
//         });

//         setExistingThumbnailUrl(blog.thumbnail?.url || "");
//       } catch (err: any) {
//         if (!cancelled) {
//           setLoadError(err.message || "Failed to load blog post.");
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     loadBlog();

//     return () => {
//       cancelled = true;
//     };
//   }, [id, isEditMode]);

//   // Clean up the object URL created for the thumbnail preview
//   useEffect(() => {
//     return () => {
//       if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
//     };
//   }, [thumbnailPreview]);

//   // ------------------------------------------------------------------------
//   // Field helpers
//   // ------------------------------------------------------------------------
//   const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
//     setForm((prev) => ({ ...prev, [key]: value }));

//     if (errors[key]) {
//       setErrors((prev) => ({ ...prev, [key]: undefined }));
//     }
//   };

//   const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
//       toast({
//         title: "Unsupported file type",
//         description: "Only JPG, PNG and WEBP images are allowed.",
//         variant: "destructive",
//       });
//       e.target.value = "";
//       return;
//     }

//     if (file.size > MAX_IMAGE_SIZE) {
//       toast({
//         title: "Image too large",
//         description: "Thumbnail must be 5MB or smaller.",
//         variant: "destructive",
//       });
//       e.target.value = "";
//       return;
//     }

//     setThumbnailFile(file);
//     setThumbnailPreview(URL.createObjectURL(file));
//   };

//   const clearThumbnail = () => {
//     setThumbnailFile(null);
//     setThumbnailPreview("");
//   };

//   // ------------------------------------------------------------------------
//   // Validation — mirrors backend/validators/blog.validator.js
//   // ------------------------------------------------------------------------
//   const validate = (): FormErrors => {
//     const next: FormErrors = {};

//     const title = form.title.trim();
//     if (!title) next.title = "Blog title is required.";
//     else if (title.length < 3 || title.length > 200)
//       next.title = "Title must be between 3 and 200 characters.";

//     const shortDescription = form.shortDescription.trim();
//     if (!shortDescription) next.shortDescription = "Short description is required.";
//     else if (shortDescription.length < 20 || shortDescription.length > 500)
//       next.shortDescription =
//         "Short description must be between 20 and 500 characters.";

//     if (!form.content.trim()) next.content = "Blog content is required.";

//     if (!form.category) next.category = "Category is required.";

//     if (form.readTime) {
//       const rt = Number(form.readTime);
//       if (!Number.isInteger(rt) || rt < 1 || rt > 60) {
//         next.readTime = "Read time must be between 1 and 60 minutes.";
//       }
//     }

//     if (form.seoTitle.length > 200)
//       next.seoTitle = "SEO title cannot exceed 200 characters.";

//     if (form.metaDescription.length > 300)
//       next.metaDescription = "Meta description cannot exceed 300 characters.";

//     return next;
//   };

//   // ------------------------------------------------------------------------
//   // Submit
//   // ------------------------------------------------------------------------
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const validationErrors = validate();
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length > 0) {
//       toast({
//         title: "Please fix the errors below",
//         variant: "destructive",
//       });
//       return;
//     }

//     const payload: BlogPayload = {
//       title: form.title.trim(),
//       shortDescription: form.shortDescription.trim(),
//       content: form.content,
//       category: form.category,
//       featured: form.featured,
//       status: form.status,
//       readTime: Number(form.readTime) || 5,
//       seoTitle: form.seoTitle.trim(),
//       metaDescription: form.metaDescription.trim(),
//       tags: form.tags
//         .split(",")
//         .map((t) => t.trim())
//         .filter(Boolean),
//       thumbnail: thumbnailFile,
//     };

//     const formData = new FormData();
//     formData.append("title", payload.title);
//     formData.append("shortDescription", payload.shortDescription);
//     formData.append("content", payload.content);
//     formData.append("category", payload.category);
//     formData.append("status", payload.status ?? "Draft");
//     formData.append("featured", String(payload.featured ?? false));
//     formData.append("readTime", String(payload.readTime ?? 5));
//     formData.append("seoTitle", payload.seoTitle ?? "");
//     formData.append("metaDescription", payload.metaDescription ?? "");
//     payload.tags?.forEach((tag) => formData.append("tags", tag));
//     if (payload.thumbnail) formData.append("thumbnail", payload.thumbnail);

//     try {
//       setSubmitting(true);

//       if (isEditMode && id) {
//         await blogApi.update(id, formData);
//         toast({ title: "Blog updated successfully." });
//         navigate(`/admin/blog/${id}`);
//       } else {
//         const res = await blogApi.create(formData);
//         toast({ title: "Blog created successfully." });
//         navigate(`/admin/blog/${res.data._id}`);
//       }
//     } catch (err: any) {
//       toast({
//         title: "Something went wrong",
//         description: err.message || "Failed to save the blog post.",
//         variant: "destructive",
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ------------------------------------------------------------------------
//   // Render
//   // ------------------------------------------------------------------------
//   const displayThumbnail = thumbnailPreview || existingThumbnailUrl;

//   if (loading) {
//     return (
//       <AdminLayout title={isEditMode ? "Edit Post" : "New Post"} subtitle=" ">
//         <div className="flex items-center justify-center py-24 text-muted-foreground">
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           Loading blog post...
//         </div>
//       </AdminLayout>
//     );
//   }

//   if (loadError) {
//     return (
//       <AdminLayout title="Edit Post" subtitle=" ">
//         <div className="flex flex-col items-center gap-3 py-24 text-center">
//           <p className="text-sm text-muted-foreground">{loadError}</p>
//           <Button variant="outline" size="sm" onClick={() => navigate("/admin/blog")}>
//             Back to Blog
//           </Button>
//         </div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout
//       title={isEditMode ? "Edit Post" : "New Post"}
//       subtitle={
//         isEditMode
//           ? "Update the content, media, or status of this post."
//           : "Write and publish a new blog post."
//       }
//       actions={
//         <Link to="/admin/blog">
//           <Button variant="outline" size="sm">
//             <ArrowLeft size={14} />
//             Back to Blog
//           </Button>
//         </Link>
//       }
//     >
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//         {/* Main column */}
//         <div className="space-y-6 lg:col-span-2">
//           <div className="rounded-xl border border-border bg-card p-5">
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="title">Title</Label>
//                 <Input
//                   id="title"
//                   className="mt-1.5"
//                   placeholder="e.g. 10 Tips for Landing Your First Tech Job"
//                   value={form.title}
//                   onChange={(e) => updateField("title", e.target.value)}
//                 />
//                 {errors.title && (
//                   <p className="mt-1 text-xs text-destructive">{errors.title}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="shortDescription">Short Description</Label>
//                 <Textarea
//                   id="shortDescription"
//                   className="mt-1.5"
//                   rows={3}
//                   placeholder="A concise summary shown on listing and preview cards (20–500 characters)."
//                   value={form.shortDescription}
//                   onChange={(e) => updateField("shortDescription", e.target.value)}
//                 />
//                 <div className="mt-1 flex items-center justify-between">
//                   {errors.shortDescription ? (
//                     <p className="text-xs text-destructive">
//                       {errors.shortDescription}
//                     </p>
//                   ) : (
//                     <span />
//                   )}
//                   <span className="text-xs text-muted-foreground">
//                     {form.shortDescription.length}/500
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="content">Content</Label>
//                 <Textarea
//                   id="content"
//                   className="mt-1.5 font-mono text-sm"
//                   rows={16}
//                   placeholder="Write the full blog content here. Markdown or HTML is supported."
//                   value={form.content}
//                   onChange={(e) => updateField("content", e.target.value)}
//                 />
//                 {errors.content && (
//                   <p className="mt-1 text-xs text-destructive">{errors.content}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="rounded-xl border border-border bg-card p-5">
//             <h3 className="mb-4 text-sm font-semibold">SEO</h3>

//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="seoTitle">SEO Title</Label>
//                 <Input
//                   id="seoTitle"
//                   className="mt-1.5"
//                   placeholder="Custom title for search engines (optional)"
//                   value={form.seoTitle}
//                   onChange={(e) => updateField("seoTitle", e.target.value)}
//                 />
//                 {errors.seoTitle && (
//                   <p className="mt-1 text-xs text-destructive">{errors.seoTitle}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="metaDescription">Meta Description</Label>
//                 <Textarea
//                   id="metaDescription"
//                   className="mt-1.5"
//                   rows={2}
//                   placeholder="Custom description for search engines (optional)"
//                   value={form.metaDescription}
//                   onChange={(e) => updateField("metaDescription", e.target.value)}
//                 />
//                 {errors.metaDescription && (
//                   <p className="mt-1 text-xs text-destructive">
//                     {errors.metaDescription}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Side column */}
//         <div className="space-y-6">
//           <div className="rounded-xl border border-border bg-card p-5">
//             <h3 className="mb-4 text-sm font-semibold">Publishing</h3>

//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="status">Status</Label>
//                 <Select
//                   value={form.status}
//                   onValueChange={(v) => updateField("status", v as FormState["status"])}
//                 >
//                   <SelectTrigger id="status" className="mt-1.5">
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Draft">Draft</SelectItem>
//                     <SelectItem value="Published">Published</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
//                 <div>
//                   <p className="text-sm font-medium">Featured</p>
//                   <p className="text-xs text-muted-foreground">
//                     Show on the homepage highlights
//                   </p>
//                 </div>
//                 <Switch
//                   checked={form.featured}
//                   onCheckedChange={(v) => updateField("featured", v)}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="rounded-xl border border-border bg-card p-5">
//             <h3 className="mb-4 text-sm font-semibold">Thumbnail</h3>

//             {displayThumbnail ? (
//               <div className="relative">
//                 <img
//                   src={displayThumbnail}
//                   alt="Thumbnail preview"
//                   className="h-40 w-full rounded-lg border border-border object-cover"
//                 />
//                 {thumbnailFile && (
//                   <button
//                     type="button"
//                     onClick={clearThumbnail}
//                     className="absolute right-2 top-2 rounded-full bg-background/90 p-1 shadow"
//                     aria-label="Remove selected image"
//                   >
//                     <X size={14} />
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <label
//                 htmlFor="thumbnail"
//                 className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-secondary/30"
//               >
//                 <ImagePlus size={20} />
//                 <span className="text-xs">Click to upload an image</span>
//               </label>
//             )}

//             <input
//               id="thumbnail"
//               type="file"
//               accept="image/jpeg,image/jpg,image/png,image/webp"
//               className="hidden"
//               onChange={handleThumbnailChange}
//             />

//             {displayThumbnail && (
//               <label
//                 htmlFor="thumbnail"
//                 className="mt-2 block cursor-pointer text-center text-xs text-primary hover:underline"
//               >
//                 Change image
//               </label>
//             )}

//             <p className="mt-2 text-xs text-muted-foreground">
//               JPG, PNG or WEBP. Max 5MB.
//             </p>
//           </div>

//           <div className="rounded-xl border border-border bg-card p-5">
//             <h3 className="mb-4 text-sm font-semibold">Details</h3>

//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="category">Category</Label>
//                 <Select
//                   value={form.category}
//                   onValueChange={(v) => updateField("category", v)}
//                   disabled={categoriesLoading}
//                 >
//                   <SelectTrigger id="category" className="mt-1.5">
//                     <SelectValue
//                       placeholder={
//                         categoriesLoading ? "Loading categories..." : "Select category"
//                       }
//                     />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.map((cat) => (
//                       <SelectItem key={cat} value={cat}>
//                         {cat}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.category && (
//                   <p className="mt-1 text-xs text-destructive">{errors.category}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="readTime">Read Time (minutes)</Label>
//                 <Input
//                   id="readTime"
//                   type="number"
//                   min={1}
//                   max={60}
//                   className="mt-1.5"
//                   value={form.readTime}
//                   onChange={(e) => updateField("readTime", e.target.value)}
//                 />
//                 {errors.readTime && (
//                   <p className="mt-1 text-xs text-destructive">{errors.readTime}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="tags">Tags</Label>
//                 <Input
//                   id="tags"
//                   className="mt-1.5"
//                   placeholder="career, tips, interview (comma separated)"
//                   value={form.tags}
//                   onChange={(e) => updateField("tags", e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-col gap-2">
//             <Button type="submit" className="text-white" disabled={submitting}>
//               {submitting && <Loader2 size={14} className="animate-spin" />}
//               {isEditMode ? "Save Changes" : "Publish Post"}
//             </Button>
//             <Link to="/admin/blog">
//               <Button type="button" variant="outline" className="w-full">
//                 Cancel
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </form>
//     </AdminLayout>
//   );
// };

// export default BlogFormPage;








import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";

import AdminLayout from "../../components/AdminLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { blogApi } from "@/services/blog.service";
import { useCourses } from "@/hooks/useCourses";
import type { Blog, BlogPayload } from "@/types/blog";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, mirrors backend multer limit
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface FormState {
  title: string;
  shortDescription: string;
  content: string;
  course: string; // CHANGED — Course _id instead of category label
  tags: string;
  featured: boolean;
  status: "Draft" | "Published";
  readTime: string;
  seoTitle: string;
  metaDescription: string;
}

const INITIAL_STATE: FormState = {
  title: "",
  shortDescription: "",
  content: "",
  course: "",
  tags: "",
  featured: false,
  status: "Draft",
  readTime: "5",
  seoTitle: "",
  metaDescription: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const BlogFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const navigate = useNavigate();
  const { toast } = useToast();

  const { courses, loading: coursesLoading } = useCourses();

  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string>("");

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ------------------------------------------------------------------------
  // Load existing blog when editing
  // ------------------------------------------------------------------------
  useEffect(() => {
    if (!isEditMode || !id) return;

    let cancelled = false;

    const loadBlog = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const res = await blogApi.getById(id);
        const blog: Blog = res.data;

        if (cancelled) return;

        setForm({
          title: blog.title,
          shortDescription: blog.shortDescription,
          content: blog.content,
          course: blog.course?._id || "",
          tags: (blog.tags || []).join(", "),
          featured: blog.featured,
          status: blog.status,
          readTime: String(blog.readTime ?? 5),
          seoTitle: blog.seoTitle || "",
          metaDescription: blog.metaDescription || "",
        });

        setExistingThumbnailUrl(blog.thumbnail?.url || "");
      } catch (err: any) {
        if (!cancelled) {
          setLoadError(err.message || "Failed to load blog post.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBlog();

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  // Clean up the object URL created for the thumbnail preview
  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  // ------------------------------------------------------------------------
  // Field helpers
  // ------------------------------------------------------------------------
  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Only JPG, PNG and WEBP images are allowed.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "Image too large",
        description: "Thumbnail must be 5MB or smaller.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  // ------------------------------------------------------------------------
  // Validation — mirrors backend/validators/blog.validator.js
  // ------------------------------------------------------------------------
  const validate = (): FormErrors => {
    const next: FormErrors = {};

    const title = form.title.trim();
    if (!title) next.title = "Blog title is required.";
    else if (title.length < 3 || title.length > 200)
      next.title = "Title must be between 3 and 200 characters.";

    const shortDescription = form.shortDescription.trim();
    if (!shortDescription) next.shortDescription = "Short description is required.";
    else if (shortDescription.length < 20 || shortDescription.length > 500)
      next.shortDescription =
        "Short description must be between 20 and 500 characters.";

    if (!form.content.trim()) next.content = "Blog content is required.";

    if (!form.course) next.course = "Course is required.";

    if (form.readTime) {
      const rt = Number(form.readTime);
      if (!Number.isInteger(rt) || rt < 1 || rt > 60) {
        next.readTime = "Read time must be between 1 and 60 minutes.";
      }
    }

    if (form.seoTitle.length > 200)
      next.seoTitle = "SEO title cannot exceed 200 characters.";

    if (form.metaDescription.length > 300)
      next.metaDescription = "Meta description cannot exceed 300 characters.";

    return next;
  };

  // ------------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    const payload: BlogPayload = {
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      content: form.content,
      course: form.course,
      featured: form.featured,
      status: form.status,
      readTime: Number(form.readTime) || 5,
      seoTitle: form.seoTitle.trim(),
      metaDescription: form.metaDescription.trim(),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      thumbnail: thumbnailFile,
    };

    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("shortDescription", payload.shortDescription);
    formData.append("content", payload.content);
    formData.append("course", payload.course);
    formData.append("status", payload.status ?? "Draft");
    formData.append("featured", String(payload.featured ?? false));
    formData.append("readTime", String(payload.readTime ?? 5));
    formData.append("seoTitle", payload.seoTitle ?? "");
    formData.append("metaDescription", payload.metaDescription ?? "");
    payload.tags?.forEach((tag) => formData.append("tags", tag));
    if (payload.thumbnail) formData.append("thumbnail", payload.thumbnail);

    try {
      setSubmitting(true);

      if (isEditMode && id) {
        await blogApi.update(id, formData);
        toast({ title: "Blog updated successfully." });
        navigate(`/admin/blog/${id}`);
      } else {
        const res = await blogApi.create(formData);
        toast({ title: "Blog created successfully." });
        navigate(`/admin/blog/${res.data._id}`);
      }
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err.message || "Failed to save the blog post.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------
  const displayThumbnail = thumbnailPreview || existingThumbnailUrl;

  if (loading) {
    return (
      <AdminLayout title={isEditMode ? "Edit Post" : "New Post"} subtitle=" ">
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading blog post...
        </div>
      </AdminLayout>
    );
  }

  if (loadError) {
    return (
      <AdminLayout title="Edit Post" subtitle=" ">
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/blog")}>
            Back to Blog
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEditMode ? "Edit Post" : "New Post"}
      subtitle={
        isEditMode
          ? "Update the content, media, or status of this post."
          : "Write and publish a new blog post."
      }
      actions={
        <Link to="/admin/blog">
          <Button variant="outline" size="sm">
            <ArrowLeft size={14} />
            Back to Blog
          </Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  className="mt-1.5"
                  placeholder="e.g. 10 Tips for Landing Your First Tech Job"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-destructive">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  className="mt-1.5"
                  rows={3}
                  placeholder="A concise summary shown on listing and preview cards (20–500 characters)."
                  value={form.shortDescription}
                  onChange={(e) => updateField("shortDescription", e.target.value)}
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.shortDescription ? (
                    <p className="text-xs text-destructive">
                      {errors.shortDescription}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {form.shortDescription.length}/500
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  className="mt-1.5 font-mono text-sm"
                  rows={16}
                  placeholder="Write the full blog content here. Markdown or HTML is supported."
                  value={form.content}
                  onChange={(e) => updateField("content", e.target.value)}
                />
                {errors.content && (
                  <p className="mt-1 text-xs text-destructive">{errors.content}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">SEO</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  className="mt-1.5"
                  placeholder="Custom title for search engines (optional)"
                  value={form.seoTitle}
                  onChange={(e) => updateField("seoTitle", e.target.value)}
                />
                {errors.seoTitle && (
                  <p className="mt-1 text-xs text-destructive">{errors.seoTitle}</p>
                )}
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  className="mt-1.5"
                  rows={2}
                  placeholder="Custom description for search engines (optional)"
                  value={form.metaDescription}
                  onChange={(e) => updateField("metaDescription", e.target.value)}
                />
                {errors.metaDescription && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.metaDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Publishing</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => updateField("status", v as FormState["status"])}
                >
                  <SelectTrigger id="status" className="mt-1.5">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-xs text-muted-foreground">
                    Show on the homepage highlights
                  </p>
                </div>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => updateField("featured", v)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Thumbnail</h3>

            {displayThumbnail ? (
              <div className="relative">
                <img
                  src={displayThumbnail}
                  alt="Thumbnail preview"
                  className="h-40 w-full rounded-lg border border-border object-cover"
                />
                {thumbnailFile && (
                  <button
                    type="button"
                    onClick={clearThumbnail}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1 shadow"
                    aria-label="Remove selected image"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <label
                htmlFor="thumbnail"
                className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground hover:bg-secondary/30"
              >
                <ImagePlus size={20} />
                <span className="text-xs">Click to upload an image</span>
              </label>
            )}

            <input
              id="thumbnail"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleThumbnailChange}
            />

            {displayThumbnail && (
              <label
                htmlFor="thumbnail"
                className="mt-2 block cursor-pointer text-center text-xs text-primary hover:underline"
              >
                Change image
              </label>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              JPG, PNG or WEBP. Max 5MB.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Details</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="course">Course</Label>
                <Select
                  value={form.course}
                  onValueChange={(v) => updateField("course", v)}
                  disabled={coursesLoading}
                >
                  <SelectTrigger id="course" className="mt-1.5">
                    <SelectValue
                      placeholder={
                        coursesLoading ? "Loading courses..." : "Select course"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.course && (
                  <p className="mt-1 text-xs text-destructive">{errors.course}</p>
                )}
              </div>

              <div>
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  min={1}
                  max={60}
                  className="mt-1.5"
                  value={form.readTime}
                  onChange={(e) => updateField("readTime", e.target.value)}
                />
                {errors.readTime && (
                  <p className="mt-1 text-xs text-destructive">{errors.readTime}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  className="mt-1.5"
                  placeholder="career, tips, interview (comma separated)"
                  value={form.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="text-white" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {isEditMode ? "Save Changes" : "Publish Post"}
            </Button>
            <Link to="/admin/blog">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default BlogFormPage;