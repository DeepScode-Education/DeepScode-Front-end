import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Play, Star, X } from "lucide-react";
import axios from "axios";

type TestimonialVideo = { url: string } | string | null;

type Testimonial = {
  _id: string;
  name: string;
  role: string;
  text: string;
  image: { url: string };
  video?: TestimonialVideo;
  rating: number;
  isActive: boolean;
  displayOrder: number;
};

type TestimonialsApiResponse = {
  success?: boolean;
  data?: Testimonial[];
};

type Props = {
  data?: {
    title?: string;
    subtitle?: string;
  };
};

const API_BASE = import.meta.env.VITE_API_BASE || "";

const Testimonials = ({ data }: Props) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: res } = await axios.get<TestimonialsApiResponse>(
          `${API_BASE}/api/testimonials`
        );

        const items = Array.isArray(res.data) ? res.data : [];
        const visibleTestimonials = items
          .filter((item) => item.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        setTestimonials(visibleTestimonials);
      } catch (err) {
        console.error("Testimonials fetch error:", err);
        setError("Unable to load testimonials right now.");
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    autoplay.current.reset();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    autoplay.current.reset();
  }, [emblaApi]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
    emblaApi.on("reInit", () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  // Reinit carousel when testimonials load
  useEffect(() => {
    if (emblaApi && testimonials.length > 0) {
      emblaApi.reInit();
    }
  }, [emblaApi, testimonials]);

  const fallbackCards = (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border bg-card shadow-sm animate-pulse"
        >
          <div className="h-56 bg-gray-200" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-12 rounded bg-gray-100" />
            <div className="h-4 w-32 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading || error || testimonials.length === 0) {
    return (
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              {data?.title || "WHAT SLATE-ERS ARE SAYING"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {data?.subtitle || "Real success stories from real career-changers"}
            </p>
          </div>
          {loading ? (
            fallbackCards
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
              <p className="text-lg font-medium text-foreground">
                {error || "Testimonials will be available soon."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please check back shortly for fresh stories.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      {/* Video modal */}
      {video && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setVideo(null)}
        >
          {/* <div
            className="relative w-full max-w-3xl mx-4 aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={video}
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setVideo(null)}
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition"
              aria-label="Close video"
            >
              <X className="h-4 w-4" />
            </button>
          </div> */}

          <div
  className="relative w-full max-w-5xl max-h-[90vh] mx-4 rounded-2xl overflow-hidden bg-black"
  onClick={(e) => e.stopPropagation()}
>
  <video
    src={video}
    controls
    autoPlay
    className="w-full max-h-[90vh] object-contain"
  />

  <button
    onClick={() => setVideo(null)}
    className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white"
  >
    <X className="h-4 w-4" />
  </button>
</div>
        </div>
      )}

      <div className="container">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold lg:text-4xl">
            {data?.title || "WHAT SLATE-ERS ARE SAYING"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {data?.subtitle || "Real success stories from real career-changers"}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <button
            onClick={scrollPrev}
            aria-label="Previous testimonial"
            className="hidden sm:flex absolute left-0 top-1/2 z-20 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl border transition hover:bg-orange-500 hover:text-white"
          >
            <ChevronLeft />
          </button>

          <div className="overflow-hidden mx-2" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {testimonials.map((item) => {
                const videoUrl =
                  typeof item.video === "string" ? item.video : item.video?.url;

                return (
                  <div
                    key={item._id}
                    className="flex-[0_0_100%] min-w-0 px-3 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                  >
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-lg transition-transform duration-300 hover:-translate-y-1">
                      <div className="relative h-56 shrink-0">
                        <img
                          src={item.image?.url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          draggable={false}
                          loading="lazy"
                          width={640}
                          height={720}
                        />
                        {videoUrl && (
                          <button
                            onClick={() => setVideo(videoUrl)}
                            aria-label={`Play ${item.name}'s video testimonial`}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 transition hover:bg-black/50"
                          >
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl">
                              <Play className="fill-white" />
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex gap-1">
                          {Array.from({ length: item.rating || 5 }).map((_, s) => (
                            <Star
                              key={s}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                          "{item.text}"
                        </p>
                        <h3 className="mt-5 font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.role}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={scrollNext}
            aria-label="Next testimonial"
            className="hidden sm:flex absolute right-0 top-1/2 z-20 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl border transition hover:bg-orange-500 hover:text-white"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                emblaApi?.scrollTo(idx);
                autoplay.current.reset();
              }}
              aria-label={`Go to testimonial ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === selectedIndex
                  ? "w-6 bg-orange-500"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;