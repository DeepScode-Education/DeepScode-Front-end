export interface BasicInfoData {
    companyEntity: string;
  hiringPartner: string;    
  internalJobCode: string;
  hiringManager: string;
  department: string;
  primaryLocation: string;
  urgentRequirement: boolean;
}

export interface RoleDetailsData {
  jobTitle: string;
  category: string;
  employmentType: string;
  workMode: "On-site" | "Hybrid" | "Remote";
  openings: string;
  description: string;
  responsibilities: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
}

export interface CompensationData {
  compensationType: string;
  currency: string;
  payMin: string;
  payMax: string;
  payPeriod: "Annual" | "Monthly";
  benefits: string[];
  performanceBonus: boolean;
  performanceBonusValue: string;
  signOnBonus: boolean;
  signOnBonusValue: string;
}

export interface EligibilityData {
  experienceLevel: string;
  minYears: string;
  education: string;
  notes: string;
  workAuthRequired: boolean;
  backgroundCheck: boolean;
}

export interface SettingsData {
  applicationDeadline: string;
  applicationLimit: string;
  visibility: "Internal" | "Public";
  autoScreening: boolean;
  alertRecipients: string[];
}

export interface HiringPartnerOption {
  _id: string;
  companyName: string;
  isActive: boolean;
}

export interface CreateJobFormState {
  basic: BasicInfoData;
  role: RoleDetailsData;
  compensation: CompensationData;
  eligibility: EligibilityData;
  settings: SettingsData;
}

export type StepKey = "basic" | "role" | "compensation" | "eligibility" | "settings" | "review";

export interface StepDef {
  key: StepKey;
  label: string;
}

export const STEPS: StepDef[] = [
  { key: "basic", label: "Basic Info" },
  { key: "role", label: "Role Details" },
  { key: "compensation", label: "Compensation" },
  { key: "eligibility", label: "Eligibility" },
  { key: "settings", label: "Settings" },
  { key: "review", label: "Review" },
];

export const emptyCreateJobForm: CreateJobFormState = {
  basic: {
     companyEntity: "",
    hiringPartner: "",         
    internalJobCode: "",
    hiringManager: "",
    department: "",
    primaryLocation: "",
    urgentRequirement: false,
  },
  role: {
    jobTitle: "",
    category: "",
    employmentType: "",
    workMode: "Hybrid",
    openings: "1",
    description: "",
    responsibilities: "",
    requiredSkills: [],
    niceToHaveSkills: [],
  },
  compensation: {
    compensationType: "Salary",
    currency: "USD ($)",
    payMin: "",
    payMax: "",
    payPeriod: "Annual",
    benefits: [],
    performanceBonus: false,
    performanceBonusValue: "",
    signOnBonus: false,
    signOnBonusValue: "",
  },
  eligibility: {
    experienceLevel: "",
    minYears: "",
    education: "",
    notes: "",
    workAuthRequired: false,
    backgroundCheck: false,
  },
  settings: {
    applicationDeadline: "",
    applicationLimit: "",
    visibility: "Internal",
    autoScreening: true,
    alertRecipients: ["Hiring Manager", "Recruiter Team"],
  },
};
