import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/integrations/client";
import {
  Zap, Palette, Heart, MapPin, ExternalLink,
  Briefcase, Clock, Users, Wifi, Building2, Loader2,
  AlertCircle, Search, SlidersHorizontal, ChevronRight,
} from "lucide-react";

/* ─────────────────────────────── types ── */

interface Career {
  _id: string;
  title: string;
  department: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "Onsite";
  employmentType: string;
  experience: { min: number; max: number };
  salary?: { min: number; max: number; currency: string };
  openings: number;
  description: string;
  skills: string[];
  featured: boolean;
  applicationDeadline?: string;
}

/* ─────────────────────────────── perks ── */

const PERKS = [
  { icon: Zap,     title: "Fast Growth",       desc: "Accelerate your career with rapid learning opportunities." },
  { icon: Palette, title: "Creative Freedom",   desc: "Own your projects and bring bold ideas to life."          },
  { icon: Heart,   title: "Real Impact",        desc: "Help millions of learners unlock their potential."        },
  { icon: MapPin,  title: "Flexible Work",      desc: "Remote-first culture — work from anywhere."              },
];

const WORK_MODE_COLORS: Record<string, string> = {
  Remote:  "bg-blue-50  text-blue-700  border-blue-200",
  Hybrid:  "bg-purple-50 text-purple-700 border-purple-200",
  Onsite:  "bg-amber-50 text-amber-700 border-amber-200",
};

const DEPARTMENTS = [
  "Engineering","Design","Marketing","Sales",
  "HR","Operations","Finance","Support","Other",
];

/* ─────────────────────── apply modal ── */

interface ApplyModalProps {
  career: Career;
  onClose: () => void;
}

