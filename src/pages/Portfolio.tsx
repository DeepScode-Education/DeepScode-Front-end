
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  X,
  Github,
  Eye,
  AlertCircle,
  Loader2,
  FolderOpen,
  Figma,
  Video,
  ExternalLink,
  UserRound,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  fetchPublicPortfolios,
  fetchPublishedCourses,
  PublicPortfolioItem,
  PublicCourseItem,
} from "@/lib/publicPortfolioApi";
import {
  fetchPublicTestimonials,
  TestimonialItem,
} from "@/lib/publicPortfolioApi";

const ALL_FILTER_ID = "All";

// Every clickable portfolio URL — key must match the PublicPortfolioItem field name.
const PROJECT_LINKS: {
  key: keyof PublicPortfolioItem;
  label: string;
  icon: typeof Github;
}[] = [
  { key: "liveUrl", label: "Live Preview", icon: Eye },
  { key: "githubUrl", label: "GitHub", icon: Github },
  { key: "figmaUrl", label: "Figma", icon: Figma },
  { key: "behanceUrl", label: "Behance", icon: ExternalLink },
  { key: "videoUrl", label: "Video", icon: Video },
  { key: "driveUrl", label: "Drive", icon: ExternalLink },
];

// The single "View Portfolio" CTA prefers liveUrl, falls back to the first
// available link on the project — so the button always has somewhere to go
// as long as *any* link exists.
const getPrimaryPortfolioUrl = (
  project: PublicPortfolioItem,
): string | undefined => {
  if (project.liveUrl) return project.liveUrl;
  for (const { key } of PROJECT_LINKS) {
    const url = project[key] as string | undefined;
    if (url) return url;
  }
  return undefined;
};

// Responsive items-per-view — mirrors the old grid's breakpoints
// (sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
const getItemsPerView = () => {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w >= 1280) return 4;
  if (w >= 1024) return 3;
  if (w >= 640) return 2;
  return 1;
};

