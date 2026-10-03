
import SupportPageHeader from "@/components/support/SupportPageHeader";
import QuickHelpCard from "@/components/support/QuickHelpCard";
import SupportFAQ from "@/components/support/SupportFAQ";
import SupportCTA from "@/components/support/SupportCTA";
import { MonitorX, Bug, Globe, Gauge, Trash2, Wifi, RefreshCw, AlertOctagon } from "lucide-react";

const quickHelp = [
  { icon: MonitorX, title: "Video Not Playing", description: "Troubleshoot video playback issues including buffering and black screens." },
  { icon: Bug, title: "App / Website Bugs", description: "Report visual glitches, broken features, or unexpected behavior." },
  { icon: Globe, title: "Browser Compatibility", description: "Check supported browsers and known compatibility issues." },
  { icon: Gauge, title: "Slow Performance", description: "Tips to improve loading speed and platform responsiveness." },
];

const faqs = [
  { question: "Why is my video not loading?", answer: "Try refreshing the page, clearing your cache, or switching browsers. Ensure your internet connection is stable. If the issue persists, report it." },
  { question: "Which browsers are supported?", answer: "We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, use Chrome." },
  { question: "Why is the platform slow?", answer: "Slow performance can be caused by poor internet, browser extensions, or an outdated browser. Try the troubleshooting steps below." },
  { question: "How do I report a bug?", answer: "Use the 'Report an Issue' button below to submit a detailed bug report. Include screenshots and steps to reproduce the issue." },
];

const troubleshooting = [
  { icon: Trash2, title: "Clear Browser Cache", description: "Go to browser settings → Privacy → Clear browsing data. Select cached images and files." },
  { icon: Wifi, title: "Check Internet Connection", description: "Test your connection speed. A minimum of 5 Mbps is recommended for video streaming." },
  { icon: RefreshCw, title: "Update Your Browser", description: "Ensure you're using the latest version of your browser for optimal compatibility." },
  { icon: AlertOctagon, title: "Disable Extensions", description: "Ad blockers and privacy extensions can sometimes interfere. Try disabling them temporarily." },
];

const SupportTechnical = () => (
  <div className="min-h-screen bg-background">
 
    <SupportPageHeader title="Technical Support" description="Troubleshoot bugs, errors, browser issues, and platform performance." />

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
        <h2 className="text-xl font-bold text-foreground">Troubleshooting Steps</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {troubleshooting.map((a, i) => (
            <QuickHelpCard key={a.title} {...a} index={i} />
          ))}
        </div>
      </div>

      <SupportCTA
        title="Found a bug?"
        description="Report the issue with details and screenshots so we can fix it quickly."
        buttonText="Report an Issue"
        variant="report"
      />
    </div>
  
  </div>
);

export default SupportTechnical;
