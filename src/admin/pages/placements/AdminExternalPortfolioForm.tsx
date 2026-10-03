import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  adminPortfolioApi,
  coursesApi,
  Course,
  ExternalPortfolioPayload,
} from "@/integrations/client";
import axios from "axios";

const AdminExternalPortfolioForm = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    studentBatch: "",
    course: "",
    title: "",
    description: "",
    thumbnailUrl: "",
    githubUrl: "",
    liveUrl: "",
    figmaUrl: "",
    behanceUrl: "",
    videoUrl: "",
    driveUrl: "",
    technologies: "",
    tags: "",
    featured: false,
     thumbnailFile: null as File | null,
  });

  useEffect(() => {
    coursesApi.getAll().then(setCourses).catch(() => setCourses([]));
  }, []);

  const set = (key: keyof typeof form, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  // const buildPayload = (publish: boolean): ExternalPortfolioPayload => ({
  //   studentName: form.studentName,
  //   studentEmail: form.studentEmail || undefined,
  //   studentBatch: form.studentBatch || undefined,
  //   course: form.course,
  //   title: form.title,
  //   description: form.description,
  //   thumbnail: form.thumbnailUrl
  //     ? { url: form.thumbnailUrl, publicId: "" }
  //     : undefined,
  //   githubUrl: form.githubUrl || undefined,
  //   liveUrl: form.liveUrl || undefined,
  //   figmaUrl: form.figmaUrl || undefined,
  //   behanceUrl: form.behanceUrl || undefined,
  //   videoUrl: form.videoUrl || undefined,
  //   driveUrl: form.driveUrl || undefined,
  //   technologies: form.technologies
  //     ? form.technologies.split(",").map((t) => t.trim()).filter(Boolean)
  //     : [],
  //   tags: form.tags
  //     ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
  //     : [],
  //   featured: form.featured,
  //   publish,
  // });

  const buildPayload = (
  publish: boolean,
  thumbnail?: { url: string; publicId: string }
): ExternalPortfolioPayload => ({
  studentName: form.studentName,
  studentEmail: form.studentEmail || undefined,
  studentBatch: form.studentBatch || undefined,
  course: form.course,
  title: form.title,
  description: form.description,

  thumbnail,

  githubUrl: form.githubUrl || undefined,
  liveUrl: form.liveUrl || undefined,
  figmaUrl: form.figmaUrl || undefined,
  behanceUrl: form.behanceUrl || undefined,
  videoUrl: form.videoUrl || undefined,
  driveUrl: form.driveUrl || undefined,

  technologies: form.technologies
    ? form.technologies.split(",").map((t) => t.trim()).filter(Boolean)
    : [],

  tags: form.tags
    ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [],

  featured: form.featured,
  publish,
});

  // const handleSubmit = async (publish: boolean) => {
  //   setError(null);
  //   if (!form.studentName.trim()) return setError("Student name is required");
  //   if (!form.course) return setError("Course is required");
  //   if (!form.title.trim()) return setError("Project title is required");
  //   if (!form.description.trim() || form.description.trim().length < 50)
  //     return setError("Description must be at least 50 characters");

  //   setSaving(publish ? "publish" : "draft");
  //   try {
  //     await adminPortfolioApi.createExternal(buildPayload(publish));
  //     navigate("/admin/portfolio");
  //   } catch (err: any) {
  //     setError(err?.message || "Could not create portfolio.");
  //   } finally {
  //     setSaving(null);
  //   }
  // };

  const handleSubmit = async (publish: boolean) => {
  setError(null);

  if (!form.studentName.trim())
    return setError("Student name is required");

  if (!form.course)
    return setError("Course is required");

  if (!form.title.trim())
    return setError("Project title is required");

  if (!form.description.trim() || form.description.trim().length < 50)
    return setError("Description must be at least 50 characters");

  if (!form.thumbnailFile)
    return setError("Thumbnail image is required");

  setSaving(publish ? "publish" : "draft");

  try {
    // 1. Upload thumbnail first
    const uploadForm = new FormData();

    uploadForm.append("file", form.thumbnailFile);

    const uploadRes = await axios.post(
      "/api/admin/portfolio/upload",
      uploadForm,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // 2. Cloudinary response
    const thumbnail = uploadRes.data.data;

    // 3. Create portfolio with uploaded image
    await adminPortfolioApi.createExternal(
      buildPayload(publish, thumbnail)
    );

    navigate("/admin/portfolio");
  } catch (err: any) {
    setError(err?.message || "Could not create portfolio.");
  } finally {
    setSaving(null);
  }
};

  return (
    <AdminLayout
      title="Add External Student Portfolio"
      subtitle="Create and publish a portfolio for a former or external student."
    >
      <div className="max-w-2xl space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Student Name *</label>
            <Input value={form.studentName} onChange={(e) => set("studentName", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Student Email</label>
            <Input value={form.studentEmail} onChange={(e) => set("studentEmail", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Student Batch</label>
            <Input value={form.studentBatch} onChange={(e) => set("studentBatch", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Course *</label>
            <select
              value={form.course}
              onChange={(e) => set("course", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Project Title *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Description * (min 50 chars)</label>
          <Textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

      <div>
  <label className="text-sm font-medium">Thumbnail *</label>

  <Input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) set("thumbnailFile", file);
    }}
  />

  {form.thumbnailFile && (
    <p className="mt-1 text-xs text-muted-foreground">
      {form.thumbnailFile.name}
    </p>
  )}
</div>

        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="GitHub URL" value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} />
          <Input placeholder="Live URL" value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} />
          <Input placeholder="Figma URL" value={form.figmaUrl} onChange={(e) => set("figmaUrl", e.target.value)} />
          <Input placeholder="Behance URL" value={form.behanceUrl} onChange={(e) => set("behanceUrl", e.target.value)} />
          <Input placeholder="Video URL" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
          <Input placeholder="Drive URL" value={form.driveUrl} onChange={(e) => set("driveUrl", e.target.value)} />
        </div>

        <Input
          placeholder="Technologies (comma separated)"
          value={form.technologies}
          onChange={(e) => set("technologies", e.target.value)}
        />
        <Input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
          Featured
        </label>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" disabled={!!saving} onClick={() => handleSubmit(false)}>
            {saving === "draft" ? "Saving…" : "Save Draft"}
          </Button>
          <Button
            className="bg-[#0037FF] text-white hover:bg-[#0037FF]/90"
            disabled={!!saving}
            onClick={() => handleSubmit(true)}
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminExternalPortfolioForm;