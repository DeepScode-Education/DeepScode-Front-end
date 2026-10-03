import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  memo,
} from "react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import {
  Clock,
  Search,
  Palette,
  Code,
  Megaphone,
  BarChart3,
  Zap,
  Sparkles,
  GraduationCap,
  Loader2,
  Star,
  Users,
  FolderKanban,
  Building2,
  Award,
  Briefcase,
  ShieldCheck,
} from "lucide-react";

import { fetchCourses, type CourseCard } from "../integrations/courseApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_TABS = ["All", "Design", "3D Design", "Marketing", "Data" , "Tech"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

const CATEGORY_CARDS = [
  {
    title   : "Design",
    icon    : Palette,
    gradient: "from-pink-500 to-rose-500",
    items   : ["UI/UX", "Figma", "Motion", "Branding"],
  },
  {
    title   : "3D",
    icon    : Code,
    gradient: "from-blue-500 to-indigo-500",
    items   : ["Blender", "Cinema 4D", "Modeling", "Rendering"],
  },
  {
    title   : "Marketing",
    icon    : Megaphone,
    gradient: "from-orange-500 to-orange-600",
    items   : ["Social Media", "Performance", "SEO", "Digital"],
  },
  {
    title   : "Data",
    icon    : BarChart3,
    gradient: "from-emerald-500 to-teal-500",
    items   : ["Analytics", "Excel", "SQL"],
  },
    { title: "Tech",      icon: ShieldCheck, gradient: "from-slate-700 to-slate-900", items: ["Cyber Security", "Ethical Hacking"] },
] as const;

type TagStyle = { pill: string; Icon: typeof Zap };

