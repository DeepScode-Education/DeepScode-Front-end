import { Routes, Route } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import Dashboard from "../pages/StudentDashboard";
import Profile from "../pages/StudentProfile";
import Payments from "../pages/Payments";        
import Portfolio from "../pages/Portfolio";
import PortfolioForm from "../pages/PortfolioForm";
import Documents from "../pages/Documents";
import Support from "../pages/Support";
import StudentPlacements from "../pages/Placements";
import DownloadCertificate from "../pages/DownloadCertificate";
import UploadAssignment from "../pages/UploadAssignment";
import Attendance from "../pages/Attendance";
import Assignments from "../pages/Assignments";
import AssignmentDetails from "../pages/AssignmentDetails";
import MyCourse from "../pages/MyCourse";
import StudentVideos from "../pages/StudentVideos";


const ComingSoon = ({ title }: { title: string }) => (
  <StudentLayout title={title}>
    <div className="flex h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">This section is coming soon.</p>
    </div>
  </StudentLayout>
);

const StudentPortal = () => {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="payments" element={<Payments />} />

      <Route path="course" element={<MyCourse />} />
      <Route path="assignments" element={<Assignments />} />
      <Route path="attendance" element={<Attendance />} />
     <Route path="portfolio" element={<Portfolio />} />
<Route path="portfolio/new" element={<PortfolioForm />} />
<Route path="portfolio/:id/edit" element={<PortfolioForm />} />
      <Route path="placements" element={<StudentPlacements />} />
      <Route path="documents" element={<Documents />} />
      <Route path="support" element={<Support />} />
      <Route
  path="download-certificate"
  element={<DownloadCertificate />}
/>

<Route path="upload-assignment" element={<UploadAssignment />} />
<Route
 path="assignment/:id"
 element={<AssignmentDetails />}
/>

<Route path="videos" element={<StudentVideos />} />
    </Routes>
  );
};

export default StudentPortal;