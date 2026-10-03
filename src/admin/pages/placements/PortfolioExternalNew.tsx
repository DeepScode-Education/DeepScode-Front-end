// src/admin/pages/PortfolioExternalNew.tsx
//
// Admin — create a portfolio for a former/external student (not a User in
// the system), including their photo and review, via
// POST /api/admin/portfolio/external.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  adminPortfolioApi,
  coursesApi,
  Course,
  ExternalPortfolioPayload,
  PortfolioCategory,
  PortfolioImage,
} from "@/integrations/client";
import { useEffect } from "react";

const AdminPortfolioExternalNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentBatch, setStudentBatch] = useState("");
  const [studentReview, setStudentReview] = useState("");
  const [studentPhoto, setStudentPhoto] = useState<PortfolioImage | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<PortfolioImage | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [behanceUrl, setBehanceUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");

  const [technologies, setTechnologies] = useState("");
  const [tags, setTags] = useState("");
  const [publishNow, setPublishNow] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    coursesApi
      .getAll()
      .then(setCourses)
      .catch(() => {
        toast({ title: "Could not load courses", variant: "destructive" });
      })
      .finally(() => setCoursesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await adminPortfolioApi.uploadImage(file);
      setStudentPhoto(res.data);
    } catch (err: any) {
      toast({ title: "Photo upload failed", description: err?.message, variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const res = await adminPortfolioApi.uploadImage(file);
      setThumbnail(res.data);
    } catch (err: any) {
      toast({ title: "Thumbnail upload failed", description: err?.message, variant: "destructive" });
    } finally {
      setUploadingThumbnail(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      toast({ title: "Student name is required", variant: "destructive" });
      return;
    }
    if (!course) {
      toast({ title: "Please select a course", variant: "destructive" });
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast({ title: "Project title and description are required", variant: "destructive" });
      return;
    }

    const payload: ExternalPortfolioPayload = {
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim() || undefined,
      studentBatch: studentBatch.trim() || undefined,
      studentPhoto: studentPhoto || undefined,
      studentReview: studentReview.trim() || undefined,
      course,
      title: title.trim(),
      description: description.trim(),
      thumbnail: thumbnail || undefined,
      githubUrl: githubUrl.trim() || undefined,
      liveUrl: liveUrl.trim() || undefined,
      figmaUrl: figmaUrl.trim() || undefined,
      behanceUrl: behanceUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      driveUrl: driveUrl.trim() || undefined,
      technologies: technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      publish: publishNow,
    };

    setSaving(true);
    try {
      const res = await adminPortfolioApi.createExternal(payload);
      toast({ title: "Portfolio created", description: `"${res.data.title}" was saved successfully.` });
      navigate(`/admin/portfolio/${res.data._id}`);
    } catch (err: any) {
      toast({
        title: "Could not create portfolio",
        description: err?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Add External Student Portfolio"
      subtitle="Add a project for a former or external student, including their photo and review."
      actions={
        <Button variant="outline" onClick={() => navigate("/admin/portfolio")} className="gap-2">
          <ArrowLeft size={16} />
          Back to list
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Student info ── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Student Info</h3>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email (optional)</label>
              <Input
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="priya@example.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Batch (optional)</label>
              <Input
                value={studentBatch}
                onChange={(e) => setStudentBatch(e.target.value)}
                placeholder="e.g. 2023 Batch"
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Student Photo</label>
              <div className="mt-1.5 flex items-center gap-3">
                {studentPhoto?.url ? (
                  <div className="relative">
                    <img
                      src={studentPhoto.url}
                      alt="Student"
                      className="h-14 w-14 rounded-full object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => setStudentPhoto(null)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-xs text-muted-foreground">
                    None
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary/60">
                    {uploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Upload
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Student Review</label>
              <Textarea
                value={studentReview}
                onChange={(e) => setStudentReview(e.target.value)}
                placeholder="Testimonial from the student…"
                rows={4}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* ── Project info ── */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">Project Info</h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Course *</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={coursesLoading}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">{coursesLoading ? "Loading…" : "Select a course"}</option>
                {courses.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Thumbnail</label>
              <div className="mt-1.5 flex items-center gap-3">
                {thumbnail?.url ? (
                  <div className="relative">
                    <img src={thumbnail.url} alt="Thumbnail" className="h-14 w-20 rounded-md object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => setThumbnail(null)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-14 w-20 items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground">
                    None
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary/60">
                    {uploadingThumbnail ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Upload
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Project Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Description *</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1.5" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">GitHub URL</label>
              <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Live URL</label>
              <Input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Figma URL</label>
              <Input value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Behance URL</label>
              <Input value={behanceUrl} onChange={(e) => setBehanceUrl(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Video URL</label>
              <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Drive URL</label>
              <Input value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} className="mt-1.5" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Technologies (comma-separated)</label>
              <Input value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, Figma" className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="UI, Portfolio" className="mt-1.5" />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
            Publish immediately (otherwise saved as draft)
          </label>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="mt-5 gap-2 text-white bg-[#0037FF] hover:bg-[#0037FF]/90"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {publishNow ? "Create & Publish" : "Save as Draft"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPortfolioExternalNew;