// import { useState } from "react";
// import { ChevronLeft, ChevronRight, Check, LogOut } from "lucide-react";
// import AdminLayout from "../../../components/AdminLayout";
// import { Button } from "@/components/ui/button";
// import CreateJobSidebar from "./CreateJobSidebar";
// import StepBasicInfo from "./steps/StepBasicInfo";
// import StepRoleDetails from "./steps/StepRoleDetails";
// import StepCompensation from "./steps/StepCompensation";
// import StepEligibility from "./steps/StepEligibility";
// import StepSettings from "./steps/StepSettings";
// import StepReview from "./steps/StepReview";
// import { CreateJobFormState, StepKey, STEPS, emptyCreateJobForm } from "./types";
// import { StepErrors, validateStep } from "./validation";

// interface CreateJobWizardProps {
//   onExit: () => void;
//   onSaveDraft: (form: CreateJobFormState) => void;
//   onPublish: (form: CreateJobFormState) => void;
// }

// const CreateJobWizard = ({ onExit, onSaveDraft, onPublish }: CreateJobWizardProps) => {
//   const [stepIndex, setStepIndex] = useState(0);
//   const [form, setForm] = useState<CreateJobFormState>(emptyCreateJobForm);
//   const [errors, setErrors] = useState<Partial<Record<StepKey, StepErrors>>>({});

//   const stepKey = STEPS[stepIndex].key;

//   const updateStep = <K extends keyof CreateJobFormState>(key: K, patch: Partial<CreateJobFormState[K]>) => {
//     setForm((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
//     setErrors((prev) => ({ ...prev, [key]: {} }));
//   };

//   const goTo = (index: number) => setStepIndex(index);

//   const handleNext = () => {
//     if (stepKey === "review") return;
//     const stepErrors = validateStep(stepKey, form[stepKey]);
//     if (Object.keys(stepErrors).length > 0) {
//       setErrors((prev) => ({ ...prev, [stepKey]: stepErrors }));
//       return;
//     }
//     setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
//   };

//   const handlePrev = () => setStepIndex((i) => Math.max(i - 1, 0));

//   const handlePublish = () => {
//     let firstInvalid = -1;
//     STEPS.forEach((step, index) => {
//       if (step.key === "review") return;
//       const stepErrors = validateStep(step.key, form[step.key as keyof CreateJobFormState]);
//       if (Object.keys(stepErrors).length > 0) {
//         setErrors((prev) => ({ ...prev, [step.key]: stepErrors }));
//         if (firstInvalid === -1) firstInvalid = index;
//       }
//     });
//     if (firstInvalid !== -1) {
//       setStepIndex(firstInvalid);
//       return;
//     }
//     onPublish(form);
//   };

//   return (
//     <AdminLayout
//       title="Create New Job"
//       subtitle={`Step ${stepIndex + 1} of 6 · ${STEPS[stepIndex].label}`}
//       actions={
//         <div className="flex items-center gap-4">
//           <button onClick={() => onSaveDraft(form)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
//             Save Draft
//           </button>
//           <button
//             onClick={onExit}
//             className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
//           >
//             Exit <LogOut size={13} />
//           </button>
//         </div>
//       }
//     >
//       <div className="flex gap-8">
//         <CreateJobSidebar activeIndex={stepIndex} onSelect={goTo} errorsByStep={errors} />

//         <div className="min-w-0 flex-1">
//           {stepKey === "basic" && (
//             <StepBasicInfo data={form.basic} errors={errors.basic ?? {}} update={(patch) => updateStep("basic", patch)} />
//           )}
//           {stepKey === "role" && (
//             <StepRoleDetails data={form.role} errors={errors.role ?? {}} update={(patch) => updateStep("role", patch)} />
//           )}
//           {stepKey === "compensation" && (
//             <StepCompensation
//               data={form.compensation}
//               errors={errors.compensation ?? {}}
//               update={(patch) => updateStep("compensation", patch)}
//             />
//           )}
//           {stepKey === "eligibility" && (
//             <StepEligibility
//               data={form.eligibility}
//               errors={errors.eligibility ?? {}}
//               update={(patch) => updateStep("eligibility", patch)}
//             />
//           )}
//           {stepKey === "settings" && (
//             <StepSettings
//               data={form.settings}
//               errors={errors.settings ?? {}}
//               update={(patch) => updateStep("settings", patch)}
//             />
//           )}
//           {stepKey === "review" && <StepReview form={form} goTo={goTo} />}

