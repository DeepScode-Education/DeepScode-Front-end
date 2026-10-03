import { Route, Routes } from "react-router-dom";

import RequireAdmin from "@/components/admin/RequireAdmin.tsx";

// Main Admin / Super Admin Dashboard
import AdminDashboard from "@/admin/pages/Dashboard";

// Existing Staff Dashboard — kept for any other usage
import StaffDashboard from "@/pages/admin/StaffDashboard";

import AdminSupportTickets from "@/pages/AdminSupportTickets.tsx";

import StaffManagement from "@/admin/pages/StaffManagement.tsx";
import StaffDetails from "@/admin/pages/StaffDetails.tsx";
import RequireStaffManagement from "@/guards/RequireStaffManagement";

import AdminLeads from "@/admin/pages/Leads";
import AdLeads from "@/admin/pages/AdLeads";
import AdLeadDetail from "@/admin/pages/AdLeadDetail";
import LeadDetail from "@/admin/pages/LeadDetail.tsx";
import CreateLead from "@/admin/pages/CreateLead.tsx";

import FeeCollectionDashboard from "@/admin/pages/fee-collection/FeeCollectionDashboard.tsx";
import FeeCollectionList from "@/admin/pages/fee-collection/FeeCollectionList";
import FeeCollectionDetail from "@/admin/pages/fee-collection/FeeCollectionDetail";

import AdminStudents from "@/admin/pages/Students";
import AdminCourses from "@/admin/pages/Courses";
import AdminClasses from "@/admin/pages/Classes";
import AdminTeachers from "@/admin/pages/Teachers";
import MentorProfilePage from "@/admin/pages/MentorProfile.tsx";

import AdminCMS from "@/admin/pages/CMS";
import AdminBlog from "@/admin/pages/blog/Blog.tsx";
import BlogFormPage from "@/admin/pages/blog/BlogFormPage.tsx";
import BlogDetailPage from "@/admin/pages/blog/BlogDetailPage.tsx";

import AdminPortfolio from "@/admin/pages/placements/Portfolio.tsx";
import AdminPortfolioDetail from "@/admin/pages/placements/PortfolioDetail.tsx";
import AdminPortfolioExternalNew from "@/admin/pages/placements/PortfolioExternalNew.tsx";
import PortfolioEditForm from "@/admin/pages/placements/PortfolioEditForm.tsx";

import AdminMedia from "@/admin/pages/Media";
import AdminPayments from "@/admin/pages/Payments";
import AdminCommunication from "@/admin/pages/Communication";
import AdminAnalytics from "@/admin/pages/Analytics";
import AdminSettings from "@/admin/pages/Settings";

import AdminStudentDetails from "@/admin/pages/Studentdetails.tsx";

import FollowUps from "@/admin/pages/crm/FollowUps";
import CallLogs from "@/admin/pages/crm/CallLogs";
import Campaigns from "@/admin/pages/crm/Campaigns";
import CommandCenter from "@/admin/pages/crm/CommandCenter.tsx";
import CRMAnalytics from "@/admin/pages/crm/CRMAnalytics.tsx";
import AdminReports from "@/admin/pages/crm/Reports.tsx";

import RecordedCourses from "@/admin/pages/academy/RecordedCourses";
import RecordedCourseBatches from "@/admin/pages/academy/RecordedCourseBatches";
import RecordedCourseBatchVideos from "@/admin/pages/academy/RecordedCourseBatchVideos";
import Assignments from "@/admin/pages/academy/Assignments";
import StudentAssignments from "@/admin/pages/academy/StudentAssignments.tsx";
import Certificates from "@/admin/pages/academy/Certificates";
import KnowledgeHub from "@/admin/pages/academy/KnowledgeHub";

import HiringPartners from "@/admin/pages/placements/HiringPartners";
import StudentPlacements from "@/admin/pages/placements/StudentPlacements";
import Opportunities from "@/admin/pages/placements/Opportunities";
import SuccessStories from "@/admin/pages/placements/SuccessStories";
import PlacementAnalytics from "@/admin/pages/placements/PlacementAnalytics";

import LandingPages from "@/admin/pages/website/LandingPages";
import HeroSectionAdmin from "@/admin/pages/website/HeroSectionAdmin.tsx";
import NavigationMenus from "@/admin/pages/website/NavigationMenus";
import WebsiteForms from "@/admin/pages/website/Forms";
import SEO from "@/admin/pages/website/SEO";
import AdminTestimonials from "@/admin/pages/website/Testimonials";
import TestimonialDetail from "@/admin/pages/website/TestimonialDetail.tsx";

