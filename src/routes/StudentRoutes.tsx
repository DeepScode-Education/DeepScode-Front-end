import { Route, Routes } from "react-router-dom";
import RequireProfile from "@/pages/student/pages/Requireprofile.tsx";
import StudentPortal from "@/pages/student/components/StudentPortal.tsx";

const StudentRoutes = () => (
  <Routes>
    <Route path="/*" element={<RequireProfile><StudentPortal /></RequireProfile>} />
  </Routes>
);

export default StudentRoutes;