//           <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
//             <span className="text-xs text-muted-foreground">Career Portal Admin v2.0</span>
//             <div className="flex items-center gap-3">
//               {stepIndex > 0 && (
//                 <Button variant="outline" size="sm" onClick={handlePrev}>
//                   <ChevronLeft size={14} /> Previous Step
//                 </Button>
//               )}
//               {stepKey !== "review" ? (
//                 <Button size="sm" className="text-white" onClick={handleNext}>
//                   Next Step <ChevronRight size={14} />
//                 </Button>
//               ) : (
//                 <>
//                   <Button variant="outline" size="sm" onClick={() => onSaveDraft(form)}>
//                     Save as Draft
//                   </Button>
//                   <Button size="sm" className="text-white" onClick={handlePublish}>
//                     Publish Opportunity <Check size={14} />
//                   </Button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default CreateJobWizard;




// import { useEffect, useState } from "react";
// import { ChevronLeft, ChevronRight, Check, LogOut, Loader2 } from "lucide-react";
// import AdminLayout from "../../../components/AdminLayout";
// import { Button } from "@/components/ui/button";
// import CreateJobSidebar from "./CreateJobSidebar";
// import StepBasicInfo from "./steps/StepBasicInfo";
// import StepRoleDetails from "./steps/StepRoleDetails";
// import StepCompensation from "./steps/StepCompensation";
// import StepEligibility from "./steps/StepEligibility";
// import StepSettings from "./steps/StepSettings";
// import StepReview from "./steps/StepReview";
// import { CreateJobFormState, StepKey, STEPS, emptyCreateJobForm } from "./types";
// import { StepErrors, validateStep } from "./validation";
// import { opportunitiesApi, OpportunityWizardPayload } from "@/integrations/client";

// interface CreateJobWizardProps {
//   opportunityId?: string | null;
//   onExit: () => void;
//   onSaved: () => void;
// }

// const toWizardPayload = (form: CreateJobFormState, status?: "draft" | "published"): OpportunityWizardPayload => ({
//   basic: form.basic,
//   role: form.role,
//   compensation: form.compensation,
//   eligibility: form.eligibility,
//   settings: form.settings,
//   ...(status ? { status } : {}),
// });

// const CreateJobWizard = ({ opportunityId, onExit, onSaved }: CreateJobWizardProps) => {
//   const [stepIndex, setStepIndex] = useState(0);
//   const [form, setForm] = useState<CreateJobFormState>(emptyCreateJobForm);
//   const [errors, setErrors] = useState<Partial<Record<StepKey, StepErrors>>>({});
//   const [loadingInitial, setLoadingInitial] = useState(!!opportunityId);
//   const [savingAction, setSavingAction] = useState<"draft" | "publish" | null>(null);
//   const [apiError, setApiError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   const stepKey = STEPS[stepIndex].key;

