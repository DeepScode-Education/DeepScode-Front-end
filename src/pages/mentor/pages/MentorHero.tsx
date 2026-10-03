
import {
  BriefcaseBusiness,
  Users,
  Box,
  Star,
  Globe,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";

interface MentorHeroProps {
  mentor: {
    name: string;
    designation?: string;
    company?: string;
    photoUrl?: string;
    heroImage?: string;

    experience?: string;
    studentsCount?: number;
    projects?: string;
    rating?: number;
    languages?: string;
    status?: string;

    description?: string;
  };
}

const MentorHero = ({ mentor }: MentorHeroProps) => {

  const handleApply = () => {
    window.dispatchEvent(
      new CustomEvent("open-enquiry-popup")
    );
  };
  return (
    <section className="bg-[#f7f7f9] py-16 md:py-20">
      <div className="container mx-auto flex flex-col items-center gap-8 px-5 lg:flex-row lg:gap-6">
        {/* LEFT CONTENT */}
        <div className="flex w-full flex-col lg:w-1/2 order-2 lg:order-1">
          {/* Badge */}
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#3155ff]/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#3155ff]">
            <BadgeCheck size={14} />
            TOP MENTOR
          </div>

          {/* Name */}
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#111827] md:text-4xl lg:text-[2.75rem]">
            {mentor.name}
          </h1>

          {/* Description */}
          <p className="mt-3 text-base font-medium leading-relaxed text-gray-600">
            {mentor.description ||
              `${mentor.designation || "Industry Expert"}. Helping students master industry skills.`}
          </p>

          {/* Stats */}
          <div className="mt-9 flex flex-wrap gap-x-4   gap-y-6">
            <Stat
              icon={<BriefcaseBusiness size={16} />}
              title="EXPERIENCE"
              value={mentor.experience || "8+ Years"}
            />
            <Stat
              icon={<Users size={16} />}
              title="STUDENTS"
              value={`${mentor.studentsCount || "1200"}+`}
            />
            <Stat
              icon={<Box size={16} />}
              title="PROJECTS"
              value={mentor.projects || "150+"}
            />
            <Stat
              icon={<Star size={16} />}
              title="RATING"
              value={String(mentor.rating || 5.0)}
            />
            <Stat
              icon={<Globe size={16} />}
              title="LANGUAGES"
              value={mentor.languages || "English, Hindi"}
            />
            <Stat
              icon={<CalendarDays size={16} />}
              title="STATUS"
              value={mentor.status || "Available"}
            />
          </div>

          {/* Buttons */}
         <div className="mt-10 flex flex-wrap gap-4">
  <button className="rounded-full bg-[#3155ff] px-5 py-2.5 lg:px-6 lg:py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2444db] w-full sm:w-auto lg:w-1/3"
    onClick={handleApply}>
    Book a Discovery Call
  </button>
  {/* <button className="rounded-full border border-gray-300 px-5 py-2.5 lg:px-6 lg:py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-800 hover:bg-gray-900 hover:text-white w-full sm:w-auto lg:w-1/3">
    View Curriculum
  </button> */}
</div>
        </div>

        {/* IMAGE */}
      <div className="flex w-full justify-center lg:w-1/2 lg:justify-end order-1 lg:order-2">
          {/* <div className=" w-full overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/5"> */}
          <div className=" w-full overflow-hidden rounded-3xl  bg-transparent">
            <img
              src={mentor.heroImage || mentor.photoUrl || "/images/default-mentor.jpg"}
              alt={mentor.name}
              className="w-full h-[486px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorHero;

// Reusable Stats Component

interface StatProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const Stat = ({ icon, title, value }: StatProps) => {
  return (
    <div className="w-[calc(33.333%-1.75rem)] min-w-[100px]">
      <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-gray-400">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-1.5 text-base font-bold text-gray-900">{value}</p>
    </div>
  );
};