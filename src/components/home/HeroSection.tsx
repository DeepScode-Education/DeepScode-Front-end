import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  optimizeCloudinaryImage,
  buildCloudinarySrcSet,
  hasCloudinaryImage,
} from "@/lib/image";
import { useSsrData } from "@/ssr/SsrDataContext";

interface Slide {
  _id?: string;
  title: string;
  subtitle: string;
  image: string;
}

const API = `${import.meta.env.VITE_API_BASE}/api/hero`;
const AUTOPLAY_INTERVAL = 9000;

const RESPONSIVE_WIDTHS = [480, 768, 1024, 1440];
const IMAGE_SIZES = "(min-width: 768px) 50vw, 100vw";
const PRELOAD_WIDTH = 960;
const IMAGE_WIDTH = 960;
const IMAGE_HEIGHT = 720;

const HeroSection = () => {
  const ssrSlides = useSsrData<Slide[]>("heroSlides");

  const [slides, setSlides] = useState<Slide[]>(ssrSlides ?? []);
  const [loading, setLoading] = useState(!ssrSlides || ssrSlides.length === 0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fade-out → fade-in for both text and image
  const [visible, setVisible] = useState(true);

  // Some Cloudinary assets (e.g. ones uploaded as resource_type "raw"
  // instead of "image") 404 when transformation params are appended to
  // their URL, even though the untouched URL loads fine. When the
  // optimized URL fails for the current slide, we fall back to serving
  // the raw asset untouched rather than showing a broken image — this
  // costs us the responsive/format optimization for that one asset only,
  // every other slide still gets the full optimized treatment.
  const [optimizedFailed, setOptimizedFailed] = useState(false);

  // No client-side cache layer here anymore. The API is served no-store
  // (see server.js / hero.controller.js) and Redis is invalidated on every
  // admin write, so a plain GET is always current — there's no staleness
  // window left to paper over with a cache, and no reason to delay the
  // first paint waiting on a preload race.
  const fetchSlides = useCallback(async () => {
    try {
      const res = await axios.get(API);
      const data: Slide[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setSlides(data);
    } catch (err) {
      console.error("Hero slides error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // SSR data paints instantly on first load; this call reconciles with
    // whatever is currently in the DB the moment the client takes over —
    // that's what makes admin edits show up immediately for new visitors
    // and on refresh, without any client-cache TTL to wait out.
    fetchSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!slides.length) return;

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    setVisible(false);
    const timeout = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timeout);
  }, [activeIndex]);

  const goToSlide = useCallback((i: number) => {
    setActiveIndex(i);
  }, []);

  const activeSlide = slides[activeIndex];
  const activeImageOk = hasCloudinaryImage(activeSlide?.image);

  useEffect(() => {
    setOptimizedFailed(false);
  }, [activeSlide?._id, activeSlide?.image]);

  if (loading || !slides.length) {
    return (
      <section className="relative overflow-hidden">
        <h1 className="sr-only">
          Slate Academy: Best Designing and Marketing Institute in Delhi
        </h1>
        <div className="container py-10 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 lg:gap-16">
            <div className="order-2 md:order-1 space-y-4">
              <div className="h-10 bg-gray-200 animate-pulse rounded-lg w-4/5" />
              <div className="h-10 bg-gray-200 animate-pulse rounded-lg w-3/5" />
              <div className="h-10 bg-gray-200 animate-pulse rounded-lg w-2/4" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-full mt-6" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-4/6" />
              <div className="flex gap-4 mt-8">
                <div className="h-10 w-36 bg-blue-200 animate-pulse rounded-md" />
                <div className="h-10 w-36 bg-orange-200 animate-pulse rounded-md" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-full aspect-[4/3] bg-gray-200 animate-pulse rounded-xl" />
            </div>
          </div>
          <div className="mt-10 flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full bg-gray-200 animate-pulse ${i === 2 ? "w-10" : "w-2"}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      <h1 className="sr-only">
        Slate Academy: Best Designing and Marketing Institute in Delhi
      </h1>

      <div className="container py-10 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 lg:gap-16">

          {/* ── Left column ── */}
          <div className="order-2 md:order-1">

            <div
              className={`transition-opacity duration-300 ${
                visible ? "opacity-100" : "opacity-0"
              }`}
            >
              <h2 className="text-2xl lg:text-4xl font-bold text-black">
                {activeSlide?.title}
              </h2>
              <p className="mt-5 text-muted-foreground font-medium">
                {activeSlide?.subtitle}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 text-white font-bold sm:flex-row sm:gap-4">
              <Button asChild className="w-full justify-center sm:w-auto">
                <Link to="/courses">Explore Courses →</Link>
              </Button>

              <Button
                variant="orange"
                className="w-full justify-center sm:w-auto border border-orange-400 bg-transparent text-orange-400 hover:bg-orange-500 hover:text-white"
                onClick={() => {
                  window.dispatchEvent(new Event("open-enquiry-popup"));
                }}
              >
                Book Free Counselling
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold text-black">
              <div className="flex items-center gap-2">⭐ <span>5.0 Google Rating</span></div>
              <div className="flex items-center gap-2">👥 <span>1,200+ Students</span></div>
              <div className="flex items-center gap-2">🎁 <span>2,500+ Projects</span></div>
              <div className="flex items-center gap-2">🏅 <span>96 Hiring Partners</span></div>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Live Classes", "Industry Projects", "Portfolio Ready", "Placement Support"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">
                        ✓
                      </span>
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ── Right column: image ── */}
          <div className="order-1 md:order-2 overflow-hidden rounded-xl bg-gray-100 aspect-[4/3]">
            {activeImageOk ? (
              <img
                // Keyed on the slide/image identity so React fully swaps the
                // <img> element (not just its src) on every transition —
                // this is what makes the fade + load behave consistently in
                // Safari instead of holding the previous decoded frame.
                key={activeSlide?._id ?? activeSlide?.image}
                src={
                  optimizedFailed
                    ? activeSlide?.image
                    : optimizeCloudinaryImage(activeSlide?.image, {
                        width: IMAGE_WIDTH,
                        quality: "auto:good",
                        format: "auto",
                        crop: "fill",
                        gravity: "auto",
                        dpr: "auto",
                      })
                }
                srcSet={
                  optimizedFailed
                    ? undefined
                    : buildCloudinarySrcSet(activeSlide?.image, RESPONSIVE_WIDTHS)
                }
                sizes={IMAGE_SIZES}
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                alt={activeSlide?.title}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  visible ? "opacity-100" : "opacity-0"
                }`}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={(e) => {
                  // First failure on the optimized URL for this slide: retry
                  // once with the raw, untransformed URL (covers Cloudinary
                  // "raw" resource-type assets that 404 on any transform
                  // params). If the raw URL also fails, hide the element
                  // instead of leaving a broken-image icon painted.
                  if (!optimizedFailed) {
                    setOptimizedFailed(true);
                  } else {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }
                }}
              />
            ) : (
              <div className="h-full w-full bg-gray-100" />
            )}
          </div>
        </div>

        {/* Dot navigation */}
        <div className="mt-10 flex justify-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                activeIndex === i ? "w-10 bg-blue-600" : "w-2 bg-blue-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;