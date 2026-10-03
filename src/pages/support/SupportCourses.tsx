
import SupportPageHeader from "@/components/support/SupportPageHeader";
import QuickHelpCard from "@/components/support/QuickHelpCard";
import SupportFAQ from "@/components/support/SupportFAQ";
import SupportCTA from "@/components/support/SupportCTA";
import { BookOpen, Clock, Award, Download, BarChart3, Play } from "lucide-react";

const quickHelp = [
  { icon: BookOpen, title: "Access Purchased Courses", description: "Find and access all your enrolled courses from the dashboard." },
  { icon: Clock, title: "Course Duration & Access", description: "Lifetime access to all purchased courses including future updates." },
  { icon: Award, title: "Certificates", description: "Earn certificates after completing all modules and assessments." },
  { icon: Download, title: "Downloadable Resources", description: "Download project files, cheat sheets, and supplementary materials." },
];

const faqs = [
  { question: "Can I access courses on mobile?", answer: "Yes! Our platform is fully responsive. Access all courses on any device with a web browser — phone, tablet, or desktop." },
  { question: "How long do I have access to a course?", answer: "Once enrolled, you have lifetime access to the course materials, including all future updates and additions." },
  { question: "Do I get a certificate?", answer: "Yes, you receive a verifiable certificate of completion after finishing all modules and the capstone project." },
  { question: "Can I download course content?", answer: "Project files, cheat sheets, and resources are downloadable. Video lessons are available for streaming only." },
];

const progressHelp = [
  { icon: BarChart3, title: "Track Your Progress", description: "Your dashboard shows completion percentage, milestones, and remaining modules for each course." },
  { icon: Play, title: "Resume Learning", description: "Click 'Resume Learning' on any course card to pick up exactly where you left off." },
];

const SupportCourses = () => (
  <div className="min-h-screen bg-background">

    <SupportPageHeader title="Courses & Learning" description="Help with course access, content, certificates, and learning progress." />

    <div className="container py-12 space-y-12">
      <div>
        <h2 className="text-xl font-bold text-foreground">Quick Help</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickHelp.map((item, i) => (
            <QuickHelpCard key={item.title} {...item} index={i} />
          ))}
        </div>
      </div>

      <SupportFAQ faqs={faqs} />

      <div>
        <h2 className="text-xl font-bold text-foreground">Progress & Learning</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {progressHelp.map((a, i) => (
            <QuickHelpCard key={a.title} {...a} index={i} />
          ))}
        </div>
      </div>

      <SupportCTA />
    </div>

  </div>
);

export default SupportCourses;
