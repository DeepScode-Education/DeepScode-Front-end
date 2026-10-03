import { CreateJobFormState, StepKey } from "./types";

export type StepErrors = Record<string, string>;

export function validateStep(key: StepKey, data: CreateJobFormState[keyof CreateJobFormState]): StepErrors {
  const errors: StepErrors = {};

 if (key === "basic") {
  const d = data as CreateJobFormState["basic"];
  if (!d.hiringPartner) errors.hiringPartner = "Required";
  if (!d.hiringManager) errors.hiringManager = "Required";
  if (!d.department) errors.department = "Required";
  if (!d.primaryLocation) errors.primaryLocation = "Required";
}

  if (key === "role") {
    const d = data as CreateJobFormState["role"];
    if (!d.jobTitle.trim()) errors.jobTitle = "Required";
    if (!d.category) errors.category = "Required";
    if (!d.employmentType) errors.employmentType = "Required";
    if (!d.description.trim()) errors.description = "Required";
    if (!d.responsibilities.trim()) errors.responsibilities = "Required";
    if (d.requiredSkills.length === 0) errors.requiredSkills = "Add at least one required skill";
  }

  if (key === "compensation") {
    const d = data as CreateJobFormState["compensation"];
    if (!d.compensationType) errors.compensationType = "Required";
    if (!d.currency) errors.currency = "Required";
    if (!d.payMin) errors.payMin = "Required";
    if (!d.payMax) errors.payMax = "Required";
    if (d.payMin && d.payMax && Number(d.payMin) > Number(d.payMax)) {
      errors.payMax = "Must be greater than minimum";
    }
  }

  if (key === "eligibility") {
    const d = data as CreateJobFormState["eligibility"];
    if (!d.experienceLevel) errors.experienceLevel = "Required";
    if (!d.education) errors.education = "Required";
  }

  if (key === "settings") {
    const d = data as CreateJobFormState["settings"];
    if (!d.applicationDeadline) errors.applicationDeadline = "Required";
  }

  return errors;
}
