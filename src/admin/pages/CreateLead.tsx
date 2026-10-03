
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import AdminLayout from "../components/AdminLayout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/components/ui/use-toast";
// import { createLead } from "../hooks/useLeads";
// import { useCourses } from "../hooks/useCourses";

// // const COURSE_OPTIONS = [
// //   { value: "UiUX", label: "UI/UX Design" },
// //   { value: "GraphicDesign", label: "Graphic Design" },
// //   { value: "MotionVFX", label: "Motion Graphics & VFX" },
// //   { value: "3D", label: "3D Design & Animation" },
// //   { value: "Marketing", label: "Digital Marketing" },
// //   { value: "Data", label: "Data Analytics" },
// // ];

// const SOURCE_OPTIONS = [
//     "Manual", "WhatsApp", "Instagram", "Facebook", "Referral",
//   "Website"
// ];

// const MOBILE_REGEX = /^[6-9]\d{9}$/;

// const initialState = {
//   fullName: "",
//   mobileNumber: "",
//   email: "",
//   course: "",
//   source: "Manual",
//   remarks: "",
// };

// const CreateLead = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [form, setForm] = useState(initialState);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [submitting, setSubmitting] = useState(false);
//   const { courses, loading: coursesLoading } = useCourses();

//   const setField = (key: keyof typeof initialState, value: string) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//     if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
//   };

//   const validate = () => {
//     const next: Record<string, string> = {};
//     if (!form.fullName.trim()) next.fullName = "Full name is required";

//     if (!form.mobileNumber.trim()) {
//       next.mobileNumber = "Mobile number is required";
//     } else if (!MOBILE_REGEX.test(form.mobileNumber.trim())) {
//       next.mobileNumber = "Enter a valid 10-digit Indian mobile number";
//     }

//     if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
//       next.email = "Enter a valid email address";
//     }

//     if (!form.course) next.course = "Course is required";

//     setErrors(next);
//     return Object.keys(next).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setSubmitting(true);
//     try {
//       const data = await createLead({
//         fullName: form.fullName.trim(),
//         mobileNumber: form.mobileNumber.trim(),
//         email: form.email.trim() || undefined,
//         course: form.course,
//         source: form.source || "Manual",
//         remarks: form.remarks.trim(),
//       });

//       if (!data.success) {
//         throw new Error(data.message || "Failed to create lead");
//       }

//       toast({
//         title: "Lead created",
//         description: `${form.fullName} has been added successfully.`,
//       });

//       navigate("/admin/leads");
//     } catch (err: any) {
//       toast({
//         title: "Could not create lead",
//         description: err.message || "Something went wrong. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <AdminLayout title="Add Lead" subtitle="Manually log a new lead into the CRM.">
//       <Card className="max-w-2xl">
//         <CardHeader>
//           <CardTitle className="text-base">Lead Details</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="fullName">Full Name *</Label>
//               <Input
//                 id="fullName"
//                 value={form.fullName}
//                 onChange={(e) => setField("fullName", e.target.value)}
//                 placeholder="e.g. Priya Sharma"
//               />
//               {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
//             </div>

//             <div>
//               <Label htmlFor="mobileNumber">Mobile Number *</Label>
//               <Input
//                 id="mobileNumber"
//                 value={form.mobileNumber}
//                 onChange={(e) => setField("mobileNumber", e.target.value)}
//                 placeholder="10-digit mobile number"
//                 maxLength={10}
//               />
//               {errors.mobileNumber && <p className="mt-1 text-xs text-destructive">{errors.mobileNumber}</p>}
//             </div>

//             <div>
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={form.email}
//                 onChange={(e) => setField("email", e.target.value)}
//                 placeholder="optional"
//               />
//               {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
//             </div>

//             <div>
//               <Label htmlFor="course">Course *</Label>
//              <select
//   id="course"
//   value={form.course}
//   onChange={(e) => setField("course", e.target.value)}
//   className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
//   disabled={coursesLoading}
// >
//   <option value="">{coursesLoading ? "Loading courses…" : "Select a course"}</option>
//   {courses.map((c) => (
//     <option key={c._id} value={c._id}>{c.title}</option>
//   ))}
// </select>
//               {errors.course && <p className="mt-1 text-xs text-destructive">{errors.course}</p>}
//             </div>