//   useEffect(() => {
//     if (!opportunityId) return;
//     let cancelled = false;
//     (async () => {
//       try {
//         const res = await opportunitiesApi.getById(opportunityId);
//         if (cancelled) return;
//         const o = res.data;
//         setForm({
//           basic: {
//             companyEntity: o.companyEntity || "Acme Global Innovations",
//             internalJobCode: o.internalJobCode || "",
//             hiringManager: typeof o.hiringManager === "string" ? o.hiringManager : o.hiringManager?._id || "",
//             department: o.department || "",
//             primaryLocation: o.primaryLocation || "",
//             urgentRequirement: !!o.urgentRequirement,
//           },
//           role: {
//             jobTitle: o.jobTitle || "",
//             category: o.category || "",
//             employmentType: o.employmentType || "",
//             workMode: o.workMode || "Hybrid",
//             openings: String(o.openings ?? 1),
//             description: o.description || "",
//             responsibilities: o.responsibilities || "",
//             requiredSkills: o.requiredSkills || [],
//             niceToHaveSkills: o.niceToHaveSkills || [],
//           },
//           compensation: {
//             compensationType: o.compensationType || "Salary",
//             currency: o.currency || "USD ($)",
//             payMin: o.payMin != null ? String(o.payMin) : "",
//             payMax: o.payMax != null ? String(o.payMax) : "",
//             payPeriod: o.payPeriod || "Annual",
//             benefits: o.benefits || [],
//             performanceBonus: !!o.incentives?.performanceBonus,
//             performanceBonusValue: o.incentives?.performanceBonusValue != null ? String(o.incentives.performanceBonusValue) : "",
//             signOnBonus: !!o.incentives?.signOnBonus,
//             signOnBonusValue: o.incentives?.signOnBonusValue != null ? String(o.incentives.signOnBonusValue) : "",
//           },
//           eligibility: {
//             experienceLevel: o.eligibility?.experienceLevel || "",
//             minYears: o.eligibility?.minYears != null ? String(o.eligibility.minYears) : "",
//             education: o.eligibility?.education || "",
//             notes: o.eligibility?.notes || "",
//             workAuthRequired: !!o.eligibility?.workAuthRequired,
//             backgroundCheck: !!o.eligibility?.backgroundCheck,
//           },
//           settings: {
//             applicationDeadline: o.settings?.applicationDeadline ? o.settings.applicationDeadline.slice(0, 16) : "",
//             applicationLimit: o.settings?.applicationLimit != null ? String(o.settings.applicationLimit) : "",
//             visibility: o.settings?.visibility || "Internal",
//             autoScreening: o.settings?.autoScreening ?? true,
//             alertRecipients: o.settings?.alertRecipients || ["Hiring Manager", "Recruiter Team"],
//           },
//         });
//       } catch (err: any) {
//         if (!cancelled) setApiError(err?.message || "Failed to load opportunity");
//       } finally {
//         if (!cancelled) setLoadingInitial(false);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [opportunityId]);

//   const updateStep = <K extends keyof CreateJobFormState>(key: K, patch: Partial<CreateJobFormState[K]>) => {
//     setForm((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
//     setErrors((prev) => ({ ...prev, [key]: {} }));
//   };

//   const goTo = (index: number) => setStepIndex(index);

//   const handleNext = () => {
//     if (stepKey === "review") return;
//     const stepErrors = validateStep(stepKey, form[stepKey]);
//     if (Object.keys(stepErrors).length > 0) {
//       setErrors((prev) => ({ ...prev, [stepKey]: stepErrors }));
//       return;
//     }
//     setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
//   };

//   const handlePrev = () => setStepIndex((i) => Math.max(i - 1, 0));

//   const persistOpportunity = async (status: "draft" | "published") => {
//     const payload = toWizardPayload(form, status);
//     if (opportunityId) {
//       return opportunitiesApi.update(opportunityId, payload);
//     }
//     return opportunitiesApi.create(payload);
//   };

//   const handleSaveDraft = async () => {
//     setApiError(null);
//     setSuccessMessage(null);
//     setSavingAction("draft");
//     try {
//       await persistOpportunity("draft");
//       setSuccessMessage("Saved as draft");
//       onSaved();
//     } catch (err: any) {
//       setApiError(err?.message || "Failed to save draft");
//     } finally {
//       setSavingAction(null);
//     }
//   };

//   const handlePublish = async () => {
//     let firstInvalid = -1;
//     STEPS.forEach((step, index) => {
//       if (step.key === "review") return;
//       const stepErrors = validateStep(step.key, form[step.key as keyof CreateJobFormState]);
//       if (Object.keys(stepErrors).length > 0) {
//         setErrors((prev) => ({ ...prev, [step.key]: stepErrors }));
//         if (firstInvalid === -1) firstInvalid = index;
//       }
//     });
//     if (firstInvalid !== -1) {
//       setStepIndex(firstInvalid);
//       return;
//     }

//     setApiError(null);
//     setSuccessMessage(null);
//     setSavingAction("publish");
//     try {
//       await persistOpportunity("published");
//       setSuccessMessage("Opportunity published");
//       onSaved();
//     } catch (err: any) {
//       setApiError(err?.message || "Failed to publish opportunity");
//     } finally {
//       setSavingAction(null);
//     }
//   };

