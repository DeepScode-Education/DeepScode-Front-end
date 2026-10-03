import { useEffect, useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { StaticRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop.tsx";
import { RiFileList3Line } from "react-icons/ri";
import Layout from "./components/layout/Layout.tsx";
import CallButton from "./components/CallButton.tsx";
import WhatsAppButton from "./components/WhatsAppButton.tsx";
import VisitorLocationTracker from "./components/VisitorLocationTracker.tsx";
import { AdminShell } from "@/admin/components/AdminLayout";

const AdminRoutes = lazy(() => import("@/routes/AdminRoutes.tsx"));
const CounsellorRoutes = lazy(() => import("@/routes/CounsellorRoutes.tsx"));
const MentorRoutes = lazy(() => import("@/routes/MentorRoutes.tsx"));
const StudentRoutes = lazy(() => import("@/routes/StudentRoutes.tsx"));
const EmployeePortal = lazy(() => import("@/employee/pages/EmployeePortal.tsx"));

const LiveClassProvider = lazy(() =>
  import("@/contexts/LiveClassContext.tsx").then((module) => ({
    default: module.LiveClassProvider,
  }))
);

const Form = lazy(() => import("./form/Form.tsx"));
const RequireAdmin = lazy(() => import("./components/admin/RequireAdmin.tsx"));
const RequireProfile = lazy(() => import("./pages/student/pages/Requireprofile.tsx"));
const CompleteProfile = lazy(() => import("./pages/student/pages/Completeprofile.tsx"));
const LeadDetail = lazy(() => import("./admin/pages/LeadDetail.tsx"));
const CommandCenter = lazy(() => import("./admin/pages/crm/CommandCenter.tsx"));
const CRMAnalytics = lazy(() => import("./admin/pages/crm/CRMAnalytics.tsx"));
const AdminReports = lazy(() => import("./admin/pages/crm/Reports.tsx"));
const CreateLead = lazy(() => import("./admin/pages/CreateLead.tsx"));

const Index = lazy(() => import("./pages/Index.tsx"));
const Courses = lazy(() => import("./pages/Courses.tsx"));
const CourseDetail = lazy(() => import("./pages/CourseDetail.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Portfolio = lazy(() => import("./pages/Portfolio.tsx"));
const Support = lazy(() => import("./pages/Support.tsx"));
const AIChatbot = lazy(() => import("./pages/AIChatbot.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const CareersPage = lazy(() => import("./pages/CareersPage.tsx"));
const BlogPage = lazy(() => import("./pages/Blog.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Mentors = lazy(() => import("./pages/mentor/Mentors.tsx"));
const KnowledgeHub = lazy(() => import("./pages/KnowledgeHub.tsx"));
const Placements = lazy(() => import("./pages/Placements.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const Payment = lazy(() => import("./pages/Payment.tsx"));
const BlogDetail = lazy(() => import("./pages/BlogDetail.tsx"));
const SupportPayments = lazy(() => import("./pages/support/SupportPayments.tsx"));
const SupportCourses = lazy(() => import("./pages/support/SupportCourses.tsx"));
const SupportAccount = lazy(() => import("./pages/support/SupportAccount.tsx"));
const SupportTechnical = lazy(() => import("./pages/support/SupportTechnical.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const VerifyCertificate = lazy(() => import("./pages/student/pages/Verify.tsx"));
const JobPortal = lazy(() => import("./pages/JobPortal.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const MentorDetail = lazy(() => import("./pages/mentor/MentorDetail.tsx"));
const AdminSupportTickets = lazy(() => import("./pages/AdminSupportTickets.tsx"));
const AdminStudentDetails = lazy(() => import("./admin/pages/Studentdetails.tsx"));
const CounsellorFollowUps = lazy(() => import("./admin/pages/counsellor/CounsellorFollowUps"));
const CounsellorCallLogs = lazy(() => import("./admin/pages/counsellor/CounsellorCallLogs"));
const CounsellorCreateLead = lazy(() => import("./admin/pages/counsellor/CounsellorCreateLead.tsx"));
const CounsellorFeeCollectionDashboard = lazy(() => import("./admin/pages/counsellor/CounsellorFeeCollectionDashboard"));
const CounsellorFeeCollectionList = lazy(() => import("./admin/pages/counsellor/CounsellorFeeCollectionList"));
const CounsellorFeeCollectionDetail = lazy(() => import("./admin/pages/counsellor/CounsellorFeeCollectionDetail"));
const AdminCareersPage = lazy(() => import("./admin/pages/career/CareersPage.tsx"));
const CareerApplicationsPage = lazy(() => import("./admin/pages/career/CareerApplicationsPage.tsx"));
const BlogFormPage = lazy(() => import("./admin/pages/blog/BlogFormPage.tsx"));
const BlogDetailPage = lazy(() => import("./admin/pages/blog/BlogDetailPage.tsx"));
const SupportPayments1 = lazy(() => import("./pages/support/SupportPayments.tsx"));
const SupportCourses1 = lazy(() => import("./pages/support/SupportCourses.tsx"));
const SupportAccount1 = lazy(() => import("./pages/support/SupportAccount.tsx"));
const SupportTechnical1 = lazy(() => import("./pages/support/SupportTechnical.tsx"));
const AdminDashboard = lazy(() => import("./admin/pages/Dashboard"));
const AdminLeads = lazy(() => import("./admin/pages/Leads"));
const AdminStudents = lazy(() => import("./admin/pages/Students"));
const AdminCourses = lazy(() => import("./admin/pages/Courses"));
const AdminClasses = lazy(() => import("./admin/pages/Classes"));
const AdminTeachers = lazy(() => import("./admin/pages/Teachers"));
const AdminCMS = lazy(() => import("./admin/pages/CMS"));
const AdminBlog = lazy(() => import("./admin/pages/blog/Blog.tsx"));
const AdminMedia = lazy(() => import("./admin/pages/Media"));
const AdminPayments = lazy(() => import("./admin/pages/Payments"));
const AdminCommunication = lazy(() => import("./admin/pages/Communication"));
const AdminAnalytics = lazy(() => import("./admin/pages/Analytics"));
const AdminSettings = lazy(() => import("./admin/pages/Settings"));
const FollowUps = lazy(() => import("./admin/pages/crm/FollowUps"));
const CallLogs = lazy(() => import("./admin/pages/crm/CallLogs"));
const Campaigns = lazy(() => import("./admin/pages/crm/Campaigns"));
const RecordedCourses = lazy(() => import("./admin/pages/academy/RecordedCourses"));
const Assignments = lazy(() => import("./admin/pages/academy/Assignments"));
const Certificates = lazy(() => import("./admin/pages/academy/Certificates"));
const HiringPartners = lazy(() => import("./admin/pages/placements/HiringPartners"));
const StudentPlacements = lazy(() => import("./admin/pages/placements/StudentPlacements"));
const Opportunities = lazy(() => import("./admin/pages/placements/Opportunities"));
const SuccessStories = lazy(() => import("./admin/pages/placements/SuccessStories"));
const PlacementAnalytics = lazy(() => import("./admin/pages/placements/PlacementAnalytics"));
const LandingPages = lazy(() => import("./admin/pages/website/LandingPages"));
const NavigationMenus = lazy(() => import("./admin/pages/website/NavigationMenus"));
const WebsiteForms = lazy(() => import("./admin/pages/website/Forms"));
const SEO = lazy(() => import("./admin/pages/website/SEO"));
const AdminTestimonials = lazy(() => import("./admin/pages/website/Testimonials"));
const EmailCampaigns = lazy(() => import("./admin/pages/marketing/EmailCampaigns"));
const WhatsAppCampaigns = lazy(() => import("./admin/pages/marketing/WhatsAppCampaigns"));
const Referrals = lazy(() => import("./admin/pages/marketing/Referrals"));
const Affiliates = lazy(() => import("./admin/pages/marketing/Affiliates"));
const MarketingCoupons = lazy(() => import("./admin/pages/marketing/Coupons"));
const Installments = lazy(() => import("./admin/pages/finance/Installments"));
const RevenueReports = lazy(() => import("./admin/pages/finance/RevenueReports"));
const CounsellorDashboard = lazy(() => import("./admin/pages/counsellor/CounsellorDashboard"));
const CounsellorLeads = lazy(() => import("./admin/pages/counsellor/CounsellorLeads"));
const CounsellorLeadDetail = lazy(() => import("./admin/pages/counsellor/CounsellorLeadDetail"));
const RequireCounsellor = lazy(() => import("./guards/RequireCounsellor.tsx"));
const StaffManagement = lazy(() => import("./admin/pages/StaffManagement.tsx"));
const HeroSectionAdmin = lazy(() => import("./admin/pages/website/HeroSectionAdmin.tsx"));
const AdminPortfolioExternalNew = lazy(() => import("./admin/pages/placements/PortfolioExternalNew.tsx"));
const PortfolioEditForm = lazy(() => import("./admin/pages/placements/PortfolioEditForm.tsx"));
const FeeCollectionDashboard = lazy(() => import("./admin/pages/fee-collection/FeeCollectionDashboard.tsx"));
const FeeCollectionList = lazy(() => import("./admin/pages/fee-collection/FeeCollectionList"));
const FeeCollectionDetail = lazy(() => import("./admin/pages/fee-collection/FeeCollectionDetail"));
const CareerFormPage = lazy(() => import("./admin/pages/career/CareerFormPage.tsx"));
const ApplicationDetailPage = lazy(() => import("./admin/pages/career/Applicationdetailpage.tsx"));
const TestimonialDetail = lazy(() => import("./admin/pages/website/TestimonialDetail.tsx"));
const AdminPortfolio = lazy(() => import("@/admin/pages/placements/Portfolio.tsx"));
const AdminPortfolioDetail = lazy(() => import("@/admin/pages/placements/PortfolioDetail.tsx"));
const StudentAssignments = lazy(() => import("@/admin/pages/academy/StudentAssignments.tsx"));
const MentorDashboardPage = lazy(() => import("./admin/pages/mentor/MentorDashboard"));
const MentorStudentsPage = lazy(() => import("./admin/pages/mentor/MentorStudents"));
const MentorAssignmentsPage = lazy(() => import("./admin/pages/mentor/MentorAssignments"));
const MentorCoursesPage = lazy(() => import("./admin/pages/mentor/MentorCourses"));
const MentorClassesPage = lazy(() => import("./admin/pages/mentor/MentorClasses"));
const RequireMentor = lazy(() => import("./guards/RequireMentor.tsx"));
const AdminExternalPortfolioForm = lazy(() => import("./admin/pages/placements/AdminExternalPortfolioForm.tsx"));
const JobPortal1 = lazy(() => import("./pages/JobPortal.tsx"));
const ApplicantsList = lazy(() => import("./admin/pages/placements/create-job/ApplicantsList.tsx"));
const ApplicantDetail = lazy(() => import("./admin/pages/placements/create-job/ApplicantDetail.tsx"));
const MentorBatchesPage = lazy(() => import("./admin/pages/mentor/MentorBatches"));
const MentorBatchStudentsPage = lazy(() => import("./admin/pages/mentor/MentorBatchStudents"));
const MentorLiveClassPage = lazy(() => import("./features/live-class/pages/MentorLiveClassPage"));
const StudentLiveClassPage = lazy(() => import("./features/live-class/pages/StudentLiveClassPage"));
const ForgotPassword1 = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword1 = lazy(() => import("./pages/ResetPassword.tsx"));
const MentorProfilePage = lazy(() => import("./admin/pages/MentorProfile.tsx"));
const AdminSupportTicket = lazy(() => import("./admin/pages/crm/AdminSupportTickets.tsx"));
const AdminSupportTicketDetail = lazy(() => import("./admin/pages/crm/AdminSupportTicketDetail.tsx"));
const MentorBatchVideosPage = lazy(() => import("./admin/pages/mentor/MentorBatchVideos"));
const RecordedCourseBatches = lazy(() => import("./admin/pages/academy/RecordedCourseBatches"));
const RecordedCourseBatchVideos = lazy(() => import("./admin/pages/academy/RecordedCourseBatchVideos"));

const POPUP_EXCLUDED_PREFIXES = ["/admin", "/counsellor", "/login", "/signup", "/onboarding"];

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// FIX #7: small local loader for the popup's lazy Form — see EnquiryPopup below
const FormLoader = () => (
  <div className="flex items-center justify-center p-10">
    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 10, refetchOnWindowFocus: false },
  },
});

const EnquiryPopup = () => {
  
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // FIX #3: AOS ko dynamic import karo — SSR pe window exist nahi karta
  useEffect(() => {
    const initAos = () => {
      Promise.all([import("aos"), import("aos/dist/aos.css")]).then(
        ([{ default: AOS }]) => {
          AOS.init({ once: false, duration: 400, easing: "ease-out-cubic" });
        }
      );
    };
    setMounted(true);
    const schedule = window.requestIdleCallback
      ? (callback: () => void) => window.requestIdleCallback(callback, { timeout: 2000 })
      : (callback: () => void) => window.setTimeout(callback, 1000);
    const idleHandle = schedule(initAos);
    return () => {
      if (typeof idleHandle === "number" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle as number);
      }
    };
  }, []);

  const isExcluded = POPUP_EXCLUDED_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  useEffect(() => {
  const openPopup = () => {
    setIsOpen(true);
  };

  window.addEventListener("open-enquiry-popup", openPopup);

  return () => {
    window.removeEventListener("open-enquiry-popup", openPopup);
  };
}, []);

  // FIX #4: sessionStorage access SSR safe — typeof window guard
  useEffect(() => {
    if (isExcluded) return;
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem("enquiry_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isExcluded]);

  // FIX #5: Sirf EK scroll-lock useEffect — duplicate wala hataya
  // scrollbarWidth wala rakha (zyada correct hai), "0px" wala hataya
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // FIX #6: AOS.refresh bhi dynamic import se
  useEffect(() => {
    if (!isOpen) return;

    import("aos").then(({ default: AOS }) => {
      AOS.refresh();
    });
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("enquiry_dismissed", "true");
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  if (!mounted || isExcluded) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(2px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            data-aos="zoom-in-up"
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
          >
            <button
              onClick={handleClose}
              aria-label="Close"
              className="
                absolute top-4 right-4 z-10
                w-8 h-8 flex items-center justify-center
                rounded-full bg-gray-100 hover:bg-gray-200
                text-gray-600 text-lg font-bold
                transition-colors
              "
            >
              ✕
            </button>
            {/* FIX #8: Form lazy-loaded hai, isliye isko apne khud ke Suspense
                boundary me wrap karna zaroori hai. Pehle yahan koi Suspense
                nahi tha aur EnquiryPopup App.tsx ke root Suspense (jo sirf
                Layout/AppRoutes ko wrap karta hai) ke bahar render hota hai —
                isi wajah se "Get a Call Back" click karte hi Form suspend
                hoke uncaught error throw karta tha aur poora app blank ho
                jaata tha. */}
            <Suspense fallback={<FormLoader />}>
              <Form onClose={handleClose} />
            </Suspense>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          data-aos="fade-left"
          onClick={handleOpen}
          className="
            fixed bottom-6 right-6 z-[9998]
            flex items-center gap-2
            px-5 py-3 rounded-full
            bg-[#0037FF]
            text-white font-semibold text-sm
            shadow-xl hover:scale-105 active:scale-95
            transition-transform
          "
        >
          <RiFileList3Line className="text-lg" />
          Get a Call Back
        </button>
      )}
    </>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/courses" element={<Courses />} />
    <Route path="/:slug" element={<CourseDetail />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/student/*" element={<StudentRoutes />} />
    <Route path="/employee" element={<EmployeePortal />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/support" element={<Support />} />
    <Route path="/support/payments" element={<SupportPayments />} />
    <Route path="/support/courses" element={<SupportCourses />} />
    <Route path="/support/account" element={<SupportAccount />} />
    <Route path="/support/technical" element={<SupportTechnical />} />
    <Route path="/ai-chat" element={<AIChatbot />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/payment/:title" element={<Payment />} />
    <Route path="/about" element={<About />} />
    <Route path="/careers" element={<CareersPage />} />
    <Route path="/blog" element={<BlogPage />} />
    <Route path="/blog/:slug" element={<BlogDetail />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/mentors" element={<Mentors />} />
    <Route path="/mentors/:slug" element={<MentorDetail />} />
    <Route path="/jobs-portal" element={<JobPortal />} />
    <Route path="/knowledge-hub" element={<KnowledgeHub />} />
    <Route path="/placements" element={<Placements />} />
    <Route path="/complete-profile" element={<CompleteProfile />} />
    <Route path="/dashboard" element={<Navigate to="/student" replace />} />
    <Route path="/admin/*" element={<AdminShell><AdminRoutes /></AdminShell>} />
    <Route path="/counsellor/*" element={<CounsellorRoutes />} />
    <Route path="/mentor/*" element={<MentorRoutes />} />
    <Route path="/mentor/live" element={<RequireMentor><MentorLiveClassPage /></RequireMentor>} />
    <Route path="/student/live" element={<RequireProfile><StudentLiveClassPage /></RequireProfile>} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// const AppBody = () => (
//   <>
//     <ScrollToTop />
//     <Toaster />
//     <AuthProvider>
//       <EnquiryPopup />
//       <CallButton />
//       <WhatsAppButton />
//       <Suspense fallback={<Loader />}>
//         <Layout>
//           <AppRoutes />
//         </Layout>
//       </Suspense>
//     </AuthProvider>
//   </>
// );

const AppContent = () => {

  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const hideButtons =
    user &&
    [
      "student",
      "mentor",
      "admin",
      "super_admin",
      "counsellor"
    ].includes(user.role);


  return (
    <>
     <VisitorLocationTracker />
      <ScrollToTop />
      <Toaster />


      {mounted && !hideButtons && (
        <>
          <EnquiryPopup />
          <CallButton />
          <WhatsAppButton />
        </>
      )}


      <Suspense fallback={<Loader />}>
        <Layout>
          <AppRoutes />
        </Layout>
      </Suspense>

    </>
  );
};



const AppBody = () => (
  <AuthProvider>
    {/*
      LiveClassProvider must be inside AuthProvider (so it can read the
      user) but outside the router outlet so it is never unmounted by
      route changes.  The provider renders <PersistentZoomRoom> internally
      when a session is active.
    */}
    <Suspense fallback={null}>
      <LiveClassProvider>
        <AppContent />
      </LiveClassProvider>
    </Suspense>
  </AuthProvider>
);
interface AppProps {
  ssrPath?: string;
}

const App = ({ ssrPath }: AppProps = {}) => (
  <QueryClientProvider client={queryClient}>
    {ssrPath !== undefined ? (
      // FIX #1 result: StaticRouter ab react-router-dom se aata hai
      <StaticRouter location={ssrPath}>
        <AppBody />
      </StaticRouter>
    ) : (
      <BrowserRouter>
        <AppBody />
      </BrowserRouter>
    )}
  </QueryClientProvider>
);

export default App;