//             <div>
//               <Label htmlFor="source">Lead Source</Label>
//               <select
//                 id="source"
//                 value={form.source}
//                 onChange={(e) => setField("source", e.target.value)}
//                 className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
//               >
//                 {SOURCE_OPTIONS.map((s) => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <Label htmlFor="remarks">Remarks</Label>
//               <Textarea
//                 id="remarks"
//                 value={form.remarks}
//                 onChange={(e) => setField("remarks", e.target.value)}
//                 placeholder="Optional notes about this lead"
//                 rows={3}
//               />
//             </div>

//             <div className="flex justify-end gap-2 pt-2">
//               <Button type="button" variant="outline" onClick={() => navigate("/admin/leads")} disabled={submitting}>
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={submitting} className="text-white">
//                 {submitting ? "Saving..." : "Save Lead"}
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </AdminLayout>
//   );
// };

// export default CreateLead;





import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createLead } from "../hooks/useLeads";
import { useCourses } from "../hooks/useCourses";

const SOURCE_OPTIONS = [
  "Manual", "WhatsApp", "Instagram", "Facebook", "Referral",
  "Website"
];

const MOBILE_REGEX = /^[6-9]\d{9}$/;

// Strips spaces, +91/91 country code prefix, and any non-digit characters,
// then keeps only the last 10 digits — so "+91 97087 02525" or
// "97087 02525" both correctly resolve to "9708702525" instead of
// getting truncated by raw character counting.
const sanitizeMobileInput = (raw: string) => {
  let digits = raw.replace(/\D/g, "");

  if (digits.length > 10 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
};

const initialState = {
  fullName: "",
  mobileNumber: "",
  email: "",
  course: "",
  source: "Manual",
  remarks: "",
};

const CreateLead = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { courses, loading: coursesLoading } = useCourses();

  const setField = (key: keyof typeof initialState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";

    if (!form.mobileNumber.trim()) {
      next.mobileNumber = "Mobile number is required";
    } else if (!MOBILE_REGEX.test(form.mobileNumber.trim())) {
      next.mobileNumber = "Enter a valid 10-digit Indian mobile number";
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address";
    }

    if (!form.course) next.course = "Course is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = await createLead({
        fullName: form.fullName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        email: form.email.trim() || undefined,
        course: form.course,
        source: form.source || "Manual",
        remarks: form.remarks.trim(),
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to create lead");
      }

      toast({
        title: "Lead created",
        description: `${form.fullName} has been added successfully.`,
      });

      navigate("/admin/leads");
    } catch (err: any) {
      toast({
        title: "Could not create lead",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Add Lead" subtitle="Manually log a new lead into the CRM.">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Lead Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="e.g. Priya Sharma"
              />
              {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div>
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                value={form.mobileNumber}
                onChange={(e) => setField("mobileNumber", sanitizeMobileInput(e.target.value))}
                placeholder="10-digit mobile number (+91 also works)"
                maxLength={13}
              />
              {errors.mobileNumber && <p className="mt-1 text-xs text-destructive">{errors.mobileNumber}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="optional"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="course">Course *</Label>
              <select
                id="course"
                value={form.course}
                onChange={(e) => setField("course", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                disabled={coursesLoading}
              >
                <option value="">{coursesLoading ? "Loading courses…" : "Select a course"}</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
              {errors.course && <p className="mt-1 text-xs text-destructive">{errors.course}</p>}
            </div>

            <div>
              <Label htmlFor="source">Lead Source</Label>
              <select
                id="source"
                value={form.source}
                onChange={(e) => setField("source", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={form.remarks}
                onChange={(e) => setField("remarks", e.target.value)}
                placeholder="Optional notes about this lead"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/admin/leads")} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="text-white">
                {submitting ? "Saving..." : "Save Lead"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default CreateLead;