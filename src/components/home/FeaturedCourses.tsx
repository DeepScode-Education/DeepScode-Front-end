
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const courses = [
  {
    id: "1",
    title: "UI UX Design Course for Beginners",
    duration: "8 weeks",
    level: "Beginner",
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=960&q=80",
  },
  {
    id: "2",
    title: "3D Design & Visualization",
    duration: "12 weeks",
    level: "Intermediate",
    category: "3D",
    image:
      "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?auto=format&fit=crop&w=960&q=80",
  },
  {
    id: "3",
    title: "Digital Marketing Course After 10th",
    duration: "6 weeks",
    level: "Beginner",
    category: "Marketing",
    image:
      "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=960&q=80",
  },
  {
    id: "4",
    title: "Data Analyst Course After 12th",
    duration: "10 weeks",
    level: "Intermediate",
    category: "Data",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=960&q=80",
  },
  {
    id: "5",
    title: "Product Design Sprint",
    duration: "4 weeks",
    level: "Beginner",
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=960&q=80",
  },
  {
    id: "6",
    title: "3D Modeling & Rendering Masterclass",
    duration: "8 weeks",
    level: "Intermediate",
    category: "3D",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=960&q=80",
  },
];

const FeaturedCourses = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
            Top Career Oriented Courses
          </h2>
          <p className="mt-3 text-muted-foreground">
            Handpicked by our team for maximum impact
          </p>
        </div>

        {/* Scroll section with arrows on both sides */}
        <div className="mt-8 flex items-center gap-3">

          {/* LEFT ARROW */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex flex-shrink-0 rounded-lg border border-border p-2 hover:bg-accent transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-7 w-7 text-muted-foreground" />
          </button>

          {/* SCROLL TRACK */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 flex-1"
            style={{ scrollbarWidth: "none" }}
          >
            {courses.map((course) => (
              <div
                key={course.id}
                className="group min-w-[280px] max-w-[300px] shrink-0 flex flex-col justify-between rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              >
                {/* Image */}
                <div className="h-40 rounded-t-xl overflow-hidden bg-muted">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    width={960}
                    height={640}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {course.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart2 className="h-3.5 w-3.5" /> {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Button always at bottom */}
                  <Button variant="link" className="mt-4 px-0 self-start" asChild>
                    <Link to="/courses">View Course →</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex flex-shrink-0 rounded-lg border border-border p-2 hover:bg-accent transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-7 w-7 text-muted-foreground" />
          </button>

        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;