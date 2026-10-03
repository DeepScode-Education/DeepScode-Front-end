

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MentorHero from "./pages/MentorHero";
import AboutExpertise from "./pages/AboutExpertise";
import CareerMilestones from "./pages/CareerMilestones";
import FeaturedProjects from "./pages/FeaturedProjects";
import ArtistToolkit from "./pages/ArtistToolkit";
import StudentSuccessStories from "./pages/StudentSuccessStories";
import ActiveCourses from "./pages/ActiveCourses";
import FAQSection from "./pages/FAQSection";
import MentorCTA from "./pages/MentorCTA";

import { getMentorBySlug } from "@/services/mentor.service";
import type { MentorDetail as MentorDetailData } from "@/types/mentor";

function NotFoundState({ slug }: { slug?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="text-2xl font-bold text-[#111827]">Mentor not found</h1>
      <p className="text-gray-500">
        We couldn't find a mentor matching "{slug}".
      </p>
      <Link
        to="/mentors"
        className="rounded-full bg-[#3157FF] px-6 py-2.5 text-sm font-semibold text-white"
      >
        Back to Mentors
      </Link>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="text-2xl font-bold text-[#111827]">Something went wrong</h1>
      <p className="text-gray-500">
        We couldn't load this mentor's profile right now. Please try again.
      </p>
      <Link
        to="/mentors"
        className="rounded-full bg-[#3157FF] px-6 py-2.5 text-sm font-semibold text-white"
      >
        Back to Mentors
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-gray-500">Loading mentor...</p>
    </div>
  );
}

function MentorDetail() {
  const { slug } = useParams<{ slug: string }>();

  const [mentor, setMentor] = useState<MentorDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setLoading(true);
    setHasError(false);

    getMentorBySlug(slug)
      .then((data) => {
        if (isMounted) setMentor(data);
      })
      .catch((err) => {
        console.error("Failed to fetch mentor profile:", err);
        if (isMounted) setHasError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) return <LoadingState />;
  if (hasError) return <ErrorState />;
  if (!mentor) return <NotFoundState slug={slug} />;

  return (
    <div>
      <MentorHero mentor={{ ...mentor, studentsCount: mentor.studentsCount ? Number(mentor.studentsCount) : 0 }} />

      <AboutExpertise
        mentor={{
          name: mentor.name,
          about: mentor.about,
          expertise: mentor.expertise,
        }}
      />

      {mentor.careerMilestones && mentor.careerMilestones.length > 0 && (
        <CareerMilestones milestones={mentor.careerMilestones} />
      )}

      {mentor.featuredProjects && mentor.featuredProjects.length > 0 && (
        <FeaturedProjects
          projects={mentor.featuredProjects}
          artStationUrl={mentor.artStationUrl}
        />
      )}

      {mentor.toolkit && mentor.toolkit.categories?.length > 0 && (
        <ArtistToolkit
          title={mentor.toolkit.title}
          subtitle={mentor.toolkit.subtitle}
          categories={mentor.toolkit.categories}
        />
      )}

      {mentor.testimonials && mentor.testimonials.length > 0 && (
        <StudentSuccessStories
          testimonials={mentor.testimonials}
          totalStudents={`${mentor.studentsCount ?? 0}+`}
        />
      )}

      {mentor.courses && mentor.courses.length > 0 && (
        <ActiveCourses courses={mentor.courses} exploreLink="/courses" />
      )}

      {mentor.faqs && mentor.faqs.length > 0 && (
        <FAQSection faqs={mentor.faqs} mentorName={mentor.name} />
      )}

      <MentorCTA mentorName={mentor.name} />
    </div>
  );
}

export default MentorDetail;