const ApplyModal = ({ career, onClose }: ApplyModalProps) => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    currentCompany: "", experience: "", coverLetter: "",
    linkedIn: "", github: "", portfolio: "",
  });
  const [resume, setResume]     = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");

  const set = (k: string, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) { setError("Please attach your resume (PDF/DOC)."); return; }
    setError("");
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      fd.append("resume", resume);

      const res = await fetch(
        `${BASE_URL}/api/career-applications/${career._id}/apply`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{career.title}</h2>
            <p className="text-sm text-gray-500">{career.department} · {career.location}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Application Submitted!</h3>
            <p className="mt-2 text-gray-500 text-sm max-w-xs">
              Thanks for applying to <strong>{career.title}</strong>. We'll review your application and get back to you soon.
            </p>
            <Button className="mt-6 bg-[#0037FF] hover:bg-[#0030e0] text-white" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* name row */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "First Name *", key: "firstName", placeholder: "Rahul" },
                { label: "Last Name",    key: "lastName",  placeholder: "Sharma" },
              ].map(f => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-medium text-gray-700">{f.label}</label>
                  <input
                    required={f.label.includes("*")}
                    value={(form as any)[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0037FF] focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>

            {/* email & phone */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Email *",  key: "email", type: "email", placeholder: "rahul@email.com" },
                { label: "Phone *",  key: "phone", type: "tel",   placeholder: "9876543210" },
              ].map(f => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-medium text-gray-700">{f.label}</label>
                  <input
                    required
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0037FF] focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>

            {/* company & experience */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Current Company</label>
                <input
                  value={form.currentCompany}
                  onChange={e => set("currentCompany", e.target.value)}
                  placeholder="Google"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0037FF] focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={form.experience}
                  onChange={e => set("experience", e.target.value)}
                  placeholder="3"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0037FF] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* links */}
            {[
              { label: "LinkedIn URL", key: "linkedIn",  placeholder: "https://linkedin.com/in/..." },
              { label: "GitHub URL",   key: "github",    placeholder: "https://github.com/..." },
              { label: "Portfolio URL",key: "portfolio", placeholder: "https://yoursite.com" },
            ].map(f => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium text-gray-700">{f.label}</label>
                <input
                  type="url"
                  value={(form as any)[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0037FF] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}

            {/* cover letter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Cover Letter</label>
              <textarea
                rows={3}
                value={form.coverLetter}
                onChange={e => set("coverLetter", e.target.value)}
                placeholder="Why are you a great fit for this role?"
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0037FF] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* resume upload */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Resume * <span className="text-gray-400 font-normal">(PDF, DOC, DOCX — max 10MB)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setResume(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className={`flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-colors ${
                  resume ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-[#0037FF] hover:bg-blue-50"
                }`}>
                  <Briefcase size={16} className={resume ? "text-emerald-600" : "text-gray-400"} />
                  <span className={resume ? "text-emerald-700 font-medium" : "text-gray-400"}>
                    {resume ? resume.name : "Click to upload resume"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0037FF] hover:bg-[#0030e0] text-white gap-2 h-11"
            >
              {submitting ? <><Loader2 size={15} className="animate-spin" />Submitting…</> : "Submit Application"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────── career card ── */

const CareerCard = ({ career, onApply }: { career: Career; onApply: () => void }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-2xl border bg-white transition-all duration-200 hover:shadow-md ${
      career.featured ? "border-[#0037FF]/30 shadow-sm" : "border-gray-200"
    }`}>
      {career.featured && (
        <div className="flex items-center gap-1.5 rounded-t-2xl bg-[#0037FF]/5 px-5 py-2 border-b border-[#0037FF]/10">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0037FF] animate-pulse" />
          <span className="text-xs font-semibold text-[#0037FF] uppercase tracking-wider">Featured</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 leading-tight">{career.title}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Building2 size={13} />{career.department}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />{career.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />{career.employmentType}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} />{career.openings} opening{career.openings !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${WORK_MODE_COLORS[career.workMode] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
              {career.workMode}
            </span>
            <Button
              size="sm"
              className="bg-[#0037FF] hover:bg-[#0030e0] text-white gap-1.5 text-xs h-8"
              onClick={onApply}
            >
              Apply <ChevronRight size={13} />
            </Button>
          </div>
        </div>

        {/* experience + deadline */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
          <span>{career.experience.min}–{career.experience.max} yrs experience</span>
          {career.applicationDeadline && (
            <span>
              Deadline: {new Date(career.applicationDeadline).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </span>
          )}
        </div>

        {/* skills */}
        {career.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {career.skills.slice(0, 6).map(s => (
              <span key={s} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                {s}
              </span>
            ))}
            {career.skills.length > 6 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
                +{career.skills.length - 6} more
              </span>
            )}
          </div>
        )}

        {/* description toggle */}
        {career.description && (
          <div className="mt-3">
            <p className={`text-sm text-gray-600 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
              {career.description}
            </p>
            <button
              onClick={() => setExpanded(p => !p)}
              className="mt-1 text-xs text-[#0037FF] hover:underline font-medium"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────── page ── */

const CareersPage = () => {
  const [careers, setCareers]     = useState<Career[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [applyTarget, setApplyTarget] = useState<Career | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res  = await fetch(`${BASE_URL}/api/careers`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load careers");
        setCareers(data.data ?? []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = careers.filter(c => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchDept = filterDept === "all" || c.department === filterDept;
    const matchMode = filterMode === "all" || c.workMode === filterMode;
    return matchSearch && matchDept && matchMode;
  });

  const featured   = filtered.filter(c => c.featured);
  const regular    = filtered.filter(c => !c.featured);

  return (
    <>
      <main>
        {/* ── Hero ── */}
        <section className="container py-20 text-center md:py-28">
          <h1 className="animate-fade-up text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-black">
            Build the Future of<br />
            <span className="text-[#0037FF]">Learning With Us</span>
          </h1>
          <p className="animate-fade-up-delay-1 mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Join a team that helps people grow — and grow with them.
          </p>
          {!loading && careers.length > 0 && (
            <p className="mt-3 text-sm font-medium text-[#0037FF]">
              {careers.length} open position{careers.length !== 1 ? "s" : ""} available
            </p>
          )}
        </section>

        {/* ── Why Work With Us ── */}
        <section className="bg-muted/30">
          <div className="container py-16">
            <h2 className="animate-fade-up text-center text-2xl font-bold">Why Work With Us</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PERKS.map((perk, i) => (
                <div
                  key={perk.title}
                  className={`rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg ${
                    ["animate-fade-up","animate-fade-up-delay-1","animate-fade-up-delay-2","animate-fade-up-delay-3"][i]
                  }`}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-[#0037FF]">
                    <perk.icon size={20} />
                  </div>
                  <h3 className="font-semibold">{perk.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Open Roles ── */}
        <section className="container py-16">
          <h2 className="animate-fade-up text-center text-2xl font-bold">Open Roles</h2>

          {/* filters */}
          <div className="mx-auto mt-8 max-w-3xl flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, skill, location…"
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#0037FF] focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0037FF]"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={filterMode}
              onChange={e => setFilterMode(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0037FF]"
            >
              <option value="all">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          {/* list */}
          <div className="mx-auto mt-8 max-w-3xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <Loader2 size={28} className="animate-spin text-[#0037FF]" />
                <span className="text-sm">Loading open positions…</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-12 text-center">
                <AlertCircle size={28} className="text-red-400 mb-2" />
                <p className="font-medium text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-sm text-red-500 underline"
                >
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                <Briefcase size={32} className="text-gray-300 mb-3" />
                <p className="font-medium text-gray-700">
                  {careers.length === 0
                    ? "No open positions right now"
                    : "No positions match your filters"}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {careers.length === 0
                    ? "Check back soon — we're always growing."
                    : "Try adjusting your search or filters."}
                </p>
                {(search || filterDept !== "all" || filterMode !== "all") && (
                  <button
                    onClick={() => { setSearch(""); setFilterDept("all"); setFilterMode("all"); }}
                    className="mt-3 text-sm text-[#0037FF] underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {featured.length > 0 && (
                  <>
                    {featured.map(c => (
                      <CareerCard key={c._id} career={c} onApply={() => setApplyTarget(c)} />
                    ))}
                    {regular.length > 0 && (
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-gray-100" />
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">More Openings</span>
                        <div className="h-px flex-1 bg-gray-100" />
                      </div>
                    )}
                  </>
                )}
                {regular.map(c => (
                  <CareerCard key={c._id} career={c} onApply={() => setApplyTarget(c)} />
                ))}

                <p className="pt-2 text-center text-xs text-gray-400">
                  Showing {filtered.length} of {careers.length} position{careers.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Culture ── */}
        <section className="bg-muted/30">
          <div className="container py-16 text-center">
            <h2 className="animate-fade-up text-2xl font-bold">Our Culture</h2>
            <p className="animate-fade-up-delay-1 mx-auto mt-4 max-w-2xl text-muted-foreground">
              We're a team of curious builders who believe in learning by doing. We value ownership,
              radical honesty, and the kind of collaboration that turns good ideas into great products.
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#0037FF]">
          <div className="container py-16 text-center">
            <h2 className="text-2xl font-bold text-white">Don't see a role?</h2>
            <p className="mx-auto mt-3 max-w-md text-white/80">
              We're always looking for great people. Reach out anyway.
            </p>
            <Button size="lg" variant="secondary" className="mt-6">
              Send Resume
            </Button>
          </div>
        </section>
      </main>

      {/* ── Apply Modal ── */}
      {applyTarget && (
        <ApplyModal career={applyTarget} onClose={() => setApplyTarget(null)} />
      )}
    </>
  );
};

export default CareersPage;