import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Briefcase,
  Users,
  TrendingUp,
  Lightbulb,
  Code,
  FolderKanban,
  Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";

const whatWeDo = [
  {
    icon: Lightbulb,
    title: "Learn by Doing",
    desc: "Hands-on projects from day one, not just theory.",
  },
  {
    icon: Code,
    title: "Industry-Relevant Courses",
    desc: "Curriculum designed with top companies in mind.",
  },
  {
    icon: Users,
    title: "Mentorship & Support",
    desc: "1-on-1 guidance from experienced professionals.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    desc: "Resume reviews, interview prep, and job referrals.",
  },
];

const steps = [
  { icon: BookOpen, label: "Learn", desc: "Master core concepts" },
  { icon: Code, label: "Practice", desc: "Solve real challenges" },
  {
    icon: FolderKanban,
    label: "Build Projects",
    desc: "Create your portfolio",
  },
  { icon: Rocket, label: "Get Job Ready", desc: "Land your dream role" },
];

const team = [
  {
    name: "Shadman Ahmed",
    role: "Founder | Managing Director",
  },
  {
    name: "Arnab Das",
    role: "Founder | CEO",
  },
  {
    name: "Sunny Singh",
    role: "Founder | Art Director",
  },
];
const AboutPage = () => (
  <>
    <main>
      {/* Hero */}
      <section className="container  text-center py-16">
        <h1 className="animate-fade-up text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          <span className="text-[#0037FF]">
            We Help You Build Skills
            <br />
            That Matter
          </span>
        </h1>
        <p className="animate-fade-up-delay-1 mx-auto mt-5 max-w-xl text-lg text-muted-foreground font-medium">
          From beginner to job-ready with real-world learning.
        </p>
      </section>

      {/* Mission */}
      <section className="bg-muted/30">
        <div className="container py-16 text-center">
          <h2 className="animate-fade-up text-2xl font-bold">Our Mission</h2>
          <p className="animate-fade-up-delay-1 mx-auto mt-4 max-w-2xl text-muted-foreground font-medium">
            We believe education should be practical, accessible, and
            career-focused. Our platform connects learners with real-world
            projects, industry mentors, and the skills employers actually look
            for.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="container py-16">
        <h2 className="animate-fade-up text-center text-2xl font-bold">
          What We Do
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whatWeDo.map((item, i) => (
            <div
              key={item.title}
              className={`rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg ${
                i === 0
                  ? "animate-fade-up"
                  : i === 1
                    ? "animate-fade-up-delay-1"
                    : i === 2
                      ? "animate-fade-up-delay-2"
                      : "animate-fade-up-delay-3"
              }`}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-[#0037FF]">
                <item.icon size={20} />
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Approach */}
<section className="bg-white py-20">

  <div className="mx-auto max-w-4xl px-8 lg:px-16">

    <div className="text-center">
      <h2 className="text-3xl font-bold md:text-4xl">
        Our Approach
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        A simple learning journey that transforms beginners into
        confident professionals.
      </p>
    </div>

    <div className="mt-8 grid grid-cols-2 md:grid-cols-4">

      {steps.map((step) => (
        <div
          key={step.label}
          className="flex flex-col items-center text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0037FF] text-white shadow-lg">
            <step.icon size={30} />
          </div>

          <h4 className="mt-6 text-lg font-semibold">
            {step.label}
          </h4>

          <p className="mt-2 max-w-[180px] text-sm text-muted-foreground">
            {step.desc}
          </p>
        </div>
      ))}

    </div>

  </div>

</section>
{/* Meet the Team */}
<section className="py-20 bg-muted/20">
  <div className="container">

    {/* Heading */}
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex rounded-full border border-primary/20 bg-[#0037FF]/10 px-4 py-1 text-sm font-medium text-[#0037FF]">
        Leadership Team
      </span>

      <h2 className="mt-5 text-3xl font-bold md:text-4xl">
        Meet Our Founders
      </h2>

      <p className="mt-4 text-muted-foreground font-medium">
        Passionate leaders dedicated to building world-class education,
        empowering students with practical skills, innovation, and career
        opportunities.
      </p>
    </div>

    {/* Cards */}
    <div className="mt-14 flex flex-wrap justify-center gap-8">

      {team.map((member, index) => (
        <div
          key={member.name}
          className={`group w-[300px] rounded-2xl border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
            index === 0
              ? "animate-fade-up"
              : index === 1
              ? "animate-fade-up-delay-1"
              : "animate-fade-up-delay-2"
          }`}
        >

          {/* Avatar */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0037FF] text-2xl font-bold text-white">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          {/* Name */}
          <h3 className="mt-5 text-lg font-semibold">
            {member.name}
          </h3>

          {/* Divider */}
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#0037FF]"></div>

          {/* Role */}
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            {member.role}
          </p>

        </div>
      ))}

    </div>

  </div>
</section>
      {/* CTA */}
      <section className="bg-[#0037FF]">
        <div className="container py-16 text-center text-gray-100">
          <h2 className="text-2xl font-bold text-[#0037FF]-foreground">
            Start Learning Today
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[#0037FF]-foreground/80">
            Join thousands of learners building real skills for real careers.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/courses">Explore Courses</Link>
          </Button>
        </div>
      </section>
    </main>
  </>
);

export default AboutPage;