//   if (loadingInitial) {
//     return (
//       <AdminLayout title="Create New Job" subtitle="Loading…">
//         <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
//           <Loader2 size={16} className="animate-spin" /> Loading opportunity…
//         </div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout
//       title={opportunityId ? "Edit Job Opportunity" : "Create New Job"}
//       subtitle={`Step ${stepIndex + 1} of 6 · ${STEPS[stepIndex].label}`}
//       actions={
//         <div className="flex items-center gap-4">
//           <button
//             onClick={handleSaveDraft}
//             disabled={savingAction !== null}
//             className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
//           >
//             {savingAction === "draft" && <Loader2 size={13} className="animate-spin" />}
//             Save Draft
//           </button>
//           <button
//             onClick={onExit}
//             className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
//           >
//             Exit <LogOut size={13} />
//           </button>
//         </div>
//       }
//     >
//       {apiError && (
//         <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
//           {apiError}
//         </div>
//       )}
//       {successMessage && (
//         <div className="mb-4 rounded-lg border border-emerald-300/50 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950/20">
//           {successMessage}
//         </div>
//       )}

//       <div className="flex gap-8">
//         <CreateJobSidebar activeIndex={stepIndex} onSelect={goTo} errorsByStep={errors} />

//         <div className="min-w-0 flex-1">
//           {stepKey === "basic" && (
//             <StepBasicInfo data={form.basic} errors={errors.basic ?? {}} update={(patch) => updateStep("basic", patch)} />
//           )}
//           {stepKey === "role" && (
//             <StepRoleDetails data={form.role} errors={errors.role ?? {}} update={(patch) => updateStep("role", patch)} />
//           )}
//           {stepKey === "compensation" && (
//             <StepCompensation
//               data={form.compensation}
//               errors={errors.compensation ?? {}}
//               update={(patch) => updateStep("compensation", patch)}
//             />
//           )}
//           {stepKey === "eligibility" && (
//             <StepEligibility
//               data={form.eligibility}
//               errors={errors.eligibility ?? {}}
//               update={(patch) => updateStep("eligibility", patch)}
//             />
//           )}
//           {stepKey === "settings" && (
//             <StepSettings
//               data={form.settings}
//               errors={errors.settings ?? {}}
//               update={(patch) => updateStep("settings", patch)}
//             />
//           )}
//           {stepKey === "review" && <StepReview form={form} goTo={goTo} />}

//           <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
//             <span className="text-xs text-muted-foreground">Career Portal Admin v2.0</span>
//             <div className="flex items-center gap-3">
//               {stepIndex > 0 && (
//                 <Button variant="outline" size="sm" onClick={handlePrev} disabled={savingAction !== null}>
//                   <ChevronLeft size={14} /> Previous Step
//                 </Button>
//               )}
//               {stepKey !== "review" ? (
//                 <Button size="sm" className="text-white" onClick={handleNext}>
//                   Next Step <ChevronRight size={14} />
//                 </Button>
//               ) : (
//                 <>
//                   <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={savingAction !== null}>
//                     {savingAction === "draft" && <Loader2 size={14} className="animate-spin" />}
//                     Save as Draft
//                   </Button>
//                   <Button size="sm" className="text-white" onClick={handlePublish} disabled={savingAction !== null}>
//                     {savingAction === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
//                     Publish Opportunity
//                   </Button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default CreateJobWizard;








import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, LogOut, Loader2 } from "lucide-react";
import AdminLayout from "../../../components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CreateJobSidebar from "./CreateJobSidebar";
import StepBasicInfo from "./steps/StepBasicInfo";
import StepRoleDetails from "./steps/StepRoleDetails";
import StepCompensation from "./steps/StepCompensation";
import StepEligibility from "./steps/StepEligibility";
import StepSettings from "./steps/StepSettings";
import StepReview from "./steps/StepReview";
import { CreateJobFormState, StepKey, STEPS, emptyCreateJobForm } from "./types";
import { StepErrors, validateStep } from "./validation";
// ⚠️ Adjust to wherever opportunitiesApi actually lives in your client.ts
import { opportunitiesApi } from "@/integrations/client";

interface CreateJobWizardProps {
  opportunityId?: string | null; // present when editing an existing opportunity
  onExit: () => void;
  onSaved: () => void; // called after successful save (draft, publish, or update)
}

const unwrap = (res: any) => (res?.data !== undefined && res?.success === undefined ? res.data : res);

