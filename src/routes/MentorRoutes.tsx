import { Route, Routes } from "react-router-dom";
import RequireMentor from "@/guards/RequireMentor.tsx";
import MentorDashboardPage from "@/admin/pages/mentor/MentorDashboard";
import MentorStudentsPage from "@/admin/pages/mentor/MentorStudents";
import MentorAssignmentsPage from "@/admin/pages/mentor/MentorAssignments";
import MentorCoursesPage from "@/admin/pages/mentor/MentorCourses";
import MentorClassesPage from "@/admin/pages/mentor/MentorClasses";
import MentorBatchesPage from "@/admin/pages/mentor/MentorBatches";
import MentorBatchStudentsPage from "@/admin/pages/mentor/MentorBatchStudents";
import MentorBatchVideosPage from "@/admin/pages/mentor/MentorBatchVideos";

const MentorRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={<RequireMentor><MentorDashboardPage /></RequireMentor>} />
    <Route path="/students" element={<RequireMentor><MentorStudentsPage /></RequireMentor>} />
    <Route path="/assignments" element={<RequireMentor><MentorAssignmentsPage /></RequireMentor>} />
    <Route path="/courses" element={<RequireMentor><MentorCoursesPage /></RequireMentor>} />
    <Route path="/classes" element={<RequireMentor><MentorClassesPage /></RequireMentor>} />
    <Route path="/batches" element={<RequireMentor><MentorBatchesPage /></RequireMentor>} />
    <Route path="/batches/:id" element={<RequireMentor><MentorBatchStudentsPage /></RequireMentor>} />
    <Route path="/batches/:id/videos" element={<RequireMentor><MentorBatchVideosPage /></RequireMentor>} />
  </Routes>
);

export default MentorRoutes;
