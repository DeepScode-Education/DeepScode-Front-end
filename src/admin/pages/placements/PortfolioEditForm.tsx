// src/admin/pages/PortfolioEditForm.tsx
//
// Admin Portfolio Edit Form — full editing rights over a submitted project.
// Route: /admin/portfolio/:id/edit

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Portfolio,
  PortfolioCategory,
  PortfolioStatus,
  adminPortfolioApi,
} from "@/integrations/client";


const CATEGORY_OPTIONS: PortfolioCategory[] = ["Design", "Marketing", "3D", "Data", "Tech"];
const STATUS_OPTIONS: PortfolioStatus[] = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "published",
  "archived",
];

const LINK_FIELDS: { key: keyof Portfolio; label: string }[] = [
  { key: "githubUrl", label: "GitHub" },
  { key: "liveUrl", label: "Live URL" },
  { key: "figmaUrl", label: "Figma" },
  { key: "behanceUrl", label: "Behance" },
  { key: "videoUrl", label: "Video" },
  { key: "driveUrl", label: "Google Drive" },
];

const PortfolioEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PortfolioCategory>("Tech");
  const [status, setStatus] = useState<PortfolioStatus>("draft");
  const [featured, setFeatured] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({
    githubUrl: "", liveUrl: "", figmaUrl: "", behanceUrl: "", videoUrl: "", driveUrl: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
const [thumbnailPreview, setThumbnailPreview] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await adminPortfolioApi.getById(id);
const p = res.data;

setTitle(p.title);
setDescription(p.description);
setCategory(p.category);
setStatus(p.status);
setFeatured(p.featured);
setAdminRemarks(p.adminRemarks || "");
setTechnologies(p.technologies || []);
setTags(p.tags || []);

setThumbnailPreview(p.thumbnail?.url || "");

setLinks({
  githubUrl: p.githubUrl || "",
  liveUrl: p.liveUrl || "",
  figmaUrl: p.figmaUrl || "",
  behanceUrl: p.behanceUrl || "",
  videoUrl: p.videoUrl || "",
  driveUrl: p.driveUrl || "",
});
      } catch (err: any) {
        setError(err?.message || "Could not load this project.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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

  // const handleSave = async () => {
  //   if (!id) return;
  //   setSaving(true);
  //   setError(null);
  //   try {
  //     await adminPortfolioApi.update(id, {
  //       title: title.trim(),
  //       description: description.trim(),
  //       category,
  //       status,
  //       featured,
  //       adminRemarks,
  //       technologies,
  //       tags,
  //       ...links,
  //     });
  //     navigate(`/admin/portfolio/${id}`);
  //   } catch (err: any) {
  //     setError(err?.message || "Could not save changes.");
  //   } finally {
  //     setSaving(false);
  //   }
  // };



const handleSave = async () => {
  if (!id) return;

  setSaving(true);
  setError(null);

  try {
    let thumbnail;

    // Upload only if admin selected a new image
    if (thumbnailFile) {
      const uploadRes = await adminPortfolioApi.uploadImage(thumbnailFile);
      thumbnail = uploadRes.data; // { url, publicId }
    }

    await adminPortfolioApi.update(id, {
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      featured,
      adminRemarks,
      technologies,
      tags,

      // If no new image was selected, thumbnail is omitted entirely,
      // so the backend keeps the existing thumbnail unchanged.
      ...(thumbnail ? { thumbnail } : {}),

      ...links,
    });

    navigate(`/admin/portfolio/${id}`);
  } catch (err: any) {
    setError(err?.message || "Could not save changes.");
  } finally {
    setSaving(false);
  }
};
  if (loading) {
    return (
      <AdminLayout title="Edit Project">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-[#0037FF]" size={28} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Edit Project"
      subtitle="Correct or complete this student's submission before approval."
      actions={
        <Button variant="outline" className="gap-2" onClick={() => navigate(`/admin/portfolio/${id}`)}>
          <ArrowLeft size={16} />
          Back to Review
        </Button>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Project Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#0037FF]"
          />
        </div>

        <div>
  <label className="mb-1.5 block text-sm font-medium text-foreground">
    Thumbnail
  </label>

  {thumbnailPreview && (
    <div className="mb-3 overflow-hidden rounded-lg border border-border">
      <img
        src={thumbnailPreview}
        alt="Current thumbnail"
        className="h-48 w-full object-cover"
      />
    </div>
  )}

  <Input
    type="file"
    accept="image/png,image/jpeg,image/webp"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }}
  />

  {thumbnailFile && (
    <p className="mt-1 text-xs text-muted-foreground">
      New image: {thumbnailFile.name}
    </p>
  )}
</div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PortfolioCategory)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PortfolioStatus)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Technologies</label>
          <div className="flex gap-2">
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
              placeholder="e.g. React — press Enter to add"
            />
            <Button type="button" variant="outline" onClick={addTech}>Add</Button>
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Tags</label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="e.g. hackathon-winner — press Enter to add"
            />
            <Button type="button" variant="outline" onClick={addTag}>Add</Button>
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Project Links</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LINK_FIELDS.map((f) => (
              <Input
                key={f.key as string}
                value={links[f.key as string]}
                onChange={(e) => setLinks((prev) => ({ ...prev, [f.key as string]: e.target.value }))}
                placeholder={f.label}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          <label htmlFor="featured" className="text-sm text-foreground">Mark as Featured</label>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Admin Remarks</label>
          <textarea
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
            rows={3}
            placeholder="Internal note or reason shown to the student (e.g. on rejection)."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#0037FF]"
          />
        </div>

        <div className="flex items-center gap-3 border-t border-border pt-5">
          <Button disabled={saving} onClick={handleSave} className="gap-2 text-white bg-[#0037FF] hover:bg-[#0037FF]/90">
            {saving && <Loader2 className="animate-spin" size={14} />}
            Save Changes
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PortfolioEditForm;