// Maps a backend Opportunity document back onto the wizard's flat form state
const mapOpportunityToForm = (o: any): CreateJobFormState => ({
  basic: {
    companyEntity: o.companyEntity || "",
    hiringPartner: typeof o.hiringPartner === "string" ? o.hiringPartner : o.hiringPartner?._id || "",
    internalJobCode: o.internalJobCode || "",
    hiringManager: typeof o.hiringManager === "string" ? o.hiringManager : o.hiringManager?._id || "",
    department: o.department || "",
    primaryLocation: o.primaryLocation || "",
    urgentRequirement: !!o.urgentRequirement,
  },
  role: {
    jobTitle: o.jobTitle || "",
    category: o.category || "",
    employmentType: o.employmentType || "",
    workMode: o.workMode || "Hybrid",
    openings: String(o.openings ?? 1),
    description: o.description || "",
    responsibilities: o.responsibilities || "",
    requiredSkills: o.requiredSkills || [],
    niceToHaveSkills: o.niceToHaveSkills || [],
  },
  compensation: {
    compensationType: o.compensationType || "Salary",
    currency: o.currency || "USD ($)",
    payMin: o.payMin != null ? String(o.payMin) : "",
    payMax: o.payMax != null ? String(o.payMax) : "",
    payPeriod: o.payPeriod || "Annual",
    benefits: o.benefits || [],
    performanceBonus: !!o.incentives?.performanceBonus,
    performanceBonusValue: o.incentives?.performanceBonusValue != null ? String(o.incentives.performanceBonusValue) : "",
    signOnBonus: !!o.incentives?.signOnBonus,
    signOnBonusValue: o.incentives?.signOnBonusValue != null ? String(o.incentives.signOnBonusValue) : "",
  },
  eligibility: {
    experienceLevel: o.eligibility?.experienceLevel || "",
    minYears: o.eligibility?.minYears != null ? String(o.eligibility.minYears) : "",
    education: o.eligibility?.education || "",
    notes: o.eligibility?.notes || "",
    workAuthRequired: !!o.eligibility?.workAuthRequired,
    backgroundCheck: !!o.eligibility?.backgroundCheck,
  },
  settings: {
    applicationDeadline: o.settings?.applicationDeadline
      ? new Date(o.settings.applicationDeadline).toISOString().slice(0, 16)
      : "",
    applicationLimit: o.settings?.applicationLimit != null ? String(o.settings.applicationLimit) : "",
    visibility: o.settings?.visibility || "Internal",
    autoScreening: o.settings?.autoScreening ?? true,
    alertRecipients: o.settings?.alertRecipients || [],
  },
});

// Maps wizard form state → the {basic, role, compensation, eligibility, settings} payload the backend expects
const buildPayload = (form: CreateJobFormState, status?: "draft" | "published") => ({
  basic: form.basic,
  role: {
    ...form.role,
    openings: Number(form.role.openings) || 1,
  },
  compensation: {
    ...form.compensation,
    payMin: form.compensation.payMin === "" ? null : Number(form.compensation.payMin),
    payMax: form.compensation.payMax === "" ? null : Number(form.compensation.payMax),
    performanceBonusValue:
      form.compensation.performanceBonusValue === "" ? null : Number(form.compensation.performanceBonusValue),
    signOnBonusValue: form.compensation.signOnBonusValue === "" ? null : Number(form.compensation.signOnBonusValue),
  },
  eligibility: {
    ...form.eligibility,
    minYears: form.eligibility.minYears === "" ? null : Number(form.eligibility.minYears),
  },
  settings: {
    ...form.settings,
    applicationLimit: form.settings.applicationLimit === "" ? null : Number(form.settings.applicationLimit),
  },
  ...(status ? { status } : {}),
});