import EmailCampaigns from "@/admin/pages/marketing/EmailCampaigns";
import WhatsAppCampaigns from "@/admin/pages/marketing/WhatsAppCampaigns";
import Referrals from "@/admin/pages/marketing/Referrals";
import Affiliates from "@/admin/pages/marketing/Affiliates";
import MarketingCoupons from "@/admin/pages/marketing/Coupons";

import Installments from "@/admin/pages/finance/Installments";
import RevenueReports from "@/admin/pages/finance/RevenueReports";

import AdminCareersPage from "@/admin/pages/career/CareersPage.tsx";
import CareerFormPage from "@/admin/pages/career/CareerFormPage.tsx";
import CareerApplicationsPage from "@/admin/pages/career/CareerApplicationsPage.tsx";
import ApplicationDetailPage from "@/admin/pages/career/Applicationdetailpage.tsx";

import ApplicantsList from "@/admin/pages/placements/create-job/ApplicantsList.tsx";
import ApplicantDetail from "@/admin/pages/placements/create-job/ApplicantDetail.tsx";

import AdminSupportTicket from "@/admin/pages/crm/AdminSupportTickets.tsx";
import AdminSupportTicketDetail from "@/admin/pages/crm/AdminSupportTicketDetail.tsx";

const AdminRoutes = () => (
  <Routes>
    {/* ================================================================
        MAIN ADMIN / SUPER ADMIN DASHBOARD

        IMPORTANT:
        /admin -> AdminDashboard
        NOT StaffDashboard

        AdminDashboard contains:
        - Stats
        - Revenue & Students chart
        - Conversion Funnel
        - Lead Source Analytics
        - Course Performance
        - Upcoming Live Classes
        - Pending Follow-ups
        - Recent Payments
        - Recent Leads
        - Activity
       ================================================================ */}
    <Route
      path="/"
      element={
        <RequireAdmin>
          <AdminDashboard />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        SUPPORT
       ================================================================ */}
    <Route
      path="/support-tickets"
      element={
        <RequireAdmin>
          <AdminSupportTickets />
        </RequireAdmin>
      }
    />

    <Route
      path="/support-ticket"
      element={
        <RequireAdmin>
          <AdminSupportTicket />
        </RequireAdmin>
      }
    />

    <Route
      path="/support-tickets/:id"
      element={
        <RequireAdmin>
          <AdminSupportTicketDetail />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        STAFF MANAGEMENT
       ================================================================ */}
    <Route
      path="/staff"
      element={
        <RequireStaffManagement>
          <StaffManagement />
        </RequireStaffManagement>
      }
    />

    <Route
      path="/staff/:id"
      element={
        <RequireStaffManagement>
          <StaffDetails />
        </RequireStaffManagement>
      }
    />

    {/* ================================================================
        CRM / LEADS
       ================================================================ */}
    <Route
      path="/leads"
      element={
        <RequireAdmin>
          <AdminLeads />
        </RequireAdmin>
      }
    />

    <Route
      path="/marketing/ad-leads"
      element={
        <RequireAdmin>
          <AdLeads />
        </RequireAdmin>
      }
    />

    <Route
      path="/ad-leads/:id"
      element={
        <RequireAdmin>
          <AdLeadDetail />
        </RequireAdmin>
      }
    />

    <Route
      path="/leads/:id"
      element={
        <RequireAdmin>
          <LeadDetail />
        </RequireAdmin>
      }
    />

    <Route
      path="/leads/new"
      element={
        <RequireAdmin>
          <CreateLead />
        </RequireAdmin>
      }
    />

    <Route
      path="/fee-collection/dashboard"
      element={
        <RequireAdmin>
          <FeeCollectionDashboard />
        </RequireAdmin>
      }
    />

    <Route
      path="/fee-collection"
      element={
        <RequireAdmin>
          <FeeCollectionList />
        </RequireAdmin>
      }
    />

    <Route
      path="/fee-collection/:studentId"
      element={
        <RequireAdmin>
          <FeeCollectionDetail />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        STUDENTS / COURSES / CLASSES
       ================================================================ */}
    <Route
      path="/students"
      element={
        <RequireAdmin>
          <AdminStudents />
        </RequireAdmin>
      }
    />

    <Route
      path="/courses"
      element={
        <RequireAdmin>
          <AdminCourses />
        </RequireAdmin>
      }
    />

    <Route
      path="/classes"
      element={
        <RequireAdmin>
          <AdminClasses />
        </RequireAdmin>
      }
    />

    <Route
      path="/teachers"
      element={
        <RequireAdmin>
          <AdminTeachers />
        </RequireAdmin>
      }
    />

    <Route
      path="/mentor-profile/:mentorId"
      element={
        <RequireAdmin>
          <MentorProfilePage />
        </RequireAdmin>
      }
    />

    <Route
      path="/students/:id"
      element={
        <RequireAdmin>
          <AdminStudentDetails />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        CMS / BLOG
       ================================================================ */}
    <Route
      path="/cms"
      element={
        <RequireAdmin>
          <AdminCMS />
        </RequireAdmin>
      }
    />

    <Route
      path="/blog"
      element={
        <RequireAdmin>
          <AdminBlog />
        </RequireAdmin>
      }
    />

    <Route
      path="/blog/new"
      element={
        <RequireAdmin>
          <BlogFormPage />
        </RequireAdmin>
      }
    />

    <Route
      path="/blog/:id/edit"
      element={
        <RequireAdmin>
          <BlogFormPage />
        </RequireAdmin>
      }
    />

    <Route
      path="/blog/:id"
      element={
        <RequireAdmin>
          <BlogDetailPage />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        PLACEMENTS
       ================================================================ */}
    <Route
      path="/portfolio"
      element={
        <RequireAdmin>
          <AdminPortfolio />
        </RequireAdmin>
      }
    />

    <Route
      path="/portfolio/:id"
      element={
        <RequireAdmin>
          <AdminPortfolioDetail />
        </RequireAdmin>
      }
    />

    <Route
      path="/portfolio/external/new"
      element={
        <RequireAdmin>
          <AdminPortfolioExternalNew />
        </RequireAdmin>
      }
    />

    <Route
      path="/portfolio/:id/edit"
      element={
        <RequireAdmin>
          <PortfolioEditForm />
        </RequireAdmin>
      }
    />

    <Route
      path="/placements/partners"
      element={
        <RequireAdmin>
          <HiringPartners />
        </RequireAdmin>
      }
    />

    <Route
      path="/placements/students"
      element={
        <RequireAdmin>
          <StudentPlacements />
        </RequireAdmin>
      }
    />

    <Route
      path="/placements/opportunities"
      element={
        <RequireAdmin>
          <Opportunities />
        </RequireAdmin>
      }
    />

    <Route
      path="/placements/success-stories"
      element={
        <RequireAdmin>
          <SuccessStories />
        </RequireAdmin>
      }
    />

    <Route
      path="/placements/analytics"
      element={
        <RequireAdmin>
          <PlacementAnalytics />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        MEDIA / PAYMENTS / COMMUNICATION / ANALYTICS / SETTINGS
       ================================================================ */}
    <Route
      path="/media"
      element={
        <RequireAdmin>
          <AdminMedia />
        </RequireAdmin>
      }
    />

    <Route
      path="/payments"
      element={
        <RequireAdmin>
          <AdminPayments />
        </RequireAdmin>
      }
    />

    <Route
      path="/communication"
      element={
        <RequireAdmin>
          <AdminCommunication />
        </RequireAdmin>
      }
    />

    <Route
      path="/analytics"
      element={
        <RequireAdmin>
          <AdminAnalytics />
        </RequireAdmin>
      }
    />

    <Route
      path="/settings"
      element={
        <RequireAdmin>
          <AdminSettings />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        CRM
       ================================================================ */}
    <Route
      path="/crm/follow-ups"
      element={
        <RequireAdmin>
          <FollowUps />
        </RequireAdmin>
      }
    />

    <Route
      path="/crm/call-logs"
      element={
        <RequireAdmin>
          <CallLogs />
        </RequireAdmin>
      }
    />

    <Route
      path="/crm/campaigns"
      element={
        <RequireAdmin>
          <Campaigns />
        </RequireAdmin>
      }
    />

    <Route
      path="/crm/command-center"
      element={
        <RequireAdmin>
          <CommandCenter />
        </RequireAdmin>
      }
    />

    <Route
      path="/crm/analytics"
      element={
        <RequireAdmin>
          <CRMAnalytics />
        </RequireAdmin>
      }
    />

    <Route
      path="/reports"
      element={
        <RequireAdmin>
          <AdminReports />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        ACADEMY
       ================================================================ */}
    <Route
      path="/academy/recorded"
      element={
        <RequireAdmin>
          <RecordedCourses />
        </RequireAdmin>
      }
    />

    <Route
      path="/academy/recorded/:courseId"
      element={
        <RequireAdmin>
          <RecordedCourseBatches />
        </RequireAdmin>
      }
    />

    <Route
      path="/academy/recorded/:courseId/:batchId"
      element={
        <RequireAdmin>
          <RecordedCourseBatchVideos />
        </RequireAdmin>
      }
    />

    <Route
      path="/academy/knowledge-hub"
      element={
        <RequireAdmin>
          <KnowledgeHub />
        </RequireAdmin>
      }
    />

    <Route
      path="/academy/assignments"
      element={
        <RequireAdmin>
          <Assignments />
        </RequireAdmin>
      }
    />

    <Route
      path="/academy/assignments/:studentId"
      element={
        <RequireAdmin>
          <StudentAssignments />
        </RequireAdmin>
      }
    />

    <Route
      path="/academy/certificates"
      element={
        <RequireAdmin>
          <Certificates />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        WEBSITE
       ================================================================ */}
    <Route
      path="/website/landing-pages"
      element={
        <RequireAdmin>
          <LandingPages />
        </RequireAdmin>
      }
    />

    <Route
      path="/website/home"
      element={
        <RequireAdmin>
          <HeroSectionAdmin />
        </RequireAdmin>
      }
    />

    <Route
      path="/website/navigation"
      element={
        <RequireAdmin>
          <NavigationMenus />
        </RequireAdmin>
      }
    />

    <Route
      path="/website/forms"
      element={
        <RequireAdmin>
          <WebsiteForms />
        </RequireAdmin>
      }
    />

    <Route
      path="/website/seo"
      element={
        <RequireAdmin>
          <SEO />
        </RequireAdmin>
      }
    />

    <Route
      path="/website/testimonials"
      element={
        <RequireAdmin>
          <AdminTestimonials />
        </RequireAdmin>
      }
    />

    <Route
      path="/website/testimonials/:id"
      element={
        <RequireAdmin>
          <TestimonialDetail />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        MARKETING
       ================================================================ */}
    <Route
      path="/marketing/email"
      element={
        <RequireAdmin>
          <EmailCampaigns />
        </RequireAdmin>
      }
    />

    <Route
      path="/marketing/whatsapp"
      element={
        <RequireAdmin>
          <WhatsAppCampaigns />
        </RequireAdmin>
      }
    />

    <Route
      path="/marketing/referrals"
      element={
        <RequireAdmin>
          <Referrals />
        </RequireAdmin>
      }
    />

    <Route
      path="/marketing/affiliates"
      element={
        <RequireAdmin>
          <Affiliates />
        </RequireAdmin>
      }
    />

    <Route
      path="/marketing/coupons"
      element={
        <RequireAdmin>
          <MarketingCoupons />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        FINANCE
       ================================================================ */}
    <Route
      path="/finance/installments"
      element={
        <RequireAdmin>
          <Installments />
        </RequireAdmin>
      }
    />

    <Route
      path="/finance/revenue"
      element={
        <RequireAdmin>
          <RevenueReports />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        CAREERS
       ================================================================ */}
    <Route
      path="/careers"
      element={
        <RequireAdmin>
          <AdminCareersPage />
        </RequireAdmin>
      }
    />

    <Route
      path="/careers/new"
      element={
        <RequireAdmin>
          <CareerFormPage />
        </RequireAdmin>
      }
    />

    <Route
      path="/careers/:id/edit"
      element={
        <RequireAdmin>
          <CareerFormPage />
        </RequireAdmin>
      }
    />

    <Route
      path="/career-applications"
      element={
        <RequireAdmin>
          <CareerApplicationsPage />
        </RequireAdmin>
      }
    />

    <Route
      path="/career-applications/:id"
      element={
        <RequireAdmin>
          <ApplicationDetailPage />
        </RequireAdmin>
      }
    />

    {/* ================================================================
        JOB APPLICANTS
       ================================================================ */}
    <Route
      path="/opportunities/:opportunityId/applicants"
      element={
        <RequireAdmin>
          <ApplicantsList />
        </RequireAdmin>
      }
    />

    <Route
      path="/opportunities/:opportunityId/applicants/:applicationId"
      element={
        <RequireAdmin>
          <ApplicantDetail />
        </RequireAdmin>
      }
    />
  </Routes>
);

export default AdminRoutes;