const Portfolio = () => {
  const [activeCourseId, setActiveCourseId] = useState<string>(ALL_FILTER_ID);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const projectsRef = useRef<HTMLDivElement>(null);

  // ── Course filter — API-backed ───────────────────────────────────
  const [courses, setCourses] = useState<PublicCourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [coursesRetryKey, setCoursesRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setCoursesLoading(true);
    setCoursesError(null);

    fetchPublishedCourses()
      .then((res) => {
        if (cancelled) return;
        setCourses(res);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setCoursesError(err.message || "Could not load course filters.");
      })
      .finally(() => {
        if (cancelled) return;
        setCoursesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coursesRetryKey]);

  // ── Portfolio projects — API-backed, filtered by Course _id ──────
  const [projects, setProjects] = useState<PublicPortfolioItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [projectsRetryKey, setProjectsRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setProjectsLoading(true);
    setProjectsError(null);

    fetchPublicPortfolios({
      course: activeCourseId === ALL_FILTER_ID ? undefined : activeCourseId,
      limit: 24,
    })
      .then((res) => {
        if (cancelled) return;
        setProjects(res.portfolios);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setProjectsError(err.message || "Could not load portfolio projects.");
      })
      .finally(() => {
        if (cancelled) return;
        setProjectsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCourseId, projectsRetryKey]);

  // ── Video testimonials — API-backed ──────────────────────────────
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(
    null,
  );
  const [testimonialsRetryKey, setTestimonialsRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setTestimonialsLoading(true);
    setTestimonialsError(null);

    fetchPublicTestimonials()
      .then((data) => {
        if (cancelled) return;
        setTestimonials(data);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setTestimonialsError(err.message || "Could not load testimonials.");
      })
      .finally(() => {
        if (cancelled) return;
        setTestimonialsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [testimonialsRetryKey]);

  // ── Projects Carousel — infinite loop, responsive, swipeable ─────
  const [itemsPerView, setItemsPerView] = useState<number>(getItemsPerView());
  const [carouselIndex, setCarouselIndex] = useState<number>(itemsPerView);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);

  const canLoop = projects.length > itemsPerView;

  // Recompute itemsPerView on resize
  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset carousel position whenever the visible-count or the project list changes
  // (course filter switch, resize, refetch) — done without animation to avoid jumps.
  useEffect(() => {
    setIsTransitioning(false);
    setCarouselIndex(canLoop ? itemsPerView : 0);
    const frame = requestAnimationFrame(() => setIsTransitioning(true));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPerView, projects.length, activeCourseId, canLoop]);

  // [clones of last N] + [real items] + [clones of first N] → seamless infinite loop
  const extendedProjects = useMemo(() => {
    if (!canLoop) return projects;
    return [
      ...projects.slice(-itemsPerView),
      ...projects,
      ...projects.slice(0, itemsPerView),
    ];
  }, [projects, itemsPerView, canLoop]);

  const handleNext = () => {
    if (!canLoop) return;
    setIsTransitioning(true);
    setCarouselIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!canLoop) return;
    setIsTransitioning(true);
    setCarouselIndex((prev) => prev - 1);
  };

  // Silently snap back into the "real" range once a clone edge is reached —
  // this is what makes the loop feel infinite with no visible jump.
  const handleTransitionEnd = () => {
    if (!canLoop) return;
    const n = projects.length;
    if (carouselIndex >= itemsPerView + n) {
      setIsTransitioning(false);
      setCarouselIndex(itemsPerView);
    } else if (carouselIndex < itemsPerView) {
      setIsTransitioning(false);
      setCarouselIndex(itemsPerView + n - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) return;
    const delta = touchDeltaXRef.current;
    const SWIPE_THRESHOLD = 50;

    if (delta < -SWIPE_THRESHOLD) {
      handleNext();
    } else if (delta > SWIPE_THRESHOLD) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  const handleStartLearning = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      setShowWarning(true);
      toast({
        title: "Login Required",
        description:
          "Please login or create an account to access your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => setShowWarning(false), 5000);
    }
  };

  const handleCourseFilterClick = (courseId: string) => {
    setActiveCourseId(courseId);
    if (projectsRef.current) {
      const yOffset = -90;
      const y =
        projectsRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

const studentName = (p: PublicPortfolioItem) => p.studentName || "Slate Student";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 lg:py-10 ">
        <div className="container text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-[#0037FF]"
          >
            Student Showcase
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-2xl font-bold tracking-tight text-foreground lg:text-4xl"
          >
            Real Projects. Real Results.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-muted-foreground font-semibold"
          >
            Explore outstanding work from our students — built with real skills
            learned at deepScode Education.
          </motion.p>
        </div>
      </section>

      {/* Warning Banner */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3 shadow-lg backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive">
                Login Required
              </p>
              <p className="text-xs text-destructive/80">
                Please login or create an account to access your dashboard.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWarning(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Portfolio Cards */}
      <section className="container py-16" ref={projectsRef}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            Student Projects
          </h2>

          {/* Course filter bar — dynamic, backend-driven */}
          <div className="flex gap-2 flex-wrap items-center">
            {coursesError ? (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <span>Could not load course filters.</span>
                <button
                  onClick={() => setCoursesRetryKey((k) => k + 1)}
                  className="underline font-medium"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <button
                  key={ALL_FILTER_ID}
                  onClick={() => handleCourseFilterClick(ALL_FILTER_ID)}
                  className={`
                    h-11 rounded-full border px-6 text-sm font-medium transition-all duration-300
                    ${
                      activeCourseId === ALL_FILTER_ID
                        ? "border-[#0037FF] bg-[#0037FF] text-white shadow-lg shadow-[#0037FF]/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#0037FF] hover:bg-[#EEF4FF] hover:text-[#0037FF]"
                    }
                  `}
                >
                  All
                </button>

                {coursesLoading
                  ? // Lightweight skeleton pills while courses load
                    Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-11 w-28 animate-pulse rounded-full bg-slate-100"
                      />
                    ))
                  : courses.map((course) => (
                      <button
                        key={course._id}
                        onClick={() => handleCourseFilterClick(course._id)}
                        className={`
                          h-11 rounded-full border px-6 text-sm font-medium transition-all duration-300
                          ${
                            activeCourseId === course._id
                              ? "border-[#0037FF] bg-[#0037FF] text-white shadow-lg shadow-[#0037FF]/20"
                              : "border-slate-200 bg-white text-slate-700 hover:border-[#0037FF] hover:bg-[#EEF4FF] hover:text-[#0037FF]"
                          }
                        `}
                      >
                        {course.title}
                      </button>
                    ))}
              </>
            )}
          </div>
        </div>

        {/* Loading */}
        {projectsLoading && (
          <div className="mt-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0037FF]" />
          </div>
        )}

        {/* Error */}
        {!projectsLoading && projectsError && (
          <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-700">{projectsError}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setProjectsRetryKey((k) => k + 1)}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!projectsLoading && !projectsError && projects.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <FolderOpen className="mb-3 text-muted-foreground" size={32} />
            <p className="text-sm font-medium text-foreground">
              No projects yet {activeCourseId === ALL_FILTER_ID ? "" : "in this course"}
            </p>
          </div>
        )}

        {/* Carousel */}
        {!projectsLoading && !projectsError && projects.length > 0 && (
          <div className="relative mt-8">
            {/* Left arrow */}
            {canLoop && (
              <button
                onClick={handlePrev}
                aria-label="Previous projects"
                className="absolute left-0 sm:-left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-slate-700 shadow-md transition-colors hover:border-[#0037FF] hover:bg-[#0037FF] hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Right arrow */}
            {canLoop && (
              <button
                onClick={handleNext}
                aria-label="Next projects"
                className="absolute right-0 sm:-right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-slate-700 shadow-md transition-colors hover:border-[#0037FF] hover:bg-[#0037FF] hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <div
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="-mx-3 flex"
                style={{
                  transform: `translateX(-${carouselIndex * (100 / itemsPerView)}%)`,
                  transition: isTransitioning
                    ? "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {extendedProjects.map((project, i) => {
                  const primaryUrl = getPrimaryPortfolioUrl(project);
                  const hasStudentPhoto = Boolean(project.studentPhoto?.url);

                  return (
                    <div
                      key={`${project._id}-${i}`}
                      className="box-border shrink-0 px-3"
                      style={{ width: `${100 / itemsPerView}%` }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (i % itemsPerView) * 0.08 }}
                        className="group relative flex h-full flex-col rounded-xl border border-border bg-card shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all"
                      >
                        <div className="relative h-48 w-full overflow-hidden">
                          {project.thumbnail?.url ? (
                            <img
                              src={project.thumbnail.url}
                              alt={project.title}
                              className="h-48 w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-48 w-full items-center justify-center bg-secondary text-muted-foreground">
                              <FolderOpen size={28} />
                            </div>
                          )}

                          <div
                            className="absolute inset-0 origin-left scale-x-0 bg-black/70 transition-transform duration-500 ease-out group-hover:scale-x-100"
                            aria-hidden="true"
                          />

                          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center opacity-0 transition-opacity duration-300 delay-150 group-hover:opacity-100">
                            {hasStudentPhoto ? (
                              <img
                                src={project.studentPhoto!.url}
                                alt={studentName(project)}
                                className="h-20 w-20 rounded-full border-[3px] border-white object-cover shadow-lg"
                              />
                            ) : (
                              <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-white bg-[#0037FF] text-2xl font-bold text-white shadow-lg">
                                {studentName(project)?.[0] ?? "?"}
                              </div>
                            )}
                            {project.studentReview ? (
                              <p className="line-clamp-4 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium italic text-foreground shadow-sm">
                                "{project.studentReview}"
                              </p>
                            ) : (
                              <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#0037FF] shadow-sm">
                                {studentName(project)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                              <UserRound className="h-3 w-3 text-[#0037FF]" />
                            </span>
                            <p className="text-sm font-bold text-foreground">
                              {studentName(project)}
                            </p>
                          </div>

                          <div className="mt-2 flex gap-2 flex-wrap">
                            {project.technologies?.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600"
                              >
                                {tech}
                              </span>
                            ))}

                            {project.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-[#0037FF]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h3 className="mt-3 font-semibold text-foreground">
                            {project.title}
                          </h3>
                          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>

                          {primaryUrl && (
                            <div className="mt-auto pt-4">
                              <a
                                href={primaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/cta flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#0037FF] to-[#3D5AFE] text-xs font-semibold text-white shadow-md shadow-[#0037FF]/25 transition-all duration-300 hover:shadow-lg hover:shadow-[#0037FF]/40 hover:-translate-y-0.5 hover:from-[#002ecc] hover:to-[#0037FF]"
                              >
                                View Portfolio
                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Video Testimonials */}
      <section className="bg-secondary/50 py-16">
        <div className="container">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-[#0037FF]">
              Success Stories
            </span>
            <h2 className="mt-4 text-2xl font-bold text-foreground lg:text-3xl">
              Hear From Our Students
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Watch how deepScode Education helped our students land their dream
              roles.
            </p>
          </div>

          {testimonialsLoading && (
            <div className="mt-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#0037FF]" />
            </div>
          )}

          {!testimonialsLoading && testimonialsError && (
            <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-700">
                {testimonialsError}
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => setTestimonialsRetryKey((k) => k + 1)}
              >
                Try again
              </Button>
            </div>
          )}

          {!testimonialsLoading &&
            !testimonialsError &&
            testimonials.length === 0 && (
              <div className="mt-10 text-center text-sm text-muted-foreground">
                No testimonials yet.
              </div>
            )}

          {!testimonialsLoading &&
            !testimonialsError &&
            testimonials.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {testimonials.map((testimonial, i) => (
                  <motion.div
                    key={testimonial._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
                  >
                    <div className="relative aspect-video bg-muted">
                      {playingVideo === i ? (
                        <div className="relative w-full h-full">
                          <video
                            src={testimonial.videoUrl}
                            className="w-full h-full object-cover"
                            autoPlay
                            controls
                          />
                          <button
                            onClick={() => setPlayingVideo(null)}
                            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-[#0037FF]-foreground hover:bg-foreground/90 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPlayingVideo(i)}
                          className="group/play relative w-full h-full"
                        >
                          {testimonial.image ? (
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                              <FolderOpen size={24} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center group-hover/play:bg-foreground/30 transition-colors">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card/90 shadow-lg group-hover/play:scale-110 transition-transform">
                              <Play className="h-6 w-6 text-[#0037FF] ml-0.5" />
                            </div>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="p-5">
                      {testimonial.quote && (
                        <p className="text-sm text-muted-foreground italic line-clamp-3">
                          "{testimonial.quote}"
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-3">
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-border"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                            {testimonial.name?.[0] ?? "?"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {testimonial.name}
                          </p>
                          {testimonial.role && (
                            <p className="text-xs text-muted-foreground">
                              {testimonial.role}
                            </p>
                          )}
                        </div>
                      </div>
                      {testimonial.course && (
                        <span className="mt-3 inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-[#0037FF]">
                          {testimonial.course}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
          Ready to Build Your Portfolio?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Join thousands of students creating real-world projects with expert
          mentorship.
        </p>
        <Button
          size="lg"
          className="mt-6 text-white"
          onClick={handleStartLearning}
        >
          Start Learning Today
        </Button>
        {!user && (
          <p className="mt-3 text-xs text-muted-foreground">
            Login required to access your dashboard
          </p>
        )}
      </section>
    </div>
  );
};

export default Portfolio;