const CreateJobWizard = ({ opportunityId, onExit, onSaved }: CreateJobWizardProps) => {
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<CreateJobFormState>(emptyCreateJobForm);
  const [errors, setErrors] = useState<Partial<Record<StepKey, StepErrors>>>({});
  const [loading, setLoading] = useState(!!opportunityId);
  const [saving, setSaving] = useState(false);

  const isEditing = !!opportunityId;
  const stepKey = STEPS[stepIndex].key;

  // Load existing opportunity when editing
  useEffect(() => {
    if (!opportunityId) return;
    (async () => {
      setLoading(true);
      try {
        const res = unwrap(await opportunitiesApi.getById(opportunityId));
        if (!res?.success) throw new Error(res?.message || "Failed to load opportunity");
        setForm(mapOpportunityToForm(res.data));
      } catch (err: any) {
        toast({
          title: "Failed to load opportunity",
          description: err?.message || "Please try again.",
          variant: "destructive",
        });
        onExit();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunityId]);

  const updateStep = <K extends keyof CreateJobFormState>(key: K, patch: Partial<CreateJobFormState[K]>) => {
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    setErrors((prev) => ({ ...prev, [key]: {} }));
  };

  const goTo = (index: number) => setStepIndex(index);

  const handleNext = () => {
    if (stepKey === "review") return;
    const stepErrors = validateStep(stepKey, form[stepKey]);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, [stepKey]: stepErrors }));
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const handlePrev = () => setStepIndex((i) => Math.max(i - 1, 0));

  const validateAllSteps = () => {
    let firstInvalid = -1;
    STEPS.forEach((step, index) => {
      if (step.key === "review") return;
      const stepErrors = validateStep(step.key, form[step.key as keyof CreateJobFormState]);
      if (Object.keys(stepErrors).length > 0) {
        setErrors((prev) => ({ ...prev, [step.key]: stepErrors }));
        if (firstInvalid === -1) firstInvalid = index;
      }
    });
    return firstInvalid;
  };

  const persist = async (status?: "draft" | "published") => {
    setSaving(true);
    try {
      const payload = buildPayload(form, status);
      const res = unwrap(
        isEditing ? await opportunitiesApi.update(opportunityId!, payload) : await opportunitiesApi.create(payload)
      );
      if (!res?.success) throw new Error(res?.message || "Failed to save opportunity");

      toast({
        title: status === "published" ? "Opportunity published" : "Draft saved",
        description: `${form.role.jobTitle || "This opportunity"} has been saved successfully.`,
      });
      onSaved();
    } catch (err: any) {
      toast({
        title: "Failed to save opportunity",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => persist("draft");

  const handlePublish = () => {
    const firstInvalid = validateAllSteps();
    if (firstInvalid !== -1) {
      setStepIndex(firstInvalid);
      return;
    }
    persist("published");
  };

  if (loading) {
    return (
      <AdminLayout title="Loading..." subtitle="">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading opportunity...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEditing ? "Edit Job Opportunity" : "Create New Job"}
      subtitle={`Step ${stepIndex + 1} of 6 · ${STEPS[stepIndex].label}`}
      actions={
        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Exit <LogOut size={13} />
          </button>
        </div>
      }
    >
      <div className="flex gap-8">
        <CreateJobSidebar activeIndex={stepIndex} onSelect={goTo} errorsByStep={errors} />

        <div className="min-w-0 flex-1">
          {stepKey === "basic" && (
            <StepBasicInfo data={form.basic} errors={errors.basic ?? {}} update={(patch) => updateStep("basic", patch)} />
          )}
          {stepKey === "role" && (
            <StepRoleDetails data={form.role} errors={errors.role ?? {}} update={(patch) => updateStep("role", patch)} />
          )}
          {stepKey === "compensation" && (
            <StepCompensation
              data={form.compensation}
              errors={errors.compensation ?? {}}
              update={(patch) => updateStep("compensation", patch)}
            />
          )}
          {stepKey === "eligibility" && (
            <StepEligibility
              data={form.eligibility}
              errors={errors.eligibility ?? {}}
              update={(patch) => updateStep("eligibility", patch)}
            />
          )}
          {stepKey === "settings" && (
            <StepSettings
              data={form.settings}
              errors={errors.settings ?? {}}
              update={(patch) => updateStep("settings", patch)}
            />
          )}
          {stepKey === "review" && <StepReview form={form} goTo={goTo} />}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <span className="text-xs text-muted-foreground">Career Portal Admin v2.0</span>
            <div className="flex items-center gap-3">
              {stepIndex > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrev} disabled={saving}>
                  <ChevronLeft size={14} /> Previous Step
                </Button>
              )}
              {stepKey !== "review" ? (
                <Button size="sm" className="text-white" onClick={handleNext} disabled={saving}>
                  Next Step <ChevronRight size={14} />
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save as Draft
                  </Button>
                  <Button size="sm" className="text-white" onClick={handlePublish} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publish Opportunity <Check size={14} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateJobWizard;
