import { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus, BookOpen, Pencil, Trash2, X, Upload,
  ImageIcon, Loader2, Eye, EyeOff, RefreshCw,
  ChevronRight, ChevronLeft, Link, Star, Users, Award, Briefcase,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import StatusBadge from "../components/StatusBadge";
import { parseApiError, ApiError } from "@/lib/apiError";

// ─── API ───────────────────────────────────────────────────────────────────────
const BASE = (import.meta.env.VITE_API_BASE ?? "https://deepscode-backend-end.onrender.com") + "/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

// async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
//   const token = getToken();
//   const headers: Record<string, string> = { ...((init?.headers as Record<string, string>) ?? {}) };
//   if (token) headers["Authorization"] = `Bearer ${token}`;
//   const res  = await fetch(`${BASE}${path}`, { ...init, headers });
//   const json = await res.json();
//   if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
//   return json;
// }


async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { ...((init?.headers as Record<string, string>) ?? {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0, "NETWORK_ERROR");
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw parseApiError(json, res.status);
  return json;
}
// ─── Types ─────────────────────────────────────────────────────────────────────
interface RoadmapLevel {
  title: string; duration: string; description: string;
  schedule: string; modules: string[]; ctaLabel: string;
  ctaFileUrl: string | null; // ← correct field name (matches backend schema)
}
interface PortfolioProject { title: string; description: string }
interface Faq               { question: string; answer: string }
interface Certification     { provider: string; title: string; description: string }
interface Pricing           { price: number; discountPrice: number; currency: string }
interface Publishing        { isPublished: boolean; isFeatured: boolean; displayOrder: number }
interface Seo               { title: string; description: string; canonical: string }
interface Downloads         { syllabusPdf: string }
// ── NEW: matches backend statsSchema / placementSchema ─────────────────────────
interface Stats {
  rating: number; reviewCount: number; studentCount: number; projectCount: number;
}
interface Placement {
  hasPlacementSupport: boolean; hasCertificate: boolean; hiringPartners: string[];
}

export interface AdminCourse {
  _id: string; title: string; slug: string; shortDescription: string;
  heroTitle: string; heroDescription: string; overview: string;
  category: string; level: string; duration: string; tag: string; thumbnail: string;
  // NEW: delivery fields
  mode: string; schedule: string; durationWeeks: number | null;
  highlights: string[]; whatsIncluded: string[]; toolsCovered: string[];
  learningOutcomes: string[]; careerOpportunities: string[];
  roadmap: RoadmapLevel[]; portfolioProjects: PortfolioProject[];
  faqs: Faq[]; certification: Certification;
  publishing: Publishing; pricing: Pricing; seo: Seo; downloads: Downloads;
  // NEW: stats & placement
  stats: Stats; placement: Placement;
  createdAt: string;
}

interface FormState {
  title: string; slug: string; shortDescription: string;
  heroTitle: string; heroDescription: string; overview: string;
  category: string; level: string; duration: string; tag: string; thumbnail: string;
  // NEW: delivery fields
  mode: string; schedule: string; durationWeeks: number | null;
  highlights: string[]; whatsIncluded: string[]; toolsCovered: string[];
  learningOutcomes: string[]; careerOpportunities: string[];
  roadmap: RoadmapLevel[]; portfolioProjects: PortfolioProject[];
  faqs: Faq[]; certification: Certification;
  publishing: Publishing; pricing: Pricing; seo: Seo; downloads: Downloads;
  // NEW: stats & placement
  stats: Stats; placement: Placement;
}

// NEW: mirrors backend MODES / SCHEDULES enums
const MODES     = ["Online", "Offline", "Hybrid"];
const SCHEDULES = ["Weekday", "Weekend", "Flexible"];

const EMPTY: FormState = {
  title: "", slug: "", shortDescription: "",
  heroTitle: "", heroDescription: "", overview: "",
  category: "Design", level: "Beginner", duration: "", tag: "Beginner", thumbnail: "",
  mode: "", schedule: "", durationWeeks: null,
  highlights: [], whatsIncluded: [], toolsCovered: [],
  learningOutcomes: [], careerOpportunities: [],
  roadmap: [], portfolioProjects: [], faqs: [],
  certification: { provider: "", title: "", description: "" },
  pricing: { price: 0, discountPrice: 0, currency: "INR" },
  publishing: { isPublished: false, isFeatured: false, displayOrder: 0 },
  seo: { title: "", description: "", canonical: "" },
  downloads: { syllabusPdf: "" },
  stats: { rating: 0, reviewCount: 0, studentCount: 0, projectCount: 0 },
  placement: { hasPlacementSupport: false, hasCertificate: false, hiringPartners: [] },
};

const CATS = ["Design", "3D", "Marketing", "Data", "Tech"];
const LVLS  = ["Beginner", "Intermediate", "Advanced"];
const TAGS  = ["Beginner", "Intermediate", "Advanced", "Quick Skill"];
const GRADS: Record<string, string> = {
  Design: "from-pink-500 to-rose-500",
  "3D"  : "from-blue-500 to-indigo-500",
  Marketing: "from-orange-500 to-orange-600",
  Data  : "from-emerald-500 to-teal-500",
  "Tech": "from-slate-700 to-gray-900",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

const inp = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";
const lbl = "block text-xs font-medium text-muted-foreground mb-1";

// ─── Tag chip input ────────────────────────────────────────────────────────────
function TagInput({ values, onChange, placeholder }: {
  values: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const [inp2, setInp] = useState("");
  const add = () => {
    const v = inp2.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInp("");
  };
  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[42px] px-2 py-1.5 border border-border rounded-lg bg-background cursor-text"
      onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}
    >
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 bg-[#0037FF]/10 text-[#0037FF] text-xs px-2 py-0.5 rounded-md font-medium">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:text-destructive leading-none ml-0.5">×</button>
        </span>
      ))}
      <input
        value={inp2}
        onChange={(e) => setInp(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={values.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}

// ─── Thumbnail uploader ────────────────────────────────────────────────────────
function ThumbnailUploader({ preview, gradient, onFile, onUrl, onClear }: {
  preview: string | null; gradient: string;
  onFile: (f: File, url: string) => void;
  onUrl: (url: string) => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [urlVal, setUrlVal] = useState("");
  const [urlErr, setUrlErr] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    onFile(f, URL.createObjectURL(f)); setUrlVal("");
  };
  const applyUrl = () => {
    const u = urlVal.trim();
    if (!u) { setUrlErr("URL required"); return; }
    try { new URL(u); } catch { setUrlErr("Enter a valid URL"); return; }
    setUrlErr(""); onUrl(u);
  };

  return (
    <div>
      <label className={lbl}>Thumbnail image</label>
      <div className="flex gap-1 mb-2 p-1 bg-secondary rounded-lg w-fit">
        {(["file","url"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === m ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {m === "file" ? <><Upload size={11} /> Upload file</> : <><Link size={11} /> Paste URL</>}
          </button>
        ))}
      </div>

      <div onClick={() => mode === "file" && fileRef.current?.click()}
        className={`relative h-40 w-full rounded-xl overflow-hidden border-2 border-dashed border-border transition-colors ${mode === "file" ? "cursor-pointer hover:border-primary" : ""}`}>
        {preview
          ? <img src={preview} alt="thumb" className="h-full w-full object-cover" />
          : <div className={`h-full w-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
              <ImageIcon size={26} className="text-white/60" />
              <span className="text-xs text-white/60">{mode === "file" ? "Click to upload" : "Preview here"}</span>
            </div>
        }
        {mode === "file" && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Upload size={18} className="text-white" /><span className="ml-2 text-white text-sm">{preview ? "Change" : "Upload"}</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {mode === "url" && (
        <div className="mt-2 flex gap-2">
          <input value={urlVal} onChange={(e) => { setUrlVal(e.target.value); setUrlErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && applyUrl()}
            placeholder="https://res.cloudinary.com/..."
            className={inp} />
          <button type="button" onClick={applyUrl}
            className="px-4 rounded-lg bg-[#0037FF] text-[#0037FF]-foreground text-sm font-medium hover:bg-[#0037FF]/90 transition-colors">
            Use
          </button>
        </div>
      )}
      {urlErr && <p className="mt-1 text-xs text-destructive">{urlErr}</p>}
      {preview && (
        <button type="button" onClick={() => { onClear(); setUrlVal(""); setUrlErr(""); }}
          className="mt-1.5 text-xs text-destructive hover:underline flex items-center gap-1">
          <X size={11} /> Remove image
        </button>
      )}
    </div>
  );
}

// ─── Per-level PDF uploader ────────────────────────────────────────────────────
// Uses correct endpoint POST /api/admin/courses/:courseId/roadmap/:index/pdf
// If courseId is empty (new course not saved yet), upload is disabled.
function LevelPdfUploader({ levelIndex, currentUrl, courseId, onUploaded }: {
  levelIndex : number;
  currentUrl : string;
  courseId   : string;   // empty string when creating a new course
  onUploaded : (url: string) => void;
}) {
  const fileRef               = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr]             = useState("");

  // New course has no _id yet — PDF upload requires the course to exist first.
  const isNewCourse = !courseId;

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.type !== "application/pdf") {
      setErr("Only PDF files allowed (.pdf)");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setErr(`File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 20 MB.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setErr(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("roadmapPdf", f);   // ← field name expected by the backend route

      const token = getToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // Correct endpoint: POST /api/admin/courses/:courseId/roadmap/:index/pdf
    //   const res  = await fetch(`${BASE}/admin/courses/${courseId}/roadmap/${levelIndex}/pdf`, {
    //     method: "POST", headers, body: fd,
    //   });
    //   const json = await res.json();
    //   if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    //   if (!json.url) throw new Error("Backend did not return a URL.");

    //   onUploaded(json.url);
    // } catch (ex: unknown) {
    //   setErr((ex as Error).message);

    const res  = await fetch(`${BASE}/admin/courses/${courseId}/roadmap/${levelIndex}/pdf`, {
        method: "POST", headers, body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw parseApiError(json, res.status);
      if (!json.url) throw new Error("Backend did not return a URL.");

      onUploaded(json.url);
    } catch (ex: unknown) {
      setErr(ex instanceof ApiError ? ex.toDisplayString() : (ex as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!courseId) { onUploaded(""); return; }
    try {
      const token = getToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      await fetch(`${BASE}/admin/courses/${courseId}/roadmap/${levelIndex}/pdf`, {
        method: "DELETE", headers,
      });
      onUploaded("");
    } catch {
      onUploaded(""); // clear locally even if backend call fails
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/20 p-3">
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        📄 Level {levelIndex + 1} — CTA PDF
        <span className="font-normal text-muted-foreground/60">(Cloudinary upload)</span>
      </p>

      {/* If new course, show a warning instead of upload UI */}
      {isNewCourse ? (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          💡 Save the course first, then re-open to upload a PDF for this level.
        </p>
      ) : (
        <>
          {/* Current PDF */}
          {currentUrl ? (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 truncate rounded-md bg-background border border-border px-3 py-1.5 text-xs text-muted-foreground font-mono">
                {currentUrl}
              </div>
              <a href={currentUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#0037FF] hover:underline whitespace-nowrap">↗ Open</a>
              <button type="button" onClick={handleRemove}
                className="text-xs text-destructive hover:underline whitespace-nowrap">Remove</button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-2 italic">No PDF uploaded yet</p>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {uploading
              ? <><Loader2 size={12} className="animate-spin" /> Uploading…</>
              : <><Upload size={12} /> {currentUrl ? "Replace PDF" : "Upload PDF"}</>
            }
          </button>
          <input ref={fileRef} type="file" accept="application/pdf" onChange={handlePick} className="hidden" />
        </>
      )}

      {err && <p className="mt-1.5 text-xs text-destructive">{err}</p>}
    </div>
  );
}

// ─── Roadmap editor ────────────────────────────────────────────────────────────
// courseId passed down so LevelPdfUploader can hit the correct endpoint
function RoadmapEditor({ items, onChange, courseId }: {
  items   : RoadmapLevel[];
  onChange: (v: RoadmapLevel[]) => void;
  courseId: string;   // empty string for new (unsaved) courses
}) {
  const emptyLevel = (): RoadmapLevel => ({
    title: "", duration: "", description: "", schedule: "", modules: [],
    ctaLabel: "Download Curriculum", ctaFileUrl: null,
  });
  const upd = (i: number, p: Partial<RoadmapLevel>) => {
    const n = [...items]; n[i] = { ...n[i], ...p }; onChange(n);
  };
  return (
    <div className="space-y-3">
      {items.map((rm, i) => (
        <div key={i} className="border border-border rounded-xl p-4 bg-muted/30 relative">
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="absolute top-3 right-3 text-muted-foreground hover:text-destructive text-lg leading-none">×</button>
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Level {i + 1}</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className={lbl}>Title</label>
              <input value={rm.title} onChange={(e) => upd(i, { title: e.target.value })}
                placeholder="LEVEL 1 — PROFESSIONAL" className={inp} /></div>
            <div><label className={lbl}>Duration</label>
              <input value={rm.duration} onChange={(e) => upd(i, { duration: e.target.value })}
                placeholder="4 months" className={inp} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className={lbl}>Description</label>
              <input value={rm.description} onChange={(e) => upd(i, { description: e.target.value })}
                placeholder="From enthusiast to professional" className={inp} /></div>
            <div><label className={lbl}>Schedule</label>
              <input value={rm.schedule} onChange={(e) => upd(i, { schedule: e.target.value })}
                placeholder="3 classes/week" className={inp} /></div>
          </div>

          <div className="mb-3">
            <label className={lbl}>Modules <span className="text-muted-foreground/60">(Enter to add)</span></label>
            <TagInput values={rm.modules} onChange={(v) => upd(i, { modules: v })} placeholder="e.g., Advanced training in Figma..." />
          </div>

          <div>
            <label className={lbl}>CTA label</label>
            <input value={rm.ctaLabel} onChange={(e) => upd(i, { ctaLabel: e.target.value })}
              placeholder="Download Curriculum" className={inp} />
          </div>

          {/* Per-level PDF uploader — uses correct backend endpoint */}
          <LevelPdfUploader
            levelIndex={i}
            currentUrl={rm.ctaFileUrl ?? ""}
            courseId={courseId}
            onUploaded={(url) => upd(i, { ctaFileUrl: url || null })}
          />
        </div>
      ))}

      <button type="button" onClick={() => onChange([...items, emptyLevel()])}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground border border-dashed border-border rounded-lg px-4 py-2 hover:bg-secondary transition-colors">
        <Plus size={13} /> Add level
      </button>
    </div>
  );
}

// ─── Portfolio projects editor ─────────────────────────────────────────────────
function ProjectsEditor({ items, onChange }: { items: PortfolioProject[]; onChange: (v: PortfolioProject[]) => void }) {
  const upd = (i: number, p: Partial<PortfolioProject>) => {
    const n = [...items]; n[i] = { ...n[i], ...p }; onChange(n);
  };
  return (
    <div className="space-y-3">
      {items.map((p, i) => (
        <div key={i} className="border border-border rounded-xl p-4 bg-muted/30 relative">
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="absolute top-3 right-3 text-muted-foreground hover:text-destructive text-lg">×</button>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Title</label>
              <input value={p.title} onChange={(e) => upd(i, { title: e.target.value })}
                placeholder="e.g., End-to-End App Design" className={inp} /></div>
            <div><label className={lbl}>Description</label>
              <input value={p.description} onChange={(e) => upd(i, { description: e.target.value })}
                placeholder="Brief description" className={inp} /></div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { title: "", description: "" }])}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground border border-dashed border-border rounded-lg px-4 py-2 hover:bg-secondary transition-colors">
        <Plus size={13} /> Add project
      </button>
    </div>
  );
}

// ─── FAQ editor ────────────────────────────────────────────────────────────────
function FaqEditor({ items, onChange }: { items: Faq[]; onChange: (v: Faq[]) => void }) {
  const upd = (i: number, p: Partial<Faq>) => {
    const n = [...items]; n[i] = { ...n[i], ...p }; onChange(n);
  };
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={i} className="border border-border rounded-xl p-4 bg-muted/30 relative">
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="absolute top-3 right-3 text-muted-foreground hover:text-destructive text-lg">×</button>
          <div className="mb-3"><label className={lbl}>Question</label>
            <input value={f.question} onChange={(e) => upd(i, { question: e.target.value })}
              placeholder="e.g., Do I need prior experience?" className={inp} /></div>
          <div><label className={lbl}>Answer</label>
            <textarea value={f.answer} onChange={(e) => upd(i, { answer: e.target.value })}
              rows={2} placeholder="Answer..." className={`${inp} resize-none`} /></div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { question: "", answer: "" }])}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground border border-dashed border-border rounded-lg px-4 py-2 hover:bg-secondary transition-colors">
        <Plus size={13} /> Add FAQ
      </button>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 mt-6 first:mt-0">{children}</p>;
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
const TABS = ["Basic info", "Hero & overview", "Content", "Structure", "Stats & placement", "SEO & publish"];

function CourseModal({ editing, onClose, onSaved }: {
  editing: AdminCourse | null; onClose: () => void; onSaved: () => void;
}) {
  const toForm = (c: AdminCourse | null): FormState => c ? {
    title: c.title ?? "", slug: c.slug ?? "", shortDescription: c.shortDescription ?? "",
    heroTitle: c.heroTitle ?? "", heroDescription: c.heroDescription ?? "", overview: c.overview ?? "",
    category: c.category ?? "Design", level: c.level ?? "Beginner",
    duration: c.duration ?? "", tag: c.tag ?? "Beginner", thumbnail: c.thumbnail ?? "",
    // NEW: delivery fields
    mode: c.mode ?? "", schedule: c.schedule ?? "", durationWeeks: c.durationWeeks ?? null,
    highlights: c.highlights ?? [], whatsIncluded: c.whatsIncluded ?? [],
    toolsCovered: c.toolsCovered ?? [], learningOutcomes: c.learningOutcomes ?? [],
    careerOpportunities: c.careerOpportunities ?? [],
    roadmap: (c.roadmap ?? []).map((r) => ({
      ...r,
      // Normalise: old data may have ctaPdfUrl instead of ctaFileUrl
      ctaFileUrl: (r as RoadmapLevel & { ctaPdfUrl?: string }).ctaFileUrl
        ?? (r as RoadmapLevel & { ctaPdfUrl?: string }).ctaPdfUrl
        ?? null,
    })),
    portfolioProjects: c.portfolioProjects ?? [], faqs: c.faqs ?? [],
    certification: c.certification ?? { provider: "", title: "", description: "" },
    pricing: c.pricing ?? { price: 0, discountPrice: 0, currency: "INR" },
    publishing: c.publishing ?? { isPublished: false, isFeatured: false, displayOrder: 0 },
    seo: c.seo ?? { title: "", description: "", canonical: "" },
    downloads: c.downloads ?? { syllabusPdf: "" },
    // NEW: stats & placement
    stats: c.stats ?? { rating: 0, reviewCount: 0, studentCount: 0, projectCount: 0 },
    placement: c.placement ?? { hasPlacementSupport: false, hasCertificate: false, hiringPartners: [] },
  } : { ...EMPTY };

  const [form, setForm]       = useState<FormState>(() => toForm(editing));
  const [tab, setTab]         = useState(0);
  const [thumb, setThumb]     = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(editing?.thumbnail ?? null);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState<string | null>(null);

  // courseId is empty for new courses; filled when editing an existing one.
  // LevelPdfUploader uses this to know whether upload is possible yet.
  const courseId = editing?._id ?? "";

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.title.trim()) { setErr("Course title is required."); setTab(0); return; }
    setErr(null); setSaving(true);
    try {
      const fd = new FormData();
      const { roadmap, portfolioProjects, faqs, highlights, whatsIncluded,
              toolsCovered, learningOutcomes, careerOpportunities,
              certification, pricing, publishing, downloads, seo,
              stats, placement, durationWeeks, ...scalars } = form;

      Object.entries(scalars).forEach(([k, v]) => {
        // Backend enums for `mode` / `schedule` only allow the real option values
        // or `null` — never `""`. FormData can't carry `null`, so we simply omit
        // the field when it's unset rather than sending an empty string (which
        // Mongoose rejects with a 400 "not a valid enum value" error).
        if ((k === "mode" || k === "schedule") && !v) return;
        fd.append(k, String(v ?? ""));
      });
      // durationWeeks can be null (unset) — only send when a real number is set
      if (durationWeeks !== null && durationWeeks !== undefined) {
        fd.append("durationWeeks", String(durationWeeks));
      }
      fd.append("roadmap",             JSON.stringify(roadmap));
      fd.append("portfolioProjects",   JSON.stringify(portfolioProjects));
      fd.append("faqs",                JSON.stringify(faqs));
      fd.append("highlights",          JSON.stringify(highlights));
      fd.append("whatsIncluded",       JSON.stringify(whatsIncluded));
      fd.append("toolsCovered",        JSON.stringify(toolsCovered));
      fd.append("learningOutcomes",    JSON.stringify(learningOutcomes));
      fd.append("careerOpportunities", JSON.stringify(careerOpportunities));
      fd.append("certification",       JSON.stringify(certification));
      fd.append("pricing",             JSON.stringify(pricing));
      fd.append("publishing",          JSON.stringify(publishing));
      fd.append("downloads",           JSON.stringify(downloads));
      fd.append("seo",                 JSON.stringify(seo));
      fd.append("stats",               JSON.stringify(stats));
      fd.append("placement",           JSON.stringify(placement));
      if (thumb) fd.append("thumbnail", thumb);

      const token  = getToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const url    = editing ? `${BASE}/admin/courses/${editing._id}` : `${BASE}/admin/courses`;
      const method = editing ? "PUT" : "POST";
    //   const res    = await fetch(url, { method, headers, body: fd });
    //   const json   = await res.json();
    //   if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    //   onSaved(); onClose();
    // } catch (e: unknown) {
    //   setErr((e as Error).message);

    const res    = await fetch(url, { method, headers, body: fd });
      const json   = await res.json().catch(() => ({}));
      if (!res.ok) throw parseApiError(json, res.status);
      onSaved(); onClose();
    } catch (e: unknown) {
      setErr(e instanceof ApiError ? e.toDisplayString() : (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const grad = GRADS[form.category] ?? "from-slate-500 to-slate-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-card shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">{editing ? "Edit course" : "New course"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {tab + 1} of {TABS.length} — {TABS[tab]}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border shrink-0 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={t} type="button" onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                i === tab ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {err && (
          <div className="mx-6 mt-4 shrink-0 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{err}</div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ══ TAB 0: Basic Info ══════════════════════════════════════════════ */}
          {tab === 0 && (<>
            <ThumbnailUploader
              preview={preview} gradient={grad}
              onFile={(f, u) => { setThumb(f); setPreview(u); set("thumbnail", ""); }}
              onUrl={(u) => { setThumb(null); setPreview(u); set("thumbnail", u); }}
              onClear={() => { setThumb(null); setPreview(null); set("thumbnail", ""); }}
            />
            <div>
              <label className={lbl}>Course title *</label>
              <input value={form.title}
                onChange={(e) => { set("title", e.target.value); set("slug", toSlug(e.target.value)); }}
                placeholder="e.g., UI/UX Design" className={inp} />
            </div>
            <div>
              <label className={lbl}>Slug <span className="text-muted-foreground/60">(auto-generated, editable)</span></label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)}
                placeholder="ui-ux-design-course" className={`${inp} font-mono`} />
            </div>
            <div>
              <label className={lbl}>Short description</label>
              <textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)}
                rows={2} placeholder="e.g., Build digital experiences people fall in love with."
                className={`${inp} resize-none`} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {([
                { label: "Category", key: "category", opts: CATS },
                { label: "Level",    key: "level",    opts: LVLS },
                { label: "Tag",      key: "tag",      opts: TAGS },
              ] as const).map(({ label, key, opts }) => (
                <div key={key}>
                  <label className={lbl}>{label}</label>
                  <select value={form[key] as string} onChange={(e) => set(key, e.target.value as never)} className={inp}>
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Duration</label>
                <input value={form.duration} onChange={(e) => set("duration", e.target.value)}
                  placeholder="e.g., 16 Weeks" className={inp} />
              </div>
              <div>
                <label className={lbl}>Display order</label>
                <input type="number" min={0} value={form.publishing.displayOrder}
                  onChange={(e) => set("publishing", { ...form.publishing, displayOrder: Number(e.target.value) })}
                  className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Price (₹)</label>
                <input type="number" min={0} value={form.pricing.price}
                  onChange={(e) => set("pricing", { ...form.pricing, price: Number(e.target.value) })}
                  className={inp} />
              </div>
              <div>
                <label className={lbl}>Discount price (₹)</label>
                <input type="number" min={0} value={form.pricing.discountPrice}
                  onChange={(e) => set("pricing", { ...form.pricing, discountPrice: Number(e.target.value) })}
                  className={inp} />
              </div>
            </div>

            {/* NEW: Delivery — mode, schedule, duration in weeks */}
            <SectionHeading>Delivery</SectionHeading>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Mode</label>
                <select value={form.mode} onChange={(e) => set("mode", e.target.value)} className={inp}>
                  <option value="">Not set</option>
                  {MODES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Schedule</label>
                <select value={form.schedule} onChange={(e) => set("schedule", e.target.value)} className={inp}>
                  <option value="">Not set</option>
                  {SCHEDULES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Duration (weeks)</label>
                <input type="number" min={0} value={form.durationWeeks ?? ""}
                  onChange={(e) => set("durationWeeks", e.target.value === "" ? null : Number(e.target.value))}
                  placeholder="e.g., 16" className={inp} />
                <p className="text-xs text-muted-foreground mt-1">Powers the 0–4 / 5–8 / 9+ weeks filter on the site.</p>
              </div>
            </div>
          </>)}

          {/* ══ TAB 1: Hero & Overview ═════════════════════════════════════════ */}
          {tab === 1 && (<>
            <div>
              <label className={lbl}>Hero title</label>
              <input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)}
                placeholder="e.g., BECOME A UI/UX DESIGNER" className={inp} />
            </div>
            <div>
              <label className={lbl}>Hero description</label>
              <input value={form.heroDescription} onChange={(e) => set("heroDescription", e.target.value)}
                placeholder="e.g., Build digital experiences people fall in love with." className={inp} />
            </div>
            <div>
              <label className={lbl}>Overview</label>
              <textarea value={form.overview} onChange={(e) => set("overview", e.target.value)}
                rows={5} placeholder="e.g., Learn to design digital experiences..."
                className={`${inp} resize-none`} />
            </div>
            <div>
              <label className={lbl}>Highlights <span className="text-muted-foreground/60">(press Enter)</span></label>
              <TagInput values={form.highlights} onChange={(v) => set("highlights", v)} placeholder="16 Weeks" />
            </div>
            <div>
              <label className={lbl}>Career opportunities <span className="text-muted-foreground/60">(press Enter)</span></label>
              <TagInput values={form.careerOpportunities} onChange={(v) => set("careerOpportunities", v)}
                placeholder="e.g., UI Designer..." />
            </div>
          </>)}

          {/* ══ TAB 2: Content ═════════════════════════════════════════════════ */}
          {tab === 2 && (<>
            <div>
              <label className={lbl}>What's included <span className="text-muted-foreground/60">(press Enter)</span></label>
              <TagInput values={form.whatsIncluded} onChange={(v) => set("whatsIncluded", v)}
                placeholder="e.g., UI design..." />
            </div>
            <div>
              <label className={lbl}>Tools covered <span className="text-muted-foreground/60">(press Enter)</span></label>
              <TagInput values={form.toolsCovered} onChange={(v) => set("toolsCovered", v)}
                placeholder="e.g., Figma, ChatGPT..." />
            </div>
            <div>
              <label className={lbl}>Learning outcomes <span className="text-muted-foreground/60">(press Enter)</span></label>
              <TagInput values={form.learningOutcomes} onChange={(v) => set("learningOutcomes", v)}
                placeholder="e.g., End-to-end ability to design..." />
            </div>
          </>)}

          {/* ══ TAB 3: Structure ═══════════════════════════════════════════════ */}
          {tab === 3 && (<>
            <SectionHeading>Roadmap levels</SectionHeading>
            {/* Show amber notice when creating a new course */}
            {!courseId && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 -mt-2 mb-2">
                ℹ️ <strong>New course:</strong> You can add level details now, but PDF uploads require saving the course first.
                After clicking "Create course", re-open it to upload PDFs per level.
              </div>
            )}
            <RoadmapEditor
              items={form.roadmap}
              onChange={(v) => set("roadmap", v)}
              courseId={courseId}
            />

            <SectionHeading>Portfolio projects</SectionHeading>
            <ProjectsEditor items={form.portfolioProjects} onChange={(v) => set("portfolioProjects", v)} />

            <SectionHeading>FAQs</SectionHeading>
            <FaqEditor items={form.faqs} onChange={(v) => set("faqs", v)} />

            <SectionHeading>Certification</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Provider</label>
                <input value={form.certification.provider}
                  onChange={(e) => set("certification", { ...form.certification, provider: e.target.value })}
                  placeholder="e.g., Adobe" className={inp} />
              </div>
              <div>
                <label className={lbl}>Certification title</label>
                <input value={form.certification.title}
                  onChange={(e) => set("certification", { ...form.certification, title: e.target.value })}
                  placeholder="e.g., Adobe Certified Professional" className={inp} />
              </div>
            </div>
            <div className="mt-3">
              <label className={lbl}>Certification description</label>
              <input value={form.certification.description}
                onChange={(e) => set("certification", { ...form.certification, description: e.target.value })}
                placeholder="e.g., Earn an industry-recognised Adobe certification." className={inp} />
            </div>
          </>)}

          {/* ══ TAB 4: Stats & Placement (NEW) ═══════════════════════════════════ */}
          {tab === 4 && (<>
            <SectionHeading>Course statistics</SectionHeading>
            <p className="text-xs text-muted-foreground -mt-2 mb-3">
              These are denormalised counters shown on course cards and the detail page. Update manually,
              or leave them for a background job to populate.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Rating <span className="text-muted-foreground/60">(0–5)</span></label>
                <input type="number" min={0} max={5} step={0.1} value={form.stats.rating}
                  onChange={(e) => set("stats", { ...form.stats, rating: Math.min(5, Math.max(0, Number(e.target.value))) })}
                  className={inp} />
              </div>
              <div>
                <label className={lbl}>Review count</label>
                <input type="number" min={0} value={form.stats.reviewCount}
                  onChange={(e) => set("stats", { ...form.stats, reviewCount: Math.max(0, Number(e.target.value)) })}
                  className={inp} />
              </div>
              <div>
                <label className={lbl}>Student count</label>
                <input type="number" min={0} value={form.stats.studentCount}
                  onChange={(e) => set("stats", { ...form.stats, studentCount: Math.max(0, Number(e.target.value)) })}
                  className={inp} />
              </div>
              <div>
                <label className={lbl}>Project count</label>
                <input type="number" min={0} value={form.stats.projectCount}
                  onChange={(e) => set("stats", { ...form.stats, projectCount: Math.max(0, Number(e.target.value)) })}
                  className={inp} />
              </div>
            </div>

            <SectionHeading>Placement</SectionHeading>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg border border-border hover:bg-secondary/40 transition-colors">
                <input type="checkbox" checked={form.placement.hasPlacementSupport}
                  onChange={(e) => set("placement", { ...form.placement, hasPlacementSupport: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded border-border accent-primary" />
                <div>
                  <p className="text-sm font-medium">Placement support</p>
                  <p className="text-xs text-muted-foreground">Course includes career/placement assistance</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg border border-border hover:bg-secondary/40 transition-colors">
                <input type="checkbox" checked={form.placement.hasCertificate}
                  onChange={(e) => set("placement", { ...form.placement, hasCertificate: e.target.checked })}
                  className="h-4 w-4 mt-0.5 rounded border-border accent-primary" />
                <div>
                  <p className="text-sm font-medium">Certificate on completion</p>
                  <p className="text-xs text-muted-foreground">Students receive a certificate</p>
                </div>
              </label>
            </div>
            <div className="mt-3">
              <label className={lbl}>Hiring partners <span className="text-muted-foreground/60">(press Enter)</span></label>
              <TagInput values={form.placement.hiringPartners}
                onChange={(v) => set("placement", { ...form.placement, hiringPartners: v })}
                placeholder="e.g., Google, Zomato..." />
            </div>
          </>)}

          {/* ══ TAB 5: SEO & Publish ═══════════════════════════════════════════ */}
          {tab === 5 && (<>
            <SectionHeading>SEO</SectionHeading>
            <div>
              <label className={lbl}>SEO title <span className="text-muted-foreground/60">(max 160 chars)</span></label>
              <input value={form.seo.title} onChange={(e) => set("seo", { ...form.seo, title: e.target.value })}
                placeholder="e.g., Slate Academy: UI UX Design Course in Delhi" className={inp} />
              <p className="text-xs text-muted-foreground mt-1">{form.seo.title.length}/160</p>
            </div>
            <div>
              <label className={lbl}>Meta description <span className="text-muted-foreground/60">(max 320 chars)</span></label>
              <textarea value={form.seo.description} onChange={(e) => set("seo", { ...form.seo, description: e.target.value })}
                rows={2} placeholder="e.g., Start your UI UX Design Course at Slate Academy..."
                className={`${inp} resize-none`} />
              <p className="text-xs text-muted-foreground mt-1">{form.seo.description.length}/320</p>
            </div>
            <div>
              <label className={lbl}>Canonical URL</label>
              <input value={form.seo.canonical} onChange={(e) => set("seo", { ...form.seo, canonical: e.target.value })}
                placeholder="e.g., https://slate-academy.com/ui-ux-design-course" className={inp} />
            </div>

            <SectionHeading>Downloads</SectionHeading>
            <div>
              <label className={lbl}>Syllabus PDF URL <span className="text-muted-foreground/60">(global fallback)</span></label>
              <input value={form.downloads.syllabusPdf}
                onChange={(e) => set("downloads", { syllabusPdf: e.target.value })}
                placeholder="https://res.cloudinary.com/.../syllabus.pdf" className={inp} />
            </div>

            <SectionHeading>Publishing</SectionHeading>
            <div className="space-y-3">
              {([
                { key: "isPublished" as const, label: "Published", sub: "Visible to students on the website" },
                { key: "isFeatured"  as const, label: "Featured",  sub: "Shown in homepage highlights section" },
              ]).map(({ key, label, sub }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg border border-border hover:bg-secondary/40 transition-colors">
                  <input type="checkbox" checked={form.publishing[key]}
                    onChange={(e) => set("publishing", { ...form.publishing, [key]: e.target.checked })}
                    className="h-4 w-4 mt-0.5 rounded border-border accent-primary" />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </>)}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 shrink-0 bg-card text-white">
          <div className="flex gap-1.5">
            {TABS.map((_, i) => (
              <button key={i} type="button" onClick={() => setTab(i)}
                className={`h-1.5 rounded-full transition-all ${i === tab ? "w-6 bg-[#0037FF]" : "w-1.5 bg-border"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {tab > 0 && (
              <Button variant="outline" onClick={() => setTab((t) => t - 1)} disabled={saving}>
                <ChevronLeft size={14} className="mr-1" /> Back
              </Button>
            )}
            {tab < TABS.length - 1 && (
              <Button onClick={() => setTab((t) => t + 1)}>
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            )}
            {tab === TABS.length - 1 && (
              <Button onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader2 size={14} className="mr-2 animate-spin" />Saving…</>
                  : editing ? "Update course" : "Create course"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Course card ───────────────────────────────────────────────────────────────
function CourseCard({ course, onEdit, onDelete, onTogglePublish }: {
  course: AdminCourse;
  onEdit: (c: AdminCourse) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (c: AdminCourse) => void;
}) {
  const grad = GRADS[course.category] ?? "from-slate-500 to-slate-700";
  const pub  = course.publishing?.isPublished ?? false;
  const stats     = course.stats ?? { rating: 0, reviewCount: 0, studentCount: 0, projectCount: 0 };
  const placement = course.placement ?? { hasPlacementSupport: false, hasCertificate: false, hiringPartners: [] };

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-40 w-full overflow-hidden">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          : <div className={`h-full w-full bg-gradient-to-br ${grad} flex items-center justify-center`}><BookOpen size={32} className="text-white/70" /></div>
        }
        <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">{course.category}</span>
        <span className="absolute top-3 right-3"><StatusBadge>{pub ? "Published" : "Draft"}</StatusBadge></span>
        {/* NEW: mode badge */}
        {course.mode && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {course.mode}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-semibold line-clamp-1">{course.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{course.shortDescription || "No description."}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {course.level}{course.duration ? ` • ${course.duration}` : ""}{course.tag ? ` • ${course.tag}` : ""}
          {course.schedule ? ` • ${course.schedule}` : ""}
        </p>

        {/* NEW: rating / student count row */}
        {(stats.rating > 0 || stats.studentCount > 0) && (
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {stats.rating > 0 && (
              <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />{stats.rating.toFixed(1)}
                {stats.reviewCount > 0 && <span className="text-muted-foreground/70">({stats.reviewCount})</span>}
              </span>
            )}
            {stats.studentCount > 0 && (
              <span className="flex items-center gap-1"><Users size={12} />{stats.studentCount.toLocaleString("en-IN")}</span>
            )}
          </div>
        )}

        {/* NEW: certificate / placement badges */}
        {(placement.hasCertificate || placement.hasPlacementSupport) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {placement.hasCertificate && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-600 text-xs px-2 py-0.5 font-medium">
                <Award size={11} /> Certificate
              </span>
            )}
            {placement.hasPlacementSupport && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 text-indigo-600 text-xs px-2 py-0.5 font-medium">
                <Briefcase size={11} /> Placement support
              </span>
            )}
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-secondary/50 p-2 text-center">
            <div className="text-muted-foreground">Price</div>
            <div className="font-semibold truncate">{fmt(course.pricing?.price ?? 0)}</div>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2 text-center">
            <div className="text-muted-foreground">Levels</div>
            <div className="font-semibold">{course.roadmap?.length ?? 0}</div>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2 text-center">
            <div className="text-muted-foreground">FAQs</div>
            <div className="font-semibold">{course.faqs?.length ?? 0}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onTogglePublish(course)}>
            {pub ? <><EyeOff size={13} className="mr-1" />Unpublish</> : <><Eye size={13} className="mr-1" />Publish</>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(course)}><Pencil size={14} /></Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(course._id)}><Trash2 size={14} /></Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function AdminCourses() {
  const [courses, setCourses]             = useState<AdminCourse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const json = await apiFetch<{ data: AdminCourse[] }>("/admin/courses?limit=100&sort=-createdAt");
      setCourses(json.data ?? []);
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try { await apiFetch(`/admin/courses/${id}`, { method: "DELETE" }); load(); }
    catch (e: unknown) { alert((e as Error).message); }
  };

  const handleTogglePublish = async (course: AdminCourse) => {
    try {
      await apiFetch(`/admin/courses/${course._id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !(course.publishing?.isPublished ?? false) }),
      });
      load();
    } catch (e: unknown) { alert((e as Error).message); }
  };

  if (loading) return (
    <AdminLayout title="Courses" subtitle="Loading…">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="h-40 bg-muted animate-pulse" />
            <div className="p-5 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout title="Courses" subtitle="Something went wrong">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
        <span>{error}</span>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw size={13} className="mr-1" />Retry</Button>
      </div>
    </AdminLayout>
  );

  const published = courses.filter((c) => c.publishing?.isPublished).length;

  return (
    <AdminLayout
      title="Courses"
      subtitle={`${courses.length} total · ${published} published`}
      actions={
        <Button size="sm" className="text-white font-semibold" onClick={() => { setEditingCourse(null); setModalOpen(true); }}>
          <Plus size={14} className="mr-1" /> New course
        </Button>
      }
    >
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <BookOpen size={40} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">No courses yet</p>
          <p className="text-sm mt-1">Click "New course" to add your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c}
              onEdit={(c) => { setEditingCourse(c); setModalOpen(true); }}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <CourseModal
          editing={editingCourse}
          onClose={() => setModalOpen(false)}
          onSaved={load}
        />
      )}
    </AdminLayout>
  );
}