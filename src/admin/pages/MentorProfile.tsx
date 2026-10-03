import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, X, Upload, Loader2, Globe,
  ExternalLink, Save, EyeOff, Eye, AlertTriangle,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


const API_BASE = import.meta.env.VITE_API_BASE;

const authHeaders = (json = true): HeadersInit => {
  const token = localStorage.getItem("token");
  const h: Record<string, string> = {};
  if (json) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

// ─── Types (mirrors backend MentorProfile schema) ─────────────────────────────
interface MentorUser {
  _id: string;
  fullName: string;
  email: string;
  photoUrl?: string;
  designation?: string;
  company?: string;
  slug?: string;
}

interface CareerMilestone {
  period: string;
  title: string;
  company: string;
  description: string;
}

interface FeaturedProject {
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  link: string;
}

interface ToolkitCategory {
  label: string;
  tools: string[];
}

interface Toolkit {
  title: string;
  subtitle: string;
  categories: ToolkitCategory[];
}

interface Testimonial {
  name: string;
  designation: string;
  image: string;
  imagePublicId: string;
  review: string;
}

interface CourseItem {
  title: string;
  description: string;
  image: string;
  imagePublicId: string;
  duration: string;
  students: string;
  price: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SEO {
  title: string;
  description: string;
  keywords: string[];
}

interface MentorProfileData {
  heroImage: string;
  heroImagePublicId: string;
  description: string;
  experience: string;
  studentsCountLabel: string;
  projects: string;
  ratingLabel: string;
  languages: string;
  status: string;
  about: string[];
  expertise: string[];
  careerMilestones: CareerMilestone[];
  featuredProjects: FeaturedProject[];
  artStationUrl: string;
  toolkit: Toolkit | null;
  testimonials: Testimonial[];
  courses: CourseItem[];
  faqs: FAQItem[];
  seo: SEO;
  isPublished: boolean;
}

const DEFAULT_PROFILE: MentorProfileData = {
  heroImage: "",
  heroImagePublicId: "",
  description: "",
  experience: "",
  studentsCountLabel: "",
  projects: "",
  ratingLabel: "",
  languages: "",
  status: "Available",
  about: [],
  expertise: [],
  careerMilestones: [],
  featuredProjects: [],
  artStationUrl: "",
  toolkit: null,
  testimonials: [],
  courses: [],
  faqs: [],
  seo: { title: "", description: "", keywords: [] },
  isPublished: false,
};

const TABS = [
  { id: "hero", label: "Hero Section" },
  { id: "about", label: "About & Expertise" },
  { id: "milestones", label: "Career Milestones" },
  { id: "projects", label: "Featured Projects" },
  { id: "toolkit", label: "Toolkit" },
  { id: "testimonials", label: "Testimonials" },
  { id: "courses", label: "Courses" },
  { id: "faqs", label: "FAQ" },
  { id: "seo", label: "SEO" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Which top-level MentorProfileData keys each tab is allowed to save.
// This is what makes "save any section independently" safe — a tab's
// Save button only ever sends its own fields, nothing else.
const TAB_FIELD_MAP: Record<TabId, (keyof MentorProfileData)[]> = {
  hero: [
    "heroImage", "heroImagePublicId", "description", "experience",
    "studentsCountLabel", "projects", "ratingLabel", "languages", "status",
  ],
  about: ["about", "expertise"],
  milestones: ["careerMilestones"],
  projects: ["featuredProjects", "artStationUrl"],
  toolkit: ["toolkit"],
  testimonials: ["testimonials"],
  courses: ["courses"],
  faqs: ["faqs"],
  seo: ["seo"],
};

// ─── Small shared helper: upload a single image, returns {url, publicId} ──────
const uploadImageFile = async (file: File): Promise<{ url: string; publicId: string } | null> => {
  const fd = new FormData();
  fd.append("image", file);
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/admin/mentor-profile/upload-image`, {
    method: "POST",
    headers,
    body: fd,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    toast.error(data.message || "Image upload failed");
    return null;
  }
  return data.data;
};

// ─── Reusable UI atoms ─────────────────────────────────────────────────────────

const Field = ({
  label, id, hint, children,
}: { label: string; id: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

const RepeaterCard = ({
  onRemove, children,
}: { onRemove: () => void; children: React.ReactNode }) => (
  <div className="relative rounded-xl border border-border bg-secondary/20 p-4 pr-10 space-y-3">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
      title="Remove"
    >
      <Trash2 size={14} />
    </button>
    {children}
  </div>
);

const ImageUploader = ({
  value, onChange, label,
}: { value: string; onChange: (url: string, publicId: string) => void; label?: string }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadImageFile(file);
    setUploading(false);
    if (result) onChange(result.url, result.publicId);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      {label && <Label className="text-xs font-medium">{label}</Label>}
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img src={value} className="h-16 w-16 rounded-lg object-cover border border-border" />
            <button
              type="button"
              onClick={() => onChange("", "")}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
            <Upload size={16} />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
          {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        </Button>
      </div>
    </div>
  );
};

const StringListEditor = ({
  label, values, onChange, placeholder,
}: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...values, draft.trim()]);
    setDraft("");
  };
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="h-9 text-sm"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus size={13} className="mr-1" /> Add
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs"
            >
              {v}
              <button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const TabSaveBar = ({ saving, onSave }: { saving: boolean; onSave: () => void }) => (
  <div className="flex justify-end pt-2">
    <Button type="button" onClick={onSave} disabled={saving} className="gap-1.5 text-white">
      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      {saving ? "Saving…" : "Save this section"}
    </Button>
  </div>
);

// ─── Main Page ──────────────────────────────────────────────────────────────────
const MentorProfilePage = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();

  const [mentorUser, setMentorUser] = useState<MentorUser | null>(null);
  const [profile, setProfile] = useState<MentorProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("hero");
  const [savingTab, setSavingTab] = useState<TabId | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    if (!mentorId) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`${API_BASE}/api/admin/mentor-profile/${mentorId}`, {
        headers: authHeaders(false),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotFound(true);
        return;
      }
      const payload = data.data;
      setMentorUser(payload.mentor);
      if (payload.isNew) {
        setProfile(DEFAULT_PROFILE);
      } else {
        setProfile({ ...DEFAULT_PROFILE, ...payload });
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [mentorId]);

  // ── Save one tab's fields ────────────────────────────────────────────────
  const saveTab = async (tabId: TabId) => {
    if (!mentorId) return;
    setSavingTab(tabId);
    try {
      const keys = TAB_FIELD_MAP[tabId];
      const payload: Record<string, unknown> = {};
      keys.forEach((k) => { payload[k] = profile[k]; });

      const res = await fetch(`${API_BASE}/api/admin/mentor-profile/${mentorId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to save section");
        return;
      }
      setProfile((prev) => ({ ...prev, ...data.data }));
      toast.success(`${TABS.find((t) => t.id === tabId)?.label} saved`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingTab(null);
    }
  };

  // ── Publish toggle ───────────────────────────────────────────────────────
  const togglePublish = async () => {
    if (!mentorId) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/mentor-profile/${mentorId}/publish`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ isPublished: !profile.isPublished }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to update publish status");
        return;
      }
      setProfile((prev) => ({ ...prev, isPublished: data.data.isPublished }));
      toast.success(data.data.isPublished ? "Profile published — now live" : "Profile unpublished");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  // ── Danger zone: wipe all CMS data ───────────────────────────────────────
  const deleteProfile = async () => {
    if (!mentorId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/mentor-profile/${mentorId}`, {
        method: "DELETE",
        headers: authHeaders(false),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to delete profile data");
        return;
      }
      toast.success("All detail-page data removed");
      setProfile(DEFAULT_PROFILE);
      setConfirmDelete(false);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Generic array helpers on `profile` (used by milestones/projects/etc.) ──
  const setField = <K extends keyof MentorProfileData>(key: K, value: MentorProfileData[K]) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const addItem = <K extends "careerMilestones" | "featuredProjects" | "testimonials" | "courses" | "faqs">(
    key: K,
    empty: MentorProfileData[K][number]
  ) => setProfile((prev) => ({ ...prev, [key]: [...(prev[key] as any[]), empty] }));

  const updateItem = <K extends "careerMilestones" | "featuredProjects" | "testimonials" | "courses" | "faqs">(
    key: K,
    index: number,
    patch: Partial<MentorProfileData[K][number]>
  ) =>
    setProfile((prev) => {
      const arr = [...(prev[key] as any[])];
      arr[index] = { ...arr[index], ...patch };
      return { ...prev, [key]: arr };
    });

  const removeItem = <K extends "careerMilestones" | "featuredProjects" | "testimonials" | "courses" | "faqs">(
    key: K,
    index: number
  ) =>
    setProfile((prev) => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((_, i) => i !== index),
    }));

  // ── Toolkit nested helpers ───────────────────────────────────────────────
  const enableToolkit = () =>
    setProfile((prev) => ({
      ...prev,
      toolkit: prev.toolkit ?? { title: "The Toolkit", subtitle: "", categories: [] },
    }));

  const removeToolkitSection = () => setProfile((prev) => ({ ...prev, toolkit: null }));

  const updateToolkitMeta = (patch: Partial<Pick<Toolkit, "title" | "subtitle">>) =>
    setProfile((prev) => (prev.toolkit ? { ...prev, toolkit: { ...prev.toolkit, ...patch } } : prev));

  const addToolkitCategory = () =>
    setProfile((prev) =>
      prev.toolkit
        ? { ...prev, toolkit: { ...prev.toolkit, categories: [...prev.toolkit.categories, { label: "", tools: [] }] } }
        : prev
    );

  const updateToolkitCategory = (index: number, patch: Partial<ToolkitCategory>) =>
    setProfile((prev) => {
      if (!prev.toolkit) return prev;
      const categories = [...prev.toolkit.categories];
      categories[index] = { ...categories[index], ...patch };
      return { ...prev, toolkit: { ...prev.toolkit, categories } };
    });

  const removeToolkitCategory = (index: number) =>
    setProfile((prev) => {
      if (!prev.toolkit) return prev;
      return { ...prev, toolkit: { ...prev.toolkit, categories: prev.toolkit.categories.filter((_, i) => i !== index) } };
    });

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout title="Mentor Detail Page" subtitle="Loading…">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (notFound || !mentorUser) {
    return (
      <AdminLayout title="Mentor Detail Page" subtitle="">
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <AlertTriangle size={26} className="text-destructive" />
          <p className="text-sm text-destructive">Mentor not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/teachers")}>
            Back to Teachers
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Mentor Detail Page"
      subtitle="Manage the full public detail-page content for this mentor. Save any section independently."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/teachers")} className="gap-1.5">
            <ArrowLeft size={14} /> Back
          </Button>
          <Button
            size="sm"
            onClick={togglePublish}
            disabled={publishing}
            className={`gap-1.5 text-white ${profile.isPublished ? "bg-amber-500 hover:bg-amber-600" : ""}`}
          >
            {publishing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : profile.isPublished ? (
              <EyeOff size={14} />
            ) : (
              <Eye size={14} />
            )}
            {profile.isPublished ? "Unpublish" : "Publish"}
          </Button>
        </div>
      }
    >
      {/* Mentor identity strip */}
      <div className="mb-5 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        {mentorUser.photoUrl ? (
          <img src={mentorUser.photoUrl} className="h-14 w-14 rounded-full object-cover ring-2 ring-border" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
            {mentorUser.fullName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{mentorUser.fullName}</div>
          <div className="text-xs text-muted-foreground">{mentorUser.email}</div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            profile.isPublished
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <Globe size={11} />
          {profile.isPublished ? "Live" : "Draft"}
        </span>
        {profile.isPublished && mentorUser.slug && (
          <Link
            to={`/mentors/${mentorUser.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View live page <ExternalLink size={12} />
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5 rounded-xl border border-border bg-secondary/30 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {/* ── TAB: Hero Section ────────────────────────────────────────────── */}
        {activeTab === "hero" && (
          <div className="space-y-4">
            <ImageUploader
              label="Hero image"
              value={profile.heroImage}
              onChange={(url, publicId) => {
                setField("heroImage", url);
                setField("heroImagePublicId", publicId);
              }}
            />
            <Field label="Tagline / description" id="hero-desc">
              <textarea
                id="hero-desc"
                rows={2}
                value={profile.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Short tagline shown under the mentor's name on the hero section…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience" id="hero-exp">
                <Input id="hero-exp" value={profile.experience} onChange={(e) => setField("experience", e.target.value)} placeholder="8+ Years" className="h-9 text-sm" />
              </Field>
              <Field label="Students count label" id="hero-students">
                <Input id="hero-students" value={profile.studentsCountLabel} onChange={(e) => setField("studentsCountLabel", e.target.value)} placeholder="1200" className="h-9 text-sm" />
              </Field>
              <Field label="Projects" id="hero-projects">
                <Input id="hero-projects" value={profile.projects} onChange={(e) => setField("projects", e.target.value)} placeholder="150+" className="h-9 text-sm" />
              </Field>
              <Field label="Rating label" id="hero-rating">
                <Input id="hero-rating" value={profile.ratingLabel} onChange={(e) => setField("ratingLabel", e.target.value)} placeholder="5.0" className="h-9 text-sm" />
              </Field>
              <Field label="Languages" id="hero-lang">
                <Input id="hero-lang" value={profile.languages} onChange={(e) => setField("languages", e.target.value)} placeholder="English, Hindi" className="h-9 text-sm" />
              </Field>
              <Field label="Status" id="hero-status">
                <Input id="hero-status" value={profile.status} onChange={(e) => setField("status", e.target.value)} placeholder="Available" className="h-9 text-sm" />
              </Field>
            </div>
            <TabSaveBar saving={savingTab === "hero"} onSave={() => saveTab("hero")} />
          </div>
        )}

        {/* ── TAB: About & Expertise ───────────────────────────────────────── */}
        {activeTab === "about" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-medium">About paragraphs</Label>
              {profile.about.map((para, i) => (
                <RepeaterCard key={i} onRemove={() => setField("about", profile.about.filter((_, idx) => idx !== i))}>
                  <textarea
                    rows={3}
                    value={para}
                    onChange={(e) => {
                      const next = [...profile.about];
                      next[i] = e.target.value;
                      setField("about", next);
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </RepeaterCard>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setField("about", [...profile.about, ""])} className="gap-1.5">
                <Plus size={13} /> Add paragraph
              </Button>
            </div>

            <StringListEditor
              label="Expertise tags"
              values={profile.expertise}
              onChange={(v) => setField("expertise", v)}
              placeholder="e.g. Blender, 3D Modeling"
            />

            <TabSaveBar saving={savingTab === "about"} onSave={() => saveTab("about")} />
          </div>
        )}

        {/* ── TAB: Career Milestones ───────────────────────────────────────── */}
        {activeTab === "milestones" && (
          <div className="space-y-4">
            {profile.careerMilestones.map((m, i) => (
              <RepeaterCard key={i} onRemove={() => removeItem("careerMilestones", i)}>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Period (e.g. 2021 — Present)" value={m.period} onChange={(e) => updateItem("careerMilestones", i, { period: e.target.value })} className="h-9 text-sm" />
                  <Input placeholder="Title" value={m.title} onChange={(e) => updateItem("careerMilestones", i, { title: e.target.value })} className="h-9 text-sm" />
                  <Input placeholder="Company" value={m.company} onChange={(e) => updateItem("careerMilestones", i, { company: e.target.value })} className="h-9 text-sm col-span-2" />
                </div>
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={m.description}
                  onChange={(e) => updateItem("careerMilestones", i, { description: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </RepeaterCard>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => addItem("careerMilestones", { period: "", title: "", company: "", description: "" })}
            >
              <Plus size={13} /> Add milestone
            </Button>
            <TabSaveBar saving={savingTab === "milestones"} onSave={() => saveTab("milestones")} />
          </div>
        )}

        {/* ── TAB: Featured Projects ───────────────────────────────────────── */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <Field label="ArtStation / portfolio URL" id="artstation">
              <Input id="artstation" value={profile.artStationUrl} onChange={(e) => setField("artStationUrl", e.target.value)} placeholder="https://artstation.com/…" className="h-9 text-sm" />
            </Field>

            {profile.featuredProjects.map((p, i) => (
              <RepeaterCard key={i} onRemove={() => removeItem("featuredProjects", i)}>
                <ImageUploader
                  value={p.imageUrl}
                  onChange={(url, publicId) => updateItem("featuredProjects", i, { imageUrl: url, imagePublicId: publicId })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Category" value={p.category} onChange={(e) => updateItem("featuredProjects", i, { category: e.target.value })} className="h-9 text-sm" />
                  <Input placeholder="Title" value={p.title} onChange={(e) => updateItem("featuredProjects", i, { title: e.target.value })} className="h-9 text-sm" />
                </div>
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={p.description}
                  onChange={(e) => updateItem("featuredProjects", i, { description: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Input placeholder="External link (optional — e.g. YouTube)" value={p.link} onChange={(e) => updateItem("featuredProjects", i, { link: e.target.value })} className="h-9 text-sm" />
              </RepeaterCard>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => addItem("featuredProjects", { category: "", title: "", description: "", imageUrl: "", imagePublicId: "", link: "" })}
            >
              <Plus size={13} /> Add project
            </Button>
            <TabSaveBar saving={savingTab === "projects"} onSave={() => saveTab("projects")} />
          </div>
        )}

        {/* ── TAB: Toolkit ─────────────────────────────────────────────────── */}
        {activeTab === "toolkit" && (
          <div className="space-y-4">
            {!profile.toolkit ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
                <p className="text-sm">No toolkit section yet for this mentor.</p>
                <Button type="button" size="sm" onClick={enableToolkit} className="gap-1.5">
                  <Plus size={13} /> Enable toolkit section
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Section title" id="toolkit-title">
                    <Input id="toolkit-title" value={profile.toolkit.title} onChange={(e) => updateToolkitMeta({ title: e.target.value })} className="h-9 text-sm" />
                  </Field>
                  <Field label="Subtitle" id="toolkit-subtitle">
                    <Input id="toolkit-subtitle" value={profile.toolkit.subtitle} onChange={(e) => updateToolkitMeta({ subtitle: e.target.value })} className="h-9 text-sm" />
                  </Field>
                </div>

                {profile.toolkit.categories.map((cat, i) => (
                  <RepeaterCard key={i} onRemove={() => removeToolkitCategory(i)}>
                    <Input
                      placeholder="Category label (optional — leave blank for a single flat row)"
                      value={cat.label}
                      onChange={(e) => updateToolkitCategory(i, { label: e.target.value })}
                      className="h-9 text-sm"
                    />
                    <StringListEditor
                      label="Tools"
                      values={cat.tools}
                      onChange={(v) => updateToolkitCategory(i, { tools: v })}
                      placeholder="e.g. Figma"
                    />
                  </RepeaterCard>
                ))}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={addToolkitCategory} className="gap-1.5">
                    <Plus size={13} /> Add category
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={removeToolkitSection} className="text-destructive gap-1.5">
                    <Trash2 size={13} /> Remove entire toolkit section
                  </Button>
                </div>
              </>
            )}
            <TabSaveBar saving={savingTab === "toolkit"} onSave={() => saveTab("toolkit")} />
          </div>
        )}

        {/* ── TAB: Testimonials ────────────────────────────────────────────── */}
        {activeTab === "testimonials" && (
          <div className="space-y-4">
            {profile.testimonials.map((t, i) => (
              <RepeaterCard key={i} onRemove={() => removeItem("testimonials", i)}>
                <ImageUploader value={t.image} onChange={(url, publicId) => updateItem("testimonials", i, { image: url, imagePublicId: publicId })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Name" value={t.name} onChange={(e) => updateItem("testimonials", i, { name: e.target.value })} className="h-9 text-sm" />
                  <Input placeholder="Designation" value={t.designation} onChange={(e) => updateItem("testimonials", i, { designation: e.target.value })} className="h-9 text-sm" />
                </div>
                <textarea
                  rows={3}
                  placeholder="Review text"
                  value={t.review}
                  onChange={(e) => updateItem("testimonials", i, { review: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </RepeaterCard>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => addItem("testimonials", { name: "", designation: "", image: "", imagePublicId: "", review: "" })}
            >
              <Plus size={13} /> Add testimonial
            </Button>
            <TabSaveBar saving={savingTab === "testimonials"} onSave={() => saveTab("testimonials")} />
          </div>
        )}

        {/* ── TAB: Courses ─────────────────────────────────────────────────── */}
        {activeTab === "courses" && (
          <div className="space-y-4">
            {profile.courses.map((c, i) => (
              <RepeaterCard key={i} onRemove={() => removeItem("courses", i)}>
                <ImageUploader value={c.image} onChange={(url, publicId) => updateItem("courses", i, { image: url, imagePublicId: publicId })} />
                <Input placeholder="Course title" value={c.title} onChange={(e) => updateItem("courses", i, { title: e.target.value })} className="h-9 text-sm" />
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={c.description}
                  onChange={(e) => updateItem("courses", i, { description: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="Duration (e.g. 14 Weeks)" value={c.duration} onChange={(e) => updateItem("courses", i, { duration: e.target.value })} className="h-9 text-sm" />
                  <Input placeholder="Students (e.g. 850 students)" value={c.students} onChange={(e) => updateItem("courses", i, { students: e.target.value })} className="h-9 text-sm" />
                  <Input placeholder="Price (e.g. $599)" value={c.price} onChange={(e) => updateItem("courses", i, { price: e.target.value })} className="h-9 text-sm" />
                </div>
              </RepeaterCard>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => addItem("courses", { title: "", description: "", image: "", imagePublicId: "", duration: "", students: "", price: "" })}
            >
              <Plus size={13} /> Add course
            </Button>
            <TabSaveBar saving={savingTab === "courses"} onSave={() => saveTab("courses")} />
          </div>
        )}

        {/* ── TAB: FAQ ─────────────────────────────────────────────────────── */}
        {activeTab === "faqs" && (
          <div className="space-y-4">
            {profile.faqs.map((f, i) => (
              <RepeaterCard key={i} onRemove={() => removeItem("faqs", i)}>
                <Input placeholder="Question" value={f.question} onChange={(e) => updateItem("faqs", i, { question: e.target.value })} className="h-9 text-sm" />
                <textarea
                  rows={2}
                  placeholder="Answer"
                  value={f.answer}
                  onChange={(e) => updateItem("faqs", i, { answer: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </RepeaterCard>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => addItem("faqs", { question: "", answer: "" })}
            >
              <Plus size={13} /> Add FAQ
            </Button>
            <TabSaveBar saving={savingTab === "faqs"} onSave={() => saveTab("faqs")} />
          </div>
        )}

        {/* ── TAB: SEO ─────────────────────────────────────────────────────── */}
        {activeTab === "seo" && (
          <div className="space-y-4">
            <Field label="Meta title" id="seo-title">
              <Input id="seo-title" value={profile.seo.title} onChange={(e) => setField("seo", { ...profile.seo, title: e.target.value })} className="h-9 text-sm" />
            </Field>
            <Field label="Meta description" id="seo-desc">
              <textarea
                id="seo-desc"
                rows={3}
                value={profile.seo.description}
                onChange={(e) => setField("seo", { ...profile.seo, description: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>  
            <StringListEditor
              label="Keywords"
              values={profile.seo.keywords}
              onChange={(v) => setField("seo", { ...profile.seo, keywords: v })}
              placeholder="e.g. blender mentor delhi"
            />
            <TabSaveBar saving={savingTab === "seo"} onSave={() => saveTab("seo")} />
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
          <AlertTriangle size={14} /> Danger zone
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          This permanently removes all detail-page content for this mentor (hero, about, milestones, projects, toolkit, testimonials, courses, FAQs). The mentor's basic Teachers-page profile is not affected.
        </p>
        {!confirmDelete ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => setConfirmDelete(true)}
          >
            Delete all detail-page data
          </Button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <Button type="button" size="sm" variant="destructive" onClick={deleteProfile} disabled={deleting}>
              {deleting ? "Deleting…" : "Yes, delete everything"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MentorProfilePage;