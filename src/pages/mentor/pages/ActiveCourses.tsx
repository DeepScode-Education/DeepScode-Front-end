import { Clock, Users, ArrowRight } from "lucide-react";
import type { Course } from "@/types/mentor";

interface ActiveCoursesProps {
  courses: Course[];
  exploreLink?: string;
}




function ActiveCourses({ courses, exploreLink = "#" }: ActiveCoursesProps) {
  return (
    <section className="w-full bg-white py-20 px-5">
      <div className="max-w-[1240px] mx-auto">
        {/* Header */}

        <div className="flex items-center justify-between mb-12">
          <h2
            className="
            text-[22px]
            md:text-[30px]
            font-bold
            text-[#111827]
            "
          >
            Active Courses
          </h2>

          <a
            href={exploreLink}
            className="
            hidden
            md:flex
            items-center
            gap-2
            text-[#3157FF]
            font-medium
            text-[15px]
            hover:gap-3
            transition-all
            "
          >
            Explore All Courses
            <ArrowRight size={18} />
          </a>
        </div>

        {/* Cards */}

        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-7
          justify-items-center
          "
        >
          {courses.map((course) => (
            <div
              key={course.id}
              className="
              w-full
              max-w-[380px]
              bg-white
              rounded-[22px]
              border
              border-[#EEEEEE]
              overflow-hidden
              hover:-translate-y-1
              transition-all
              duration-300
              "
            >
              {/* Image */}

              <div
                className="
                w-full
                h-[210px]
                overflow-hidden
                "
              >
                <img
                  src={course.image}
                  alt={course.title}
                  className="
                  w-full
                  h-full
                  object-cover
                  hover:scale-105
                  transition-transform
                  duration-500
                  "
                />
              </div>

              {/* Content */}

              <div
                className="
                p-6
                "
              >
                <h3
                  className="
                  text-[20px]
                  font-semibold
                  text-[#111827]
                  mb-3
                  "
                >
                  {course.title}
                </h3>

                <p
                  className="
                  text-[15px]
                  text-[#6B7280]
                  leading-6
                  min-h-[72px]
                  "
                >
                  {course.description}
                </p>

                {/* Meta */}

                <div
                  className="
                  flex
                  items-center
                  gap-5
                  mt-5
                  text-[#555]
                  text-[14px]
                  "
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {course.duration}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    {course.students}
                  </div>
                </div>

                {/* Footer */}

                <div
                  className="
                  border-t
                  border-[#E5E7EB]
                  mt-6
                  pt-5
                  flex
                  items-center
                  justify-between
                  "
                >
                  {/* <span
                    className="
                    text-[18px]
                    font-bold
                    text-[#111827]
                    "
                  >
                    {course.price}
                  </span> */}

                  <button
                    className="
                    flex
                    items-center
                    gap-2
                    text-[#3157FF]
                    font-medium
                    text-[15px]
                    hover:gap-3
                    transition-all
                    "
                  >
                    View Details
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ActiveCourses;
