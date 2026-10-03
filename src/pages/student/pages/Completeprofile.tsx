import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useStudentProfile from "@/hooks/useStudentProfile";
import useStudentAssignment from "@/hooks/useStudentAssignment";
import StudentLayout from "../components/StudentLayout";

const GOVT_ID_TYPES = ["Aadhaar", "PAN", "Driving License", "Passport"] as const;
const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

type FormState = {
  fullName: string;
  dob: string;
  fatherName: string;
  mobileNumber: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  govtIdType: string;
  govtIdNumber: string;
};

const EMPTY_FORM: FormState = {
  fullName: "",
  dob: "",
  fatherName: "",
  mobileNumber: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  govtIdType: "",
  govtIdNumber: "",
};

const CompleteProfile = () => {
  const navigate = useNavigate();

  const {
    profile,
    loading: profileLoading,
    saving: profileSaving,
    error: profileError,
    createProfile,
    updateProfile,
  } = useStudentProfile();

  const {
    assignment,
    loading: assignmentLoading,
    error: assignmentError,
  } = useStudentAssignment();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!profile) return;

    setForm({
      fullName: profile.fullName || "",
      dob: profile.dob ? profile.dob.slice(0, 10) : "",
      fatherName: profile.fatherName || "",
      mobileNumber: profile.mobileNumber || "",
      gender: profile.gender || "",
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      pincode: profile.pincode || "",
      govtIdType: profile.govtIdType || "",
      govtIdNumber: profile.govtIdNumber || "",
    });

    if (profile.govtIdImageUrl) {
      setImagePreview(profile.govtIdImageUrl);
    }
  }, [profile]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const isExistingProfile = Boolean(profile);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) formData.append("govtIdImage", imageFile);

    setSubmitting(true);
    try {
      const res = isExistingProfile
        ? await updateProfile(formData)
        : await createProfile(formData);

      setSuccess(res.message || "Profile saved successfully!");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = profileLoading || assignmentLoading;
  const loadError = profileError || assignmentError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-[#0037FF]" />
      </div>
    );
  }

  return (
    <StudentLayout title={profile ? "Update Your Profile" : "Complete Your Profile"}>
      <div className="min-h-screen bg-muted/30 py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto bg-background rounded-2xl border border-border shadow-sm p-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {profile ? "Update Your Profile" : "Complete Your Profile"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {profile
              ? "Update your details below."
              : "Please fill in your details before accessing your dashboard."}
          </p>

          {loadError && (
            <div className="flex items-center gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {loadError}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 mb-5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ── Personal Details ── */}
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                Personal Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <Input
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Date of Birth">
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Father's Name">
                  <Input
                    value={form.fatherName}
                    onChange={(e) => handleChange("fatherName", e.target.value)}
                  />
                </Field>
                <Field label="Gender">
                  <select
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="h-12 w-full rounded-xl border border-border/60 bg-muted/30 px-3 text-sm focus:bg-background transition-colors"
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Mobile Number">
                  <Input
                    value={form.mobileNumber}
                    onChange={(e) => handleChange("mobileNumber", e.target.value)}
                    placeholder="10-digit mobile number"
                    required
                  />
                </Field>
                <Field label="Pincode">
                  <Input
                    value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    placeholder="6-digit pincode"
                    required
                  />
                </Field>
                <Field label="Address" className="sm:col-span-2">
                  <Input
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    required
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                  />
                </Field>
                <Field label="State">
                  <Input
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    required
                  />
                </Field>
              </div>
            </section>

            {/* ── Identity Verification (optional) ── */}
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                Identity Verification <span className="normal-case text-muted-foreground font-normal">(optional)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Government ID Type">
                  <select
                    value={form.govtIdType}
                    onChange={(e) => handleChange("govtIdType", e.target.value)}
                    className="h-12 w-full rounded-xl border border-border/60 bg-muted/30 px-3 text-sm focus:bg-background transition-colors"
                  >
                    <option value="">Select ID type</option>
                    {GOVT_ID_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Government ID Number">
                  <Input
                    value={form.govtIdNumber}
                    onChange={(e) => handleChange("govtIdNumber", e.target.value)}
                  />
                </Field>
                <Field label="Government ID Front Image" className="sm:col-span-2">
                  <label className="flex items-center gap-4 cursor-pointer rounded-xl border border-dashed border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Govt ID preview"
                        className="h-16 w-24 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="h-16 w-24 flex items-center justify-center rounded-lg bg-muted">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium text-[#0037FF]">
                        {imagePreview ? "Change image" : "Upload image"}
                      </span>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        JPG, PNG or WEBP — max 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </Field>
              </div>
            </section>

            {/* ── Assigned Course & Mentor (readonly — admin-assigned) ── */}
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                Enrollment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-muted p-4">
                  <p className="text-xs text-muted-foreground">Course</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {assignment && typeof assignment.course === "object"
                      ? assignment.course.title
                      : "Not assigned yet — your admin will assign this"}
                  </p>
                  {assignment && typeof assignment.course === "object" && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {assignment.course.category ?? ""}
                      {assignment.course.level ? ` · ${assignment.course.level}` : ""}
                    </p>
                  )}
                </div>
                <div className="rounded-2xl border border-border bg-muted p-4">
                  <p className="text-xs text-muted-foreground">Mentor</p>
                  {assignment?.mentor && typeof assignment.mentor === "object" ? (
                    <>
                      <p className="mt-2 font-semibold text-foreground">{assignment.mentor.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{assignment.mentor.email}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Not assigned yet.</p>
                  )}
                </div>
              </div>
            </section>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full h-12 rounded-xl text-base font-semibold text-white"
              disabled={submitting || profileSaving}
            >
              {submitting || profileSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : profile ? (
                "Update Profile"
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </StudentLayout>
  );
};

const Field = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    {children}
  </div>
);

export default CompleteProfile;