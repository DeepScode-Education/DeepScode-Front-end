import { Route, Routes } from "react-router-dom";
import RequireCounsellor from "@/guards/RequireCounsellor.tsx";
import CounsellorDashboard from "@/admin/pages/counsellor/CounsellorDashboard";
import CounsellorLeads from "@/admin/pages/counsellor/CounsellorLeads";
import CounsellorLeadDetail from "@/admin/pages/counsellor/CounsellorLeadDetail";
import CounsellorFollowUps from "@/admin/pages/counsellor/CounsellorFollowUps";
import CounsellorCallLogs from "@/admin/pages/counsellor/CounsellorCallLogs";
import CounsellorCreateLead from "@/admin/pages/counsellor/CounsellorCreateLead.tsx";
import CounsellorFeeCollectionDashboard from "@/admin/pages/counsellor/CounsellorFeeCollectionDashboard";
import CounsellorFeeCollectionList from "@/admin/pages/counsellor/CounsellorFeeCollectionList";
import CounsellorFeeCollectionDetail from "@/admin/pages/counsellor/CounsellorFeeCollectionDetail";

const CounsellorRoutes = () => (
  <Routes>
    <Route path="/" element={<RequireCounsellor><CounsellorDashboard /></RequireCounsellor>} />
    <Route path="/leads" element={<RequireCounsellor><CounsellorLeads /></RequireCounsellor>} />
    <Route path="/leads/:id" element={<RequireCounsellor><CounsellorLeadDetail /></RequireCounsellor>} />
    <Route path="/leads/new" element={<RequireCounsellor><CounsellorCreateLead /></RequireCounsellor>} />
    <Route path="/follow-ups" element={<RequireCounsellor><CounsellorFollowUps /></RequireCounsellor>} />
    <Route path="/call-logs" element={<RequireCounsellor><CounsellorCallLogs /></RequireCounsellor>} />
    <Route path="/fee-collection/dashboard" element={<RequireCounsellor><CounsellorFeeCollectionDashboard /></RequireCounsellor>} />
    <Route path="/fee-collection" element={<RequireCounsellor><CounsellorFeeCollectionList /></RequireCounsellor>} />
    <Route path="/fee-collection/:studentId" element={<RequireCounsellor><CounsellorFeeCollectionDetail /></RequireCounsellor>} />
  </Routes>
);

export default CounsellorRoutes;
