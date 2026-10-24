
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Palette,
  Code,
  Megaphone,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchCourses, type CourseCard } from "../../integrations/courseApi";

type CategorySectionProps = { data?: any };

// Static presentation metadata
const CATEGORY_META = [
  // {
  //   icon: "palette",
  //   title: "GRAPHIC DESIGN",
  //   slug: "graphic-design-course",
  //   category: "Design",
  //   desc: "Learn to tell visual stories through compelling designs made with the latest software.",
  //   color: "text-pink-500",
  //   bg: "bg-pink-50",
  // },
  // {
  //   icon: "megaphone",
  //   title: "MOTION GRAPHICS",
  //   slug: "motion-graphics-design-course",
  //   category: "Design",
  //   desc: "Bring life to your visuals through animation and special effects.",
  //   color: "text-amber-500",
  //   bg: "bg-amber-50",
  // },
  // {
  //   icon: "palette",
  //   title: "UI/UX DESIGN",
  //   slug: "ui-ux-design-course",
  //   category: "Design",
  //   desc: "Create aesthetic and engaging digital interfaces that impress and perform for business success.",
  //   color: "text-pink-500",
  //   bg: "bg-pink-50",
  // },
  // {
  //   icon: "code",
  //   title: "3D DESIGN",
  //   slug: "3d-design-course",
  //   category: "3D",
  //   desc: "Elevate your ideas through space designs, product mock-ups and cinematic effects.",
  //   color: "text-blue-500",
  //   bg: "bg-blue-50",
  // },
  {
    icon: "code",
    title: "WEB DEVELOPMENT",
    slug: "web-development-course",
    category: "Development",
    desc: "Build dynamic websites and web applications with the latest technologies and frameworks.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: "megaphone",
    title: "DIGITAL MARKETING",
    slug: "digital-marketing-course",
    category: "Marketing",
    desc: "Become a sought-after marketing professional with sharp business insights and tools expertise.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: "barchart3",
    title: "DATA ANALYTICS",
    slug: "data-analytics-course",
    category: "Data",
    desc: "Make sense of business data for performance and efficiency through the latest tools and techniques.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: "code",
    title: "CYBER SECURITY & ETHICAL HACKING",
    slug: "cyber-security-ethical-hacking",
    category: "Cyber Security",
    desc: "Build practical cybersecurity skills and learn ethical hacking, network security, vulnerability assessment and modern security tools.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

const iconMap: Record<string, any> = {
  palette: Palette,
  code: Code,
  megaphone: Megaphone,
  barchart3: BarChart3,
  barchart: BarChart3,
};

const CategorySection = ({ data }: CategorySectionProps) => {
  const title = data?.title || "What's on Your DeepScode?";

  const subtitle =
    data?.subtitle ||
    "From graphic design to data analytics, from 3D to digital marketing, as your talent, so is a course at the best design and marketing training institute in Delhi.";

  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Mobile carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  // Fetch all courses once
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const result = await fetchCourses({ limit: 100 });

        if (!cancelled) {
          setCourses(result.courses);
        }
      } catch {
        if (!cancelled) {
          setCourses([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Merge static presentation data with live API data
  const items = useMemo(() => {
    const source =
      Array.isArray(data?.items) && data.items.length
        ? data.items
        : CATEGORY_META;

    return source.map((cat: any) => {
      const count = courses.filter((c) => c.category === cat.category).length;

      const slugExists = cat.slug
        ? courses.some((c) => c.slug === cat.slug)
        : false;

      return {
        ...cat,
        count,
        slugExists,
      };
    });
  }, [courses, data?.items]);

  // Scroll to selected mobile card
  const scrollToSlide = (index: number) => {
    if (!mobileCarouselRef.current) return;

    const container = mobileCarouselRef.current;
    const slideWidth = container.clientWidth;

    container.scrollTo({
      left: index * slideWidth,
      behavior: "smooth",
    });

    setActiveIndex(index);
  };

  // Previous slide
  const prevSlide = () => {
    if (activeIndex > 0) {
      scrollToSlide(activeIndex - 1);
    }
  };

  // Next slide
  const nextSlide = () => {
    if (activeIndex < items.length - 1) {
      scrollToSlide(activeIndex + 1);
    }
  };

  // Detect finger swipe / native scrolling position
  const handleMobileScroll = () => {
    if (!mobileCarouselRef.current) return;

    const container = mobileCarouselRef.current;
    const slideWidth = container.clientWidth;

    if (!slideWidth) return;

    const index = Math.round(container.scrollLeft / slideWidth);

    if (index !== activeIndex) {
      setActiveIndex(Math.max(0, Math.min(index, items.length - 1)));
    }
  };

  // Reset carousel when API/data changes
  useEffect(() => {
    setActiveIndex(0);

    if (mobileCarouselRef.current) {
      mobileCarouselRef.current.scrollTo({
        left: 0,
        behavior: "auto",
      });
    }
  }, [items.length]);

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        {/* SECTION HEADER */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
            {title}
          </h2>

          <p className="mt-3 text-muted-foreground font-semibold">{subtitle}</p>
        </div>

        {/* =====================================================
            MOBILE CAROUSEL
            ===================================================== */}
        <div className="relative mt-12 sm:hidden">
          {/* LEFT ARROW */}
          <button
            type="button"
            onClick={prevSlide}
            disabled={activeIndex === 0}
            aria-label="Previous course"
            className={`
              absolute left-0 top-1/2 z-20
              flex h-10 w-10 -translate-x-1/2 -translate-y-1/2
              items-center justify-center
              rounded-full border border-border
              bg-white shadow-md
              transition-all duration-200 hidden sm:flex
              ${
                activeIndex === 0
                  ? "cursor-not-allowed opacity-40"
                  : "hover:scale-105 active:scale-95"
              }
            `}
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>

          {/* RIGHT ARROW */}
          <button
            type="button"
            onClick={nextSlide}
            disabled={activeIndex === items.length - 1}
            aria-label="Next course"
            className={`
              absolute right-0 top-1/2 z-20
              flex h-10 w-10 translate-x-1/2 -translate-y-1/2
              items-center justify-center
              rounded-full border border-border
              bg-white shadow-md
              transition-all duration-200 hidden sm:flex
              ${
                activeIndex === items.length - 1
                  ? "cursor-not-allowed opacity-40"
                  : "hover:scale-105 active:scale-95"
              }
            `}
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>

          {/* CAROUSEL */}
          <div
            ref={mobileCarouselRef}
            onScroll={handleMobileScroll}
            className="
              flex
              w-full
              snap-x
              snap-mandatory
              overflow-x-auto
              scroll-smooth
              scrollbar-hide
              touch-pan-x
              overscroll-x-contain
            "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {items.map((cat: any, i: number) => {
              const Icon =
                iconMap[(cat.icon || "").toString().toLowerCase()] || Palette;

              return (
                <div
                  key={cat.title}
                  className="w-full min-w-full shrink-0 snap-center px-1"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 }}
                    className="
                      group
                      flex
                      min-h-[340px]
                      flex-col
                      justify-between
                      rounded-xl
                      border
                      border-border
                      bg-card
                      p-6
                      shadow-card
                    "
                  >
                    <div>
                      {/* ICON */}
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg}`}
                      >
                        <Icon className={`h-6 w-6 ${cat.color}`} />
                      </div>

                      {/* TITLE */}
                      <h3 className="mt-4 text-lg font-semibold text-foreground">
                        {cat.title}
                      </h3>

                      {/* DESCRIPTION */}
                      <p className="mt-2 text-sm font-medium text-muted-foreground">
                        {cat.desc}
                      </p>
                    </div>

                    {/* EXPLORE */}
                    <Button
                      variant="link"
                      className="mt-6 self-start px-0"
                      asChild
                    >
                      <Link
                        to={cat.slugExists ? `/${cat.slug}` : "/courses"}
                        aria-label={`View details for ${cat.title}`}
                      >
                        Explore →
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* DOTS */}
          <div className="mt-5 flex items-center justify-center gap-2">
            {items.map((cat: any, index: number) => (
              <button
                key={`${cat.title}-dot`}
                type="button"
                onClick={() => scrollToSlide(index)}
                aria-label={`Go to ${cat.title}`}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${
                    activeIndex === index
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted-foreground/30"
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* =====================================================
            TABLET + DESKTOP GRID
            ===================================================== */}
        <div className="mt-12 hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {items.map((cat: any, i: number) => {
            const Icon =
              iconMap[(cat.icon || "").toString().toLowerCase()] || Palette;

            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="
                  group
                  flex
                  flex-col
                  justify-between
                  rounded-xl
                  border
                  border-border
                  bg-card
                  p-6
                  shadow-card
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-card-hover
                "
              >
                <div>
                  {/* ICON */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${cat.color}`} />
                  </div>

                  {/* TITLE */}
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {cat.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {cat.desc}
                  </p>
                </div>

                {/* EXPLORE */}
                <Button variant="link" className="mt-6 self-start px-0" asChild>
                  <Link
                    to={cat.slugExists ? `/${cat.slug}` : "/courses"}
                    aria-label={`View details for ${cat.title}`}
                  >
                    Explore →
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
