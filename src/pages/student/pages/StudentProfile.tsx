// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/contexts/AuthContext";
// import useStudentDashboard from "@/hooks/useStudentDashboard";
// import { studentProfileService } from "@/services/student.service";
// import StudentLayout from "../components/StudentLayout";
// import ProfileHeader from "../components/profile/ProfileHeader";
// import PersonalInformation from "../components/profile/PersonalInformation";
// import AddressSection from "../components/profile/AddressSection";
// import EducationSection from "../components/profile/EducationSection";

// const Profile = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { student, profile, assignment, loading, refresh } = useStudentDashboard();

//   const [form, setForm] = useState({
//     fullName: "", mobileNumber: "", dob: "", gender: "",
//     city: "", state: "", pincode: "", address: "",
//     qualification: "", college: "", degree: "", passingYear: "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     if (!profile) return;
//     setForm({
//       fullName: profile.fullName || student?.fullName || "",
//       mobileNumber: profile.mobileNumber || "",
//       dob: profile.dob ? profile.dob.slice(0, 10) : "",
//       gender: profile.gender || "",
//       city: profile.city || "",
//       state: profile.state || "",
//       pincode: profile.pincode || "",
//       address: profile.address || "",
//       qualification: profile.qualification || "",
//       college: profile.college || "",
//       degree: profile.degree || "",
//       passingYear: profile.passingYear || "",
//     });
//   }, [profile, student]);

//   const handleChange = (field: string, value: string) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSave = async () => {
//     setError("");
//     setSuccess("");
//     setSaving(true);
//     try {
//       const formData = new FormData();
//       Object.entries(form).forEach(([key, value]) => formData.append(key, value));

//       if (profile) {
//         await studentProfileService.updateProfile(formData);
//       } else {
//         await studentProfileService.createProfile(formData);
//       }
//       setSuccess("Profile updated successfully!");
//       await refresh();
//     } catch (err: any) {
//       setError(err?.message || "Failed to update profile.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading && !profile) {
//     return (
//       <StudentLayout title="Student Profile">
//         <div className="flex h-[50vh] items-center justify-center">
//           <Loader2 className="h-6 w-6 animate-spin text-[#0037FF]" />
//         </div>
//       </StudentLayout>
//     );
//   }

//   const course = assignment && typeof assignment.course === "object" ? assignment.course : null;
//   const mentor = assignment && assignment.mentor && typeof assignment.mentor === "object" ? assignment.mentor : null;

//   return (
//     <StudentLayout title="Student Profile" subtitle="Manage your personal information">
//       <div className="space-y-6">
//         <ProfileHeader
//           fullName={student?.fullName || user?.fullName || "Student"}
//           studentId={student?.studentId ?? user?.studentId ?? null}
//           courseTitle={course?.title}
//           mentorName={mentor?.name}
//           batchStatus={assignment?.status}
//         />

//         {!profile && (
//           <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
//             <span>Your profile isn't complete yet. Fill in the details below.</span>
//           </div>
//         )}

//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-8"
//         >
//           {error && (
//             <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
//               <AlertCircle className="h-4 w-4 shrink-0" /> {error}
//             </div>
//           )}
//           {success && (
//             <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700">
//               <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
//             </div>
//           )}

//           <PersonalInformation
//             values={{ fullName: form.fullName, email: user?.email || "", mobileNumber: form.mobileNumber, dob: form.dob, gender: form.gender }}
//             onChange={handleChange as any}
//           />
//           <AddressSection
//             values={{ city: form.city, state: form.state, pincode: form.pincode, address: form.address }}
//             onChange={handleChange as any}
//           />
//           <EducationSection
//             values={{ qualification: form.qualification, college: form.college, degree: form.degree, passingYear: form.passingYear }}
//             onChange={handleChange as any}
//           />

//           <div className="flex justify-end">
//             <Button onClick={handleSave} disabled={saving} className="text-white">
//               {saving ? (
//                 <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
//               ) : (
//                 <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</span>
//               )}
//             </Button>
//           </div>
//         </motion.div>
//       </div>
//     </StudentLayout>
//   );
// };

// export default Profile;





import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import useStudentDashboard from "@/hooks/useStudentDashboard";
import { studentProfileService } from "@/services/student.service";
import StudentLayout from "../components/StudentLayout";

