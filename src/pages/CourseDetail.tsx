import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, BarChart2, Users, Download, Play, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { fetchCourseBySlug, type CourseDetail as TCourseDetail } from "../integrations/courseApi";
import { useDownload } from "../hooks/useDownload";
import { useSsrData } from "@/ssr/SsrDataContext";

import CourseOverview      from "./coursePage/CourseOverview";
import ToolStack           from "./coursePage/ToolStack";
import IncludedOutcomes    from "./coursePage/IncludedOutcomes";
import ProgramStructure    from "./coursePage/ProgramStructure";
import PortfolioProjects   from "./coursePage/PortfolioProjects";
import CareerOpportunities from "./coursePage/CareerOpportunities";
import Certification       from "./coursePage/Certification";
import CounsellorForm      from "./coursePage/CounsellorForm";
import FAQ                 from "./coursePage/FAQ";
import FinalCTA            from "./coursePage/FinalCTA";
import Form                from "../form/Form";

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const topRef   = useRef<HTMLDivElement>(null);

  // SSR se prefetched course data
  const ssrCourse = useSsrData<TCourseDetail>("courseData");

  const [course, setCourse]         = useState<TCourseDetail | null>(ssrCourse ?? null);
  const [loading, setLoading]       = useState(!ssrCourse); // SSR data hai toh loading skip
  const [error, setError]           = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const {
    isFormOpen,
    isDownloading,
    error: downloadError,
    requestDownload,
    closeForm,
    handleSuccess,
  } = useDownload({
    filenamePrefix: course?.title ?? "Slate-Academy",
    onDownloadSuccess: ({ label, filename }) => {
      console.log("Download completed:", { label, filename });
    },
  });

  // Fetch — SSR data hone par skip karo
  useEffect(() => {
    if (!slug) return;
    if (ssrCourse) return; // SSR se aa gaya, client fetch mat karo

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCourseBySlug(slug);
        if (!cancelled) setCourse(data);
      } catch (err: unknown) {
        if (!cancelled) {
          const status = (err as { response?: { status: number } })?.response?.status;
          setError(status === 404 ? "not-found" : "server-error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [slug]);

  // Slug change hone par (client navigation) — refetch karo
  useEffect(() => {
    if (!slug) return;
    if (!ssrCourse) return; // SSR nahi tha toh upar wala useEffect handle karega

    // Agar SSR data ka slug match nahi karta (user navigate kiya) toh fetch karo
    const ssrSlug = (ssrCourse as TCourseDetail & { slug?: string })?.slug;
    if (ssrSlug && ssrSlug !== slug) {
      let cancelled = false;
      setLoading(true);
      setError(null);

      fetchCourseBySlug(slug)
        .then((data) => { if (!cancelled) setCourse(data); })
        .catch((err: unknown) => {
          if (!cancelled) {
            const status = (err as { response?: { status: number } })?.response?.status;
            setError(status === 404 ? "not-found" : "server-error");
          }
        })
        .finally(() => { if (!cancelled) setLoading(false); });

      return () => { cancelled = true; };
    }
  }, [slug]);

  // SEO — client side update (SSR already inject kar chuka hai)
  useEffect(() => {
    if (!course) return;
    const seo = course.seo;
    document.title = seo?.title || course.title || "Slate Academy";
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (metaDesc) metaDesc.content = seo?.description || "";
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) canonical.href = seo?.canonical || `https://slate-academy.com/${course.slug}`;
  }, [course]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    topRef.current?.scrollIntoView({ behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    const initAos = async () => {
      const [{ default: AOS }] = await Promise.all([
        import("aos"),
        import("aos/dist/aos.css"),
      ]);

      if (!isMounted) return;
      AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 60 });
      AOS.refresh();
    };

    initAos();

    return () => {
      isMounted = false;
    };
  }, [course]);

  useEffect(() => {
    document.body.style.overflow = isImageZoomed || isFormOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isImageZoomed, isFormOpen]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f0f5]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0037FF]" aria-label="Loading course" />
      </div>
    );
  }

  if (error === "not-found" || !course) {
    return (
      <div className="min-h-screen bg-[#f0f0f5] w-full">
        <div className="mx-auto px-4 py-8 max-w-4xl text-center">
          <div className="bg-white rounded-3xl shadow-lg p-12">
            <h1 className="text-3xl font-black text-slate-900 mb-4">Course Not Found</h1>
            <p className="text-slate-500 mb-8">The course you're looking for doesn't exist or is not available.</p>
            <Link to="/courses">
              <Button className="bg-[#0037FF] hover:bg-[#4a6ff7]">Back to Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error === "server-error") {
    return (
      <div className="min-h-screen bg-[#f0f0f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-700 font-semibold text-lg mb-4">Something went wrong.</p>
          <Button onClick={() => window.location.reload()} className="bg-[#0037FF] hover:bg-[#4a6ff7]">Try Again</Button>
        </div>
      </div>
    );
  }

  const syllabusPdf = course.roadmap?.[0]?.ctaFileUrl ?? null;
  const heroTitle   = course.heroTitle   || course.title;
  const heroDesc    = course.heroDescription || course.shortDescription;

  return (
    <div className="min-h-screen bg-[#f0f0f5]" ref={topRef}>

      <div className="container mx-auto px-4 pt-6 max-w-6xl">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <Link to="/" className="hover:text-[#0037FF] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/courses" className="hover:text-[#0037FF] transition-colors">Courses</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium truncate">{course.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#eef0fb] via-[#f3f1fa] to-[#eef0fb] rounded-3xl shadow-lg overflow-hidden p-6 md:p-10"
        >
          <div className="flex flex-col-reverse lg:flex-row items-center gap-10">
            <div className="flex-1 w-full" data-aos="fade-right">
              <span className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-5 shadow-sm text-xs font-semibold text-[#0037FF]">
                🔥 {course.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-[1.1] mb-3">
                {heroTitle}
              </h1>
              <p className="text-base md:text-base font-semibold text-slate-700 mb-4">
                {heroDesc}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
                {course.highlights?.length > 0 ? (
                  course.highlights.map((h, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 shadow-sm">
                      {h}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 shadow-sm">
                      <Clock className="h-4 w-4 text-[#0037FF]" />{course.duration}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 shadow-sm">
                      <BarChart2 className="h-4 w-4 text-[#0037FF]" />{course.level}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 shadow-sm">
                      <Users className="h-4 w-4 text-[#0037FF]" />Expert Faculty
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button className="bg-[#0037FF] hover:bg-[#4a6ff7] text-white rounded-full px-6 py-3 shadow-md">
                  <Play className="h-4 w-4 mr-2" />Start Learning
                </Button>
                <Button
                  variant="outline"
                  onClick={() => requestDownload(syllabusPdf, "Syllabus")}
                  disabled={!syllabusPdf}
                  className={`bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full px-6 py-3 shadow-sm ${!syllabusPdf ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {syllabusPdf ? "Download Syllabus" : "Syllabus Coming Soon"}
                </Button>
              </div>
              {downloadError && (
                <p className="text-sm text-red-500 mt-3">{downloadError}</p>
              )}
            </div>

            <div className="flex-1 w-full" data-aos="fade-left" data-aos-delay="150">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => course.thumbnail && setIsImageZoomed(true)}
                className="relative rounded-3xl overflow-hidden border-4 border-white aspect-[4/3] cursor-zoom-in group"
              >
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                )}
               
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* <AnimatePresence>
        {isImageZoomed && course.thumbnail && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsImageZoomed(false)}
            className="fixed inset-0 z-50  flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              src={course.thumbnail}
              alt={course.title}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl cursor-default"
            />
            <button onClick={() => setIsImageZoomed(false)} className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 text-white rounded-full p-2" aria-label="Close">
              <X className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence> */}

      <section className="w-full">
        <CourseOverview category={course.category} overview={course.overview} highlights={course.whatsIncluded} />
      </section>
      <section className="w-full">
        <ToolStack tools={course.toolsCovered} />
      </section>
      <section className="w-full">
        <IncludedOutcomes outcomes={course.learningOutcomes} />
      </section>
      <section className="w-full">
        <ProgramStructure roadmap={course.roadmap} syllabus={syllabusPdf} onRequestDownload={requestDownload} />
      </section>
      <section className="w-full">
        <PortfolioProjects projects={course.portfolioProjects} />
      </section>
      <section className="w-full">
        <CareerOpportunities careers={course.careerOpportunities} />
      </section>
      <section className="w-full">
        <Certification certification={course.certification} />
      </section>
      <section className="w-full">
        <CounsellorForm courseTitle={course.title} />
      </section>
      <section className="w-full">
        <FAQ faqs={course.faqs} />
      </section>
      <section className="w-full">
        <FinalCTA courseTitle={course.title} price={course.pricing?.price ?? 0} />
      </section>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeForm}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg relative"
            >
              <button
                onClick={closeForm}
                disabled={isDownloading}
                className="absolute -top-3 -right-3 bg-white text-slate-700 rounded-full p-2 shadow-md hover:bg-slate-50 z-10 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
              <Form onClose={closeForm} onSuccess={handleSuccess} isSubmitting={isDownloading} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetail;