import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import HeroSection from "@/components/home/HeroSection";

const TrustSection = lazy(() => import("@/components/home/TrustSection"));
const CategorySection = lazy(() => import("@/components/home/CategorySection"));
const Testimonials = lazy(() => import("@/components/home/Testimonials"));
const StudentPlacementSlider = lazy(
  () => import("@/components/home/StudentPlacementSlider")
);
const FinalCTA = lazy(() => import("@/components/home/FinalCTA"));

interface ViewportSectionProps {
  children: ReactNode;
  fallbackClassName?: string;
}

const ViewportSection = ({
  children,
  fallbackClassName = "min-h-[320px]",
}: ViewportSectionProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "250px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!shouldLoad) {
    return <div ref={ref} className={fallbackClassName} aria-hidden="true" />;
  }

  return (
    <div ref={ref}>
      <Suspense fallback={<div className={fallbackClassName} />}>
        {children}
      </Suspense>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <ViewportSection fallbackClassName="min-h-[320px]">
        <TrustSection />
      </ViewportSection>

      <ViewportSection fallbackClassName="min-h-[420px]">
        <CategorySection />
      </ViewportSection>

      {/* <FeaturedCourses /> */}

      <ViewportSection fallbackClassName="min-h-[520px]">
        <Testimonials />
      </ViewportSection>

      <ViewportSection fallbackClassName="min-h-[420px]">
        <StudentPlacementSlider />
      </ViewportSection>

      <ViewportSection fallbackClassName="min-h-[280px]">
        <FinalCTA />
      </ViewportSection>
    </div>
  );
};

export default Index;