type FormState = {
  fullName: string;
  mobileNumber: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  qualification: string;
  college: string;
  degree: string;
  passingYear: string;
};

const EMPTY_FORM: FormState = {
  fullName: "",
  mobileNumber: "",
  dob: "",
  gender: "",
  city: "",
  state: "",
  pincode: "",
  address: "",
  qualification: "",
  college: "",
  degree: "",
  passingYear: "",
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Profile = () => {
  const { user } = useAuth();
  const { student, profile, assignment, loading, refresh } = useStudentDashboard();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm({
      fullName: profile?.fullName || student?.fullName || "",
      mobileNumber: profile?.mobileNumber || "",
      dob: profile?.dob ? profile.dob.slice(0, 10) : "",
      gender: profile?.gender || "",
      city: profile?.city || "",
      state: profile?.state || "",
      pincode: profile?.pincode || "",
      address: profile?.address || "",
      qualification: profile?.qualification || "",
      college: profile?.college || "",
      degree: profile?.degree || "",
      passingYear: profile?.passingYear || "",
    });
  }, [profile, student]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));

      if (profile) {
        await studentProfileService.updateProfile(formData);
      } else {
        await studentProfileService.createProfile(formData);
      }
      setSuccess("Profile updated successfully!");
      await refresh();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <StudentLayout title="Profile">
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0037FF]" />
        </div>
      </StudentLayout>
    );
  }

  const displayName = student?.fullName || user?.fullName || "Student";
  const studentId = student?.studentId || user?.studentId || "—";
  const course = assignment && typeof assignment.course === "object" ? assignment.course : null;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <StudentLayout
      title="Profile"
      subtitle="Manage your personal & academic information."
      actions={
        <Button onClick={handleSave} disabled={saving} className="text-white">
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </span>
          ) : (
            "Save changes"
          )}
        </Button>
      }
    >
      {(error || success) && (
        <div className="mb-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* ── Left: profile summary card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 h-fit"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0037FF] text-lg font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">{studentId}</p>
              <p className="text-xs text-muted-foreground truncate">
                {course?.title || "No course assigned"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Batch</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {assignment?.status ? "Active" : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Mentor</p>
              <p className="mt-1 text-sm font-semibold text-foreground truncate">
                {assignment?.mentor && typeof assignment.mentor === "object"
                  ? assignment.mentor.name
                  : "—"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Right: editable sections ── */}
        <div className="space-y-6">
          {/* Personal information */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="text-sm font-semibold text-foreground mb-5">Personal information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Full name">
                <Input value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
              </FormField>
              <FormField label="Student ID">
                <Input value={studentId} disabled className="bg-muted/40" />
              </FormField>
              <FormField label="Mobile">
                <Input value={form.mobileNumber} onChange={(e) => handleChange("mobileNumber", e.target.value)} />
              </FormField>
              <FormField label="Email">
                <Input value={user?.email || ""} disabled className="bg-muted/40" />
              </FormField>
              <FormField label="Date of birth">
                <Input type="date" value={form.dob} onChange={(e) => handleChange("dob", e.target.value)} />
              </FormField>
              <FormField label="Gender">
                <select
                  value={form.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>
              <FormField label="City">
                <Input value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
              </FormField>
              <FormField label="State">
                <Input value={form.state} onChange={(e) => handleChange("state", e.target.value)} />
              </FormField>
              <FormField label="Pincode">
                <Input value={form.pincode} onChange={(e) => handleChange("pincode", e.target.value)} />
              </FormField>
              <FormField label="Address">
                <Input value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
              </FormField>
            </div>
          </motion.div>

          {/* Education */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="text-sm font-semibold text-foreground mb-5">Education</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Qualification">
                <Input value={form.qualification} onChange={(e) => handleChange("qualification", e.target.value)} />
              </FormField>
              <FormField label="College">
                <Input value={form.college} onChange={(e) => handleChange("college", e.target.value)} />
              </FormField>
              <FormField label="Degree">
                <Input value={form.degree} onChange={(e) => handleChange("degree", e.target.value)} />
              </FormField>
              <FormField label="Passing year">
                <Input value={form.passingYear} onChange={(e) => handleChange("passingYear", e.target.value)} />
              </FormField>
            </div>
          </motion.div>
        </div>
      </div>
    </StudentLayout>
  );
};

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default Profile;