const TAG_STYLES: Record<string, TagStyle> = {
  Beginner    : { pill: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20", Icon: GraduationCap },
  Intermediate: { pill: "bg-blue-500/10 text-[#0037FF] ring-1 ring-blue-500/20",         Icon: Sparkles },
  Advanced    : { pill: "bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20",   Icon: Sparkles },
  "Quick Skill": { pill: "bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/30",      Icon: Zap },
};

const DEFAULT_TAG_STYLE: TagStyle = {
  pill: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  Icon: Sparkles,
};

const COURSE_ORDER = [
  "Graphics Design",
  "Motion Graphics & VFX",
  "UI/UX Design",
  "3D Design & Animation",
  "Data Analytics",
  "Digital Marketing",
  "UI/UX Design Fundamentals",
];

const COURSE_ORDER_MAP = new Map(
  COURSE_ORDER.map((title, index) => [title.toLowerCase().trim(), index])
);

function sortCoursesByCustomOrder(courses: CourseCard[]): CourseCard[] {
  return [...courses].sort((a, b) => {
    const aIdx = COURSE_ORDER_MAP.get(a.title.toLowerCase().trim()) ?? Infinity;
    const bIdx = COURSE_ORDER_MAP.get(b.title.toLowerCase().trim()) ?? Infinity;
    return aIdx - bIdx;
  });
}

function normaliseCategory(raw: string): string {
  if (!raw || raw.toLowerCase() === "all") return "All";
  if (raw.toLowerCase() === "3d" || raw.toLowerCase() === "3d design") return "3D";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

interface HeroProps {
  search: string;
  onSearch: (v: string) => void;
}

const Hero = memo<HeroProps>(({ search, onSearch }) => (
  <section className="bg-[#F5F5F7] border-b border-gray-200">
    <div className="container py-10 sm:py-14 lg:py-16">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Left: text + search */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0037FF]/10 px-3 py-1 text-xs font-semibold text-[#0037FF] mb-4">
            <Sparkles className="h-3 w-3" aria-hidden />
            20 career-ready courses
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black leading-tight tracking-tight">
            Build your portfolio. Master industry tools. Launch your career.
          </h1>
          <p className="mt-3 text-sm sm:text-[15px] text-gray-500 font-semibold">
            Live cohorts, real projects, and placement support in Design, 3D, Marketing &amp; Data.
          </p>
          <div className="mt-6 relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden />
            <input
              type="search"
              placeholder="Search courses, software or careers..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0037FF]/40"
            />
          </div>
        </div>

        {/* Right: stats */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 lg:gap-8 lg:shrink-0">
          {[
            { icon: Star, value: "5.0" , label: "rating",          color: "text-amber-500" },
            { icon: Users, value: "1,200+", label: "students",     color: "text-[#0037FF]" },
            { icon: FolderKanban, value: "2,500+", label: "projects", color: "text-[#0037FF]" },
            { icon: Building2, value: "96",  label: "hiring partners", color: "text-[#0037FF]" },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color} shrink-0`} aria-hidden />
              <span className="text-sm font-semibold text-gray-900">{value}</span>
              <span className="text-sm text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
));
Hero.displayName = "Hero";

// ─── Category Tab Bar ─────────────────────────────────────────────────────────
// Sort dropdown removed — this is now just the category tabs.

interface CategoryTabBarProps {
  active: CategoryTab;
  onTab: (t: CategoryTab) => void;
}

const CategoryTabBar = memo<CategoryTabBarProps>(({ active, onTab }) => (
  <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
    <div className="container flex items-center gap-0 overflow-x-auto scrollbar-none">
      {CATEGORY_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTab(tab)}
          className={[
            "shrink-0 px-3.5 sm:px-4 py-3 sm:py-3.5 text-sm font-medium border-b-2 transition-colors",
            active === tab
              ? "border-[#0037FF] text-[#0037FF]"
              : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300",
          ].join(" ")}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
));
CategoryTabBar.displayName = "CategoryTabBar";

// ─── Course Card ──────────────────────────────────────────────────────────────

interface CourseCardProps {
  course: CourseCard;
  index: number;
}

const CourseCardItem = memo<CourseCardProps>(({ course, index }) => {
  const tagStyle = TAG_STYLES[course.tag] ?? DEFAULT_TAG_STYLE;
  const { Icon: TagIcon } = tagStyle;

  // ── Real backend data — no mock/random values ───────────────────────────────
  const tools    = course.toolsCovered?.length ? course.toolsCovered : [];
  const careers  = course.careerOpportunities?.length
    ? course.careerOpportunities.join(" · ")
    : null;
  const rating       = course.stats?.rating ?? 0;
  const reviewCount  = course.stats?.reviewCount ?? 0;
  const studentCount = course.stats?.studentCount ?? 0;
  const projectCount = course.stats?.projectCount ?? 0;
  const hasCertificate      = course.placement?.hasCertificate ?? false;
  const hasPlacementSupport = course.placement?.hasPlacementSupport ?? false;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300" />
        )}
        {/* Level badge */}
        <span className={[
          "absolute left-2.5 top-2.5 sm:left-3 sm:top-3 inline-flex items-center gap-1 rounded-full",
          "px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold bg-white/90 backdrop-blur-sm",
          tagStyle.pill,
        ].join(" ")}>
          <TagIcon className="h-3 w-3" aria-hidden />
          {course.tag || course.level}
        </span>
        {/* Category badge */}
        <span className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 rounded-full bg-gray-900/80 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium text-white backdrop-blur-sm">
          {course.category}
        </span>
        {/* Mode badge */}
        {course.mode && (
          <span className="absolute left-2.5 bottom-2.5 sm:left-3 sm:bottom-3 rounded-full bg-black/60 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-medium text-white backdrop-blur-sm">
            {course.mode}
          </span>
        )}
      </div>

           <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* 👇 ye naya wrapper hai — sara "variable length" content iske andar */}
        <div className="flex-1">
          <h3 className="line-clamp-2 font-semibold text-sm sm:text-[15px] leading-snug text-gray-900">
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
            {course.shortDescription}
          </p>

          {/* Stats — single line, never wraps */}
          <div className="mt-3 flex flex-nowrap items-center gap-2.5 scrollbar-none text-[11px] text-gray-500">
            {rating > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-medium text-amber-500">
                <Star className="h-3 w-3 shrink-0 fill-amber-400 stroke-amber-500" />
                {rating.toFixed(1)}
                {reviewCount > 0 && <span className="text-gray-400">({reviewCount})</span>}
              </span>
            )}
            {studentCount > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
                <Users className="h-3 w-3 shrink-0" />
                {studentCount.toLocaleString()}+
              </span>
            )}
            {course.duration && (
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap" title={course.duration}>
                <Clock className="h-3 w-3 shrink-0" />
                {course.duration}
              </span>
            )}
            {projectCount > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
                <FolderKanban className="h-3 w-3 shrink-0" />
                {projectCount} project
              </span>
            )}
          </div>

          {/* Tool tags */}
          {tools.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tools.slice(0, 4).map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{t}</span>
              ))}
            </div>
          )}

          {/* Career outcomes */}
          {careers && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Career Outcomes</p>
              <p className="text-[11px] text-gray-500 line-clamp-1">{careers}</p>
            </div>
          )}

          {/* Badges */}
          {(hasCertificate || hasPlacementSupport) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {hasCertificate && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#0037FF]/8 px-2 py-0.5 text-[11px] font-medium text-[#0037FF]">
                  <Award className="h-3 w-3" /> Certificate
                </span>
              )}
              {hasPlacementSupport && (
                <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-600">
                  <Briefcase className="h-3 w-3" /> Placement
                </span>
              )}
            </div>
          )}
        </div>
        {/* 👆 wrapper yahan close */}

        {/* CTAs — ab hamesha bottom pe fix rahenge */}
        <div className="mt-4 flex flex-col gap-2">
          <Button asChild className="w-full bg-[#0037FF] hover:bg-[#0028CC] text-white rounded-lg h-9 text-sm font-semibold">
            <Link to={`/${course.slug}`}>
              Explore Course →
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs h-8 border-gray-200">
              View Curriculum
            </Button>
            <button type="button" className="flex-1 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
              Free Counselling
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});
CourseCardItem.displayName = "CourseCardItem";

// ─── Main Page ────────────────────────────────────────────────────────────────
// Sidebar filters and sorting have been removed — the page now only supports
// category tabs (top bar) and free-text search.

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get("category") ?? "";

  const [activeTab, setActiveTab] = useState<CategoryTab>("All");
  const [search, setSearch]       = useState("");
  const [courses, setCourses]     = useState<CourseCard[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [total, setTotal]         = useState(0);

  const category = normaliseCategory(rawCategory);

  // Sync tab with URL param
  useEffect(() => {
    if (category === "All") setActiveTab("All");
    else if (["Design", "3D Design", "Marketing", "Data", "Tech"].includes(category as CategoryTab)) {
      setActiveTab(category as CategoryTab);
    }
  }, [category]);

  const handleTabClick = useCallback((tab: CategoryTab) => {
    setActiveTab(tab);
    if (tab === "All") setSearchParams({});
    else setSearchParams({ category: tab.toLowerCase() });
    setSearch("");
  }, [setSearchParams]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = { limit: 100 };
        if (category !== "All") params.category = category;
        if (search.trim())      params.search   = search.trim();

        const result = await fetchCourses(params);
        if (!cancelled) {
          setCourses(result.courses);
          setTotal(result.pagination.total);
        }
      } catch {
        if (!cancelled) setError("Failed to load courses. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timer = setTimeout(load, search ? 350 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [category, search]);

  const sortedCourses = useMemo(() => sortCoursesByCustomOrder(courses), [courses]);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Hero */}
      <Hero search={search} onSearch={setSearch} />

      {/* Tab bar */}
      <CategoryTabBar active={activeTab} onTab={handleTabClick} />

      {/* Body: full-width grid, no sidebar */}
      <div className="container py-6 sm:py-8 lg:py-10">
        {/* Result count */}
        {!loading && (
          <p className="mb-4 sm:mb-5 text-sm text-gray-500">
            Showing <strong className="font-semibold text-gray-800">{sortedCourses.length}</strong>
            {total > sortedCourses.length ? ` of ${total}` : ""} courses
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24 sm:py-32">
            <Loader2 className="h-8 w-8 animate-spin text-[#0037FF]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
            <p className="text-base font-medium text-red-500">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => setSearch(search)}>
              Retry
            </Button>
          </div>
        )}

        {/* Grid — now spans the full width since the sidebar is gone */}
        {!loading && !error && sortedCourses.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {sortedCourses.map((course, i) => (
              <CourseCardItem key={course._id} course={course} index={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && sortedCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
            <Search className="mb-4 h-10 w-10 text-gray-300" />
            <p className="text-base font-medium text-gray-700">No courses found</p>
            <p className="mt-1 text-sm text-gray-400">
              Try a different search term or{" "}
              <button type="button" onClick={() => setSearch("")} className="underline underline-offset-2 hover:text-gray-600">
                clear search
              </